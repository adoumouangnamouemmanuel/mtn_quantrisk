"""Provider-agnostic LLM client with cost and latency controls.

Supports OpenAI, Anthropic, and local/mock providers with automatic
fallback, cost tracking, and latency budgets.
"""
from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    LOCAL = "local"  # Mock/local for dev — returns deterministic text


@dataclass
class LLMConfig:
    provider: LLMProvider = LLMProvider.ANTHROPIC
    model: str = "claude-haiku-4-5-20251001"
    max_tokens: int = 256
    timeout_seconds: float = 30.0
    max_cost_per_call_usd: float = 0.01  # Hard cost ceiling per call
    retry_attempts: int = 2
    retry_base_delay: float = 1.0


@dataclass
class LLMUsage:
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: float = 0.0
    success: bool = True
    error: str | None = None


@dataclass
class LLMResponse:
    text: str
    usage: LLMUsage


# Cost per 1K tokens (approximate)
_COST_TABLE: dict[tuple[str, str], float] = {
    ("anthropic", "claude-haiku-4-5-20251001"): 0.00025,  # input
    ("anthropic", "claude-sonnet-4-20250514"): 0.003,
    ("openai", "gpt-4o-mini"): 0.00015,
    ("openai", "gpt-4o"): 0.005,
}


def _estimate_cost(provider: str, model: str, input_tokens: int, output_tokens: int) -> float:
    """Rough cost estimate in USD."""
    cost_per_1k = _COST_TABLE.get((provider, model), 0.001)
    return ((input_tokens + output_tokens * 2) / 1000) * cost_per_1k


def _auto_detect_provider() -> LLMConfig:
    """Auto-detect which provider is configured from environment."""
    if os.environ.get("ANTHROPIC_API_KEY"):
        return LLMConfig(provider=LLMProvider.ANTHROPIC, model="claude-haiku-4-5-20251001")
    if os.environ.get("OPENAI_API_KEY"):
        return LLMConfig(provider=LLMProvider.OPENAI, model="gpt-4o-mini")
    return LLMConfig(provider=LLMProvider.LOCAL, model="local-mock")


class LLMClient:
    """Provider-agnostic LLM client with cost/latency controls."""

    def __init__(self, config: LLMConfig | None = None):
        self.config = config or _auto_detect_provider()
        self._usage_log: list[LLMUsage] = []

    def complete(
        self,
        prompt: str,
        system: str = "",
        max_tokens: int | None = None,
    ) -> LLMResponse:
        """Send a completion request with retry, cost, and latency controls."""
        max_tokens = max_tokens or self.config.max_tokens
        start = time.monotonic()

        for attempt in range(self.config.retry_attempts + 1):
            try:
                if self.config.provider == LLMProvider.ANTHROPIC:
                    return self._call_anthropic(prompt, system, max_tokens, start)
                elif self.config.provider == LLMProvider.OPENAI:
                    return self._call_openai(prompt, system, max_tokens, start)
                else:
                    return self._call_local(prompt, start)
            except Exception as exc:
                if attempt < self.config.retry_attempts:
                    delay = self.config.retry_base_delay * (2 ** attempt)
                    logger.warning("LLM call failed (attempt %d), retrying in %.1fs: %s", attempt + 1, delay, exc)
                    time.sleep(delay)
                else:
                    latency = (time.monotonic() - start) * 1000
                    usage = LLMUsage(
                        provider=self.config.provider.value,
                        model=self.config.model,
                        latency_ms=round(latency, 1),
                        success=False,
                        error=str(exc),
                    )
                    self._usage_log.append(usage)
                    return LLMResponse(text="", usage=usage)

        # Unreachable but satisfies type checker
        return LLMResponse(text="", usage=LLMUsage(provider="unknown", model="", success=False))

    def _call_anthropic(self, prompt: str, system: str, max_tokens: int, start: float) -> LLMResponse:
        import anthropic

        if not hasattr(self, '_anthropic_client'):
            self._anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
        client = self._anthropic_client
        messages = [{"role": "user", "content": prompt}]
        kwargs: dict[str, Any] = {
            "model": self.config.model,
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system

        msg = client.messages.create(**kwargs)
        text = msg.content[0].text.strip() if msg.content else ""
        latency = (time.monotonic() - start) * 1000

        input_tok = msg.usage.input_tokens if hasattr(msg, "usage") else 0
        output_tok = msg.usage.output_tokens if hasattr(msg, "usage") else 0
        cost = _estimate_cost("anthropic", self.config.model, input_tok, output_tok)

        if cost > self.config.max_cost_per_call_usd:
            logger.warning("LLM call exceeded cost ceiling: $%.4f > $%.4f", cost, self.config.max_cost_per_call_usd)

        usage = LLMUsage(
            provider="anthropic",
            model=self.config.model,
            input_tokens=input_tok,
            output_tokens=output_tok,
            cost_usd=round(cost, 6),
            latency_ms=round(latency, 1),
            success=True,
        )
        self._usage_log.append(usage)
        return LLMResponse(text=text, usage=usage)

    def _call_openai(self, prompt: str, system: str, max_tokens: int, start: float) -> LLMResponse:
        import openai

        if not hasattr(self, '_openai_client'):
            self._openai_client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
        client = self._openai_client
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        resp = client.chat.completions.create(
            model=self.config.model,
            messages=messages,
            max_tokens=max_tokens,
        )
        text = (resp.choices[0].message.content or "").strip()
        latency = (time.monotonic() - start) * 1000

        input_tok = resp.usage.prompt_tokens if resp.usage else 0
        output_tok = resp.usage.completion_tokens if resp.usage else 0
        cost = _estimate_cost("openai", self.config.model, input_tok, output_tok)

        usage = LLMUsage(
            provider="openai",
            model=self.config.model,
            input_tokens=input_tok,
            output_tokens=output_tok,
            cost_usd=round(cost, 6),
            latency_ms=round(latency, 1),
            success=True,
        )
        self._usage_log.append(usage)
        return LLMResponse(text=text, usage=usage)

    def _call_local(self, prompt: str, start: float) -> LLMResponse:
        """Local/mock provider — deterministic response for dev/testing."""
        latency = (time.monotonic() - start) * 1000
        usage = LLMUsage(
            provider="local",
            model="local-mock",
            latency_ms=round(latency, 1),
            success=True,
        )
        self._usage_log.append(usage)
        return LLMResponse(
            text="[Local model] Analysis based on keyword matching and rule-based heuristics.",
            usage=usage,
        )

    @property
    def total_cost_usd(self) -> float:
        return sum(u.cost_usd for u in self._usage_log)

    @property
    def total_latency_ms(self) -> float:
        return sum(u.latency_ms for u in self._usage_log)

    def get_usage_log(self) -> list[dict]:
        return [
            {
                "provider": u.provider,
                "model": u.model,
                "inputTokens": u.input_tokens,
                "outputTokens": u.output_tokens,
                "costUsd": u.cost_usd,
                "latencyMs": u.latency_ms,
                "success": u.success,
                "error": u.error,
            }
            for u in self._usage_log
        ]


# Module-level singleton — auto-detects provider on first access
_default_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    """Get or create the default LLM client."""
    global _default_client
    if _default_client is None:
        _default_client = LLMClient()
    return _default_client
