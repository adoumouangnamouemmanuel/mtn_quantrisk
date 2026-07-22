"""
API endpoint tests — verifies response shape without needing a running server.
Uses FastAPI TestClient (httpx).
Run with: pytest tests/test_api.py -v
(conftest.py sets DB_PATH before any import so the in-memory DB is wired up correctly)
"""
import pytest


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    from app.main import app
    # TestClient runs the FastAPI lifespan (init_db + initial scrape attempt)
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


# ── Core KPI endpoints ────────────────────────────────────────────────────────

class TestKpiEndpoints:
    def test_list_kpis_returns_200(self, client):
        r = client.get("/api/kpis")
        assert r.status_code == 200

    def test_list_kpis_returns_list(self, client):
        r = client.get("/api/kpis")
        data = r.json()
        assert isinstance(data, list)

    def test_kpi_has_required_fields(self, client):
        r = client.get("/api/kpis")
        kpis = r.json()
        if kpis:
            kpi = kpis[0]
            # The API returns `currentStatus`, not `status`
            for field in ("id", "name", "category", "fy25Value", "unit", "currentStatus"):
                assert field in kpi, f"KPI missing field: {field}"


# ── News endpoints ────────────────────────────────────────────────────────────

class TestNewsEndpoints:
    def test_news_list_returns_200(self, client):
        r = client.get("/api/news")
        assert r.status_code == 200

    def test_news_list_returns_list(self, client):
        data = client.get("/api/news").json()
        assert isinstance(data, list)

    def test_news_summary_returns_200(self, client):
        r = client.get("/api/news/summary")
        assert r.status_code == 200

    def test_news_summary_has_required_fields(self, client):
        data = client.get("/api/news/summary").json()
        for field in ("articlesToday", "totalArticles", "categoryBreakdown"):
            assert field in data, f"news/summary missing field: {field}"

    def test_news_summary_total_is_int(self, client):
        data = client.get("/api/news/summary").json()
        assert isinstance(data["totalArticles"], int)
        assert data["totalArticles"] >= 0

    def test_news_unknown_article_returns_404(self, client):
        r = client.get("/api/news/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_news_category_filter_accepted(self, client):
        r = client.get("/api/news?category=regulatory&limit=5")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_news_scrape_endpoint_returns_200(self, client):
        # Mock-safe: scrape will fail silently if network is unavailable
        r = client.post("/api/news/scrape")
        assert r.status_code == 200
        data = r.json()
        assert "newArticles" in data
        assert isinstance(data["newArticles"], int)


# ── Alert endpoints ───────────────────────────────────────────────────────────

class TestAlertEndpoints:
    def test_alerts_list_returns_200(self, client):
        r = client.get("/api/alerts")
        assert r.status_code == 200

    def test_alerts_list_returns_list(self, client):
        data = client.get("/api/alerts").json()
        assert isinstance(data, list)

    def test_alerts_summary_returns_200(self, client):
        r = client.get("/api/alerts/summary")
        assert r.status_code == 200

    def test_alerts_summary_has_tier_counts(self, client):
        data = client.get("/api/alerts/summary").json()
        for field in ("total_active", "critical", "warning", "watch"):
            assert field in data, f"alerts/summary missing: {field}"
            assert isinstance(data[field], int)

    def test_alerts_tier_filter_critical(self, client):
        r = client.get("/api/alerts?tier=Critical")
        assert r.status_code == 200

    def test_alerts_acknowledged_filter(self, client):
        r = client.get("/api/alerts?acknowledged=false")
        assert r.status_code == 200

    def test_acknowledge_nonexistent_alert_returns_404(self, client):
        r = client.patch("/api/alerts/nonexistent-id/acknowledge")
        assert r.status_code == 404


# ── Health endpoint ───────────────────────────────────────────────────────────

def test_root_returns_200(client):
    r = client.get("/")
    assert r.status_code == 200

def test_health_returns_status(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert data["status"] in ("Healthy", "Degraded")
    assert data["automaticScraper"]["status"] == "Scheduled"
    assert data["automaticScraper"]["nextRunAt"] is not None
