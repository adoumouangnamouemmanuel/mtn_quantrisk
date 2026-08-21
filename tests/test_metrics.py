"""Tests for the zero-dependency Prometheus metrics module (audit finding H11)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))


def test_metrics_endpoint_is_public():
    """GET /metrics must not require auth (scrapers poll it without a token)."""
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app, raise_server_exceptions=False) as c:
        r = c.get("/metrics")
    assert r.status_code == 200
    assert "text/plain" in r.headers.get("content-type", "")


def test_request_counter_recorded():
    from app.core.metrics import record_request, render_metrics

    record_request("/api/kpis", "GET", 200, 0.012)
    out = render_metrics()
    assert "quantrisk_http_requests_total" in out
    assert '/api/kpis' in out
    assert 'method="GET"' in out
    assert 'status="200"' in out


def test_scrape_metrics_recorded():
    from app.core.metrics import record_scrape_run, render_metrics

    record_scrape_run(new_articles=5, success=True)
    out = render_metrics()
    assert "quantrisk_scrape_runs_total" in out
    assert "quantrisk_scrape_new_articles_total" in out
    assert "quantrisk_scrape_last_success_timestamp" in out


def test_histogram_has_buckets():
    from app.core.metrics import record_request, render_metrics

    record_request("/api/news", "GET", 200, 0.45)
    out = render_metrics()
    assert "quantrisk_http_request_duration_seconds_bucket" in out
    assert 'le="+Inf"' in out
    assert "quantrisk_http_request_duration_seconds_sum" in out
    assert "quantrisk_http_request_duration_seconds_count" in out


def test_path_normalisation_collapses_ids():
    from app.core.metrics import _normalise_path

    assert _normalise_path("/api/kpis") == "/api/kpis"
    assert _normalise_path("/api/news") == "/api/news"
    # Dynamic article id should collapse to :id.
    assert _normalise_path("/api/news/some-uuid-123") == "/api/news/:id"
    assert _normalise_path("/api/scenarios/S42/run") == "/api/scenarios/:id/run"
