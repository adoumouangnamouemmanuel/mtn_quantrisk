"""
Zero-dependency Prometheus metrics (audit finding H11 / TD-09).

Exposes a small in-process registry of counters and histograms in the
Prometheus text-exposition format, served at ``GET /metrics``. No
``prometheus_client`` dependency is required, so the app stays lightweight.
A multi-process deployment should replace this with the official client
library + a push gateway, but for a single-process API this is sufficient.

Tracked metrics
----------------
- ``quantrisk_http_requests_total{path,method,status}``   — request counter
- ``quantrisk_http_request_duration_seconds{path}``        — latency histogram
- ``quantrisk_scrape_runs_total``                          — scheduler scrape count
- ``quantrisk_scrape_new_articles_total``                  — articles stored
- ``quantrisk_scrape_last_success_timestamp``              — last successful scrape
- ``quantrisk_scheduler_status``                           — 1 if scheduled, 0 otherwise
"""

import threading
import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_LOCK = threading.Lock()

# ── Counters ──────────────────────────────────────────────────────────────────
# {metric_name: {label_tuple: value}}
_counters: dict[str, dict[tuple, float]] = defaultdict(lambda: defaultdict(float))
# {metric_name: {label_tuple: (count, total_seconds)}}
_gauges: dict[str, dict[tuple, float]] = defaultdict(lambda: defaultdict(float))

# ── Histogram buckets (seconds) ────────────────────────────────────────────────
_HISTOGRAM_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
# {metric_name: {label_tuple: {bucket_upper: count, "sum": float, "count": int}}}
_histograms: dict[str, dict[tuple, dict]] = defaultdict(
    lambda: defaultdict(lambda: {"sum": 0.0, "count": 0, **{b: 0 for b in _HISTOGRAM_BUCKETS}})
)

# {metric_name: [label_keys]}
_labels: dict[str, tuple[str, ...]] = {}


def _inc_counter(name: str, labels: tuple, value: float = 1.0, label_keys: tuple[str, ...] = ()):
    with _LOCK:
        if label_keys and name not in _labels:
            _labels[name] = label_keys
        _counters[name][labels] += value


def _set_gauge(name: str, labels: tuple, value: float, label_keys: tuple[str, ...] = ()):
    with _LOCK:
        if label_keys and name not in _labels:
            _labels[name] = label_keys
        _gauges[name][labels] = value


def _observe_histogram(name: str, labels: tuple, seconds: float, label_keys: tuple[str, ...] = ()):
    with _LOCK:
        if label_keys and name not in _labels:
            _labels[name] = label_keys
        hist = _histograms[name][labels]
        hist["sum"] += seconds
        hist["count"] += 1
        for bucket in _HISTOGRAM_BUCKETS:
            if seconds <= bucket:
                hist[bucket] += 1


# ── Public helpers used by services ───────────────────────────────────────────

def record_request(path: str, method: str, status: int, duration: float) -> None:
    """Called by the metrics middleware for every request."""
    # Normalise path so dynamic ids don't explode cardinality.
    norm = _normalise_path(path)
    _inc_counter(
        "quantrisk_http_requests_total",
        (norm, method, str(status)),
        label_keys=("path", "method", "status"),
    )
    _observe_histogram(
        "quantrisk_http_request_duration_seconds",
        (norm,),
        duration,
        label_keys=("path",),
    )


def record_scrape_run(new_articles: int, success: bool) -> None:
    """Called by the scraper after each scheduled run."""
    _inc_counter("quantrisk_scrape_runs_total", ())
    if success:
        _inc_counter("quantrisk_scrape_new_articles_total", (), new_articles)
        _set_gauge("quantrisk_scrape_last_success_timestamp", (), time.time())
    _set_gauge("quantrisk_scheduler_status", (), 1.0 if success else 0.0)


def _normalise_path(path: str) -> str:
    """Collapse /api/news/{id} → /api/news/:id to limit label cardinality."""
    parts = path.split("/")
    if len(parts) < 2:
        return path
    out = []
    for i, seg in enumerate(parts):
        # Heuristic: a path segment is an "id" if it is not a known route
        # segment and the previous segment looks like a resource name.
        if i > 2 and not _is_route_segment(seg):
            out.append(":id")
        else:
            out.append(seg)
    return "/".join(out)


def _is_route_segment(seg: str) -> bool:
    return seg in {
        "api", "kpis", "scenarios", "run", "reverse-stress", "forecast",
        "quarterly", "monthly", "briefs", "generate", "health", "upload",
        "csv", "pdf", "apply", "monte-carlo", "retrain", "feedback", "logs",
        "base-case", "economics", "risk-context", "intelligence", "summary",
        "news", "scrape", "alerts", "acknowledge", "auth", "login", "me",
        "logout", "metrics",
    }


# ── Exposition ────────────────────────────────────────────────────────────────

def render_metrics() -> str:
    """Render the registry in Prometheus text-exposition format."""
    lines: list[str] = []

    def _emit_labels(label_keys: tuple[str, ...], values: tuple) -> str:
        if not label_keys or not values:
            return ""
        pairs = ",".join(
            f'{k}="{_escape(v)}"' for k, v in zip(label_keys, values)
        )
        return "{" + pairs + "}"

    # Counters
    for name, series in _counters.items():
        label_keys = _labels.get(name, ())
        lines.append(f"# HELP {name} counter")
        lines.append(f"# TYPE {name} counter")
        for values, val in sorted(series.items()):
            lines.append(f"{name}{_emit_labels(label_keys, values)} {val}")
    # Gauges
    for name, series in _gauges.items():
        label_keys = _labels.get(name, ())
        lines.append(f"# HELP {name} gauge")
        lines.append(f"# TYPE {name} gauge")
        for values, val in sorted(series.items()):
            lines.append(f"{name}{_emit_labels(label_keys, values)} {val}")
    # Histograms
    for name, series in _histograms.items():
        label_keys = _labels.get(name, ())
        lines.append(f"# HELP {name} request duration histogram")
        lines.append(f"# TYPE {name} histogram")
        for values, hist in sorted(series.items()):
            lbl = _emit_labels(label_keys, values)
            sep = "," if lbl else ""
            for bucket in _HISTOGRAM_BUCKETS:
                lines.append(f'{name}_bucket{lbl}{sep}le="{bucket}" {hist[bucket]}')
            lines.append(f'{name}_bucket{lbl}{sep}le="+Inf" {hist["count"]}')
            lines.append(f'{name}_sum{lbl} {hist["sum"]}')
            lines.append(f'{name}_count{lbl} {hist["count"]}')

    return "\n".join(lines) + "\n"


def _escape(v) -> str:
    return str(v).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


# ── Middleware ────────────────────────────────────────────────────────────────

class MetricsMiddleware(BaseHTTPMiddleware):
    """Record request count + latency for every HTTP request."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ("/metrics", "/"):
            return await call_next(request)
        start = time.time()
        response: Response = await call_next(request)
        duration = time.time() - start
        try:
            record_request(request.url.path, request.method, response.status_code, duration)
        except Exception:
            pass
        return response


def metrics_endpoint() -> Response:
    """Handler for ``GET /metrics`` returning the Prometheus text format."""
    return Response(content=render_metrics(), media_type="text/plain; version=0.0.4; charset=utf-8")
