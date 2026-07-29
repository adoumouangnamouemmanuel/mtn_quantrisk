"""
Sentiment analysis using HuggingFace Inference API → ProsusAI/finbert.
No local GPU or transformers install needed — just a free HF token.

Get a free token at https://huggingface.co/settings/tokens
Set env var:  HF_TOKEN=hf_xxxxxxxxxxxx

Falls back to lexicon scoring if HF_TOKEN is not set or the API is unavailable.
"""

import logging
import os

logger = logging.getLogger(__name__)

HF_TOKEN = os.environ.get("HF_TOKEN", "")
_FINBERT_URL = "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert"

# ── HuggingFace Inference API (FinBERT) ───────────────────────────────────────

def _hf_finbert(text: str) -> dict | None:
    """
    POST to HF Inference API. Returns sentiment dict or None on failure.
    FinBERT output: [[{"label": "positive", "score": 0.97}, ...]]
    """
    if not HF_TOKEN:
        return None
    try:
        import requests
        resp = requests.post(
            _FINBERT_URL,
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": text[:512]},
            timeout=12,
        )
        if resp.status_code == 503:
            # Model loading — return None so we fall back gracefully
            logger.debug("FinBERT model loading on HF (503), using lexicon fallback")
            return None
        if resp.status_code != 200:
            logger.warning("HF FinBERT returned %s", resp.status_code)
            return None

        payload = resp.json()
        # API wraps batch results: [[{label, score}, ...]]
        inner = payload[0] if isinstance(payload, list) and isinstance(payload[0], list) else payload
        if not inner:
            return None
        best = max(inner, key=lambda x: x.get("score", 0))
        label = best["label"].lower()
        # FinBERT uses "positive" / "negative" / "neutral" directly
        return {"sentiment": label, "sentiment_confidence": round(best["score"], 3)}
    except Exception as exc:
        logger.warning("HF FinBERT request failed: %s", exc)
        return None


# ── Lexicon fallback ──────────────────────────────────────────────────────────

_POSITIVE_WORDS = [
    "growth", "profit", "revenue", "record", "increase", "expand", "launch",
    "award", "partnership", "investment", "success", "improve", "strong",
    "positive", "gain", "rise", "milestone", "achieve", "approve", "surge",
    "recovery", "dividend", "upgrade", "beat", "outperform", "innovation",
]
_NEGATIVE_WORDS = [
    "decline", "loss", "drop", "fall", "crisis", "fine", "penalty", "outage",
    "failure", "complaint", "concern", "risk", "threat", "breach", "hack",
    "reduce", "cut", "lay off", "debt", "scandal", "protest", "ban", "collapse",
    "downgrade", "miss", "shortfall", "warning", "fraud", "sue", "lawsuit",
]


def _lexicon_sentiment(text: str) -> dict:
    text_lower = text.lower()
    pos = sum(1 for w in _POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in _NEGATIVE_WORDS if w in text_lower)
    if pos > neg:
        label, conf = "positive", min(0.9, 0.5 + pos * 0.05)
    elif neg > pos:
        label, conf = "negative", min(0.9, 0.5 + neg * 0.05)
    else:
        label, conf = "neutral", 0.6
    return {"sentiment": label, "sentiment_confidence": round(conf, 3)}


# ── Main entry point ──────────────────────────────────────────────────────────

def run_sentiment(text: str) -> dict:
    """
    Returns { sentiment: 'positive'|'neutral'|'negative', sentiment_confidence: float }
    Tries FinBERT via HF Inference API first, falls back to lexicon.
    """
    result = _hf_finbert(text)
    if result:
        return result
    return _lexicon_sentiment(text)
