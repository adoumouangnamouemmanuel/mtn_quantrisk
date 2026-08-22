"""
Lightweight, in-memory sliding-window rate limiter (stdlib-only).

Protects expensive / abuse-prone endpoints (retrain, news scrape, uploads)
from being hammered. A real multi-instance deployment should replace this with
a Redis-backed limiter, but for a single-process API this is sufficient and
has zero extra dependencies.

Design notes
------------
- Keyed by client IP + matched rule prefix.
- Sliding-window counter: each request records a timestamp; a request is
  allowed when the number of timestamps within the last ``window_seconds`` is
  below ``max_requests``.
- Rules are matched against the request path prefix, so ``/api/upload/csv``
  and ``/api/upload/pdf`` both fall under the ``/api/upload`` rule.
- Memory is bounded: expired timestamps are pruned on each check.
"""

import logging
import time
from collections import defaultdict, deque
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# (path_prefix, max_requests, window_seconds)
RATE_LIMIT_RULES: list[tuple[str, int, int]] = [
    ("/api/retrain",       3,   3600),   # 3 retrains per hour
    ("/api/news/scrape",  10,    900),   # 10 manual scrapes per 15 min
    ("/api/upload",       20,    600),   # 20 uploads per 10 min
    ("/api/briefs/generate", 30, 600),   # 30 generated briefs per 10 min
]


class RateLimitExceeded(Exception):
    """Raised internally when a request exceeds its rate limit."""


class _SlidingWindow:
    """Sliding-window counter for a single key."""

    __slots__ = ("max_requests", "window_seconds", "_hits")

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: deque[float] = deque()

    def allow(self, now: float) -> bool:
        # Prune hits older than the window.
        while self._hits and self._hits[0] <= now - self.window_seconds:
            self._hits.popleft()
        if len(self._hits) >= self.max_requests:
            return False
        self._hits.append(now)
        return True


# key -> (rule_index, window) — one window per (key, rule).
_WINDOWS: dict[tuple[str, int], _SlidingWindow] = defaultdict(dict)  # type: ignore[arg-type]


def _client_key(request: Request) -> str:
    """Best-effort client identifier: X-Forwarded-For first hop or peer IP."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Starlette middleware enforcing RATE_LIMIT_RULES on matching paths."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        now = time.time()

        for rule_index, (prefix, max_requests, window_seconds) in enumerate(RATE_LIMIT_RULES):
            if not path.startswith(prefix):
                continue
            key = (_client_key(request), rule_index)
            window = _WINDOWS.setdefault(
                key, _SlidingWindow(max_requests, window_seconds)
            )
            if not window.allow(now):
                logger.warning(
                    "Rate limit exceeded for %s on %s (client %s)",
                    prefix, path, _client_key(request),
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": (
                            f"Too many requests to {prefix}. "
                            f"Limit is {max_requests} per {window_seconds} seconds. "
                            "Please retry later."
                        )
                    },
                    headers={"Retry-After": str(window_seconds)},
                )
        return await call_next(request)
