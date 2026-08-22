"""
API endpoint tests — verifies response shape without needing a running server.
Uses FastAPI TestClient (httpx).
Run with: pytest tests/test_api.py -v
(conftest.py sets DB_PATH before any import so the in-memory DB is wired up correctly)
"""
import pytest


def get_auth_headers():
    """Return Authorization headers by logging in with the default analyst account."""
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app, raise_server_exceptions=False) as c:
        r = c.post("/api/auth/login", json={
            "email": "analyst@mtn.com",
            "password": "Pass.word.123",
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    from app.main import app
    # TestClient runs the FastAPI lifespan (init_db + initial scrape attempt)
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(scope="session")
def auth_headers():
    return get_auth_headers()


# ── Auth endpoints ────────────────────────────────────────────────────────────

class TestAuthEndpoints:
    def test_login_success_returns_token(self, client):
        r = client.post("/api/auth/login", json={
            "email": "analyst@mtn.com",
            "password": "Pass.word.123",
        })
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "analyst@mtn.com"

    def test_login_failure_returns_401(self, client):
        r = client.post("/api/auth/login", json={
            "email": "analyst@mtn.com",
            "password": "wrong-password",
        })
        assert r.status_code == 401

    def test_login_missing_fields_returns_422(self, client):
        r = client.post("/api/auth/login", json={})
        assert r.status_code == 422

    def test_me_requires_auth(self, client):
        r = client.get("/api/auth/me")
        assert r.status_code == 401

    def test_me_returns_user(self, client, auth_headers):
        r = client.get("/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "analyst@mtn.com"


# ── Core KPI endpoints ────────────────────────────────────────────────────────

class TestKpiEndpoints:
    def test_list_kpis_returns_401_without_token(self, client):
        r = client.get("/api/kpis")
        assert r.status_code == 401

    def test_list_kpis_returns_200(self, client, auth_headers):
        r = client.get("/api/kpis", headers=auth_headers)
        assert r.status_code == 200

    def test_list_kpis_returns_list(self, client, auth_headers):
        r = client.get("/api/kpis", headers=auth_headers)
        data = r.json()
        assert isinstance(data, list)

    def test_kpi_has_required_fields(self, client, auth_headers):
        r = client.get("/api/kpis", headers=auth_headers)
        kpis = r.json()
        if kpis:
            kpi = kpis[0]
            # The API returns `currentStatus`, not `status`
            for field in ("id", "name", "category", "fy25Value", "unit", "currentStatus"):
                assert field in kpi, f"KPI missing field: {field}"


# ── News endpoints ────────────────────────────────────────────────────────────

class TestNewsEndpoints:
    def test_news_list_returns_401_without_token(self, client):
        r = client.get("/api/news")
        assert r.status_code == 401

    def test_news_list_returns_200(self, client, auth_headers):
        r = client.get("/api/news", headers=auth_headers)
        assert r.status_code == 200

    def test_news_list_returns_list(self, client, auth_headers):
        data = client.get("/api/news", headers=auth_headers).json()
        assert isinstance(data, list)

    def test_news_summary_returns_200(self, client, auth_headers):
        r = client.get("/api/news/summary", headers=auth_headers)
        assert r.status_code == 200

    def test_news_summary_has_required_fields(self, client, auth_headers):
        data = client.get("/api/news/summary", headers=auth_headers).json()
        for field in ("articlesToday", "totalArticles", "categoryBreakdown"):
            assert field in data, f"news/summary missing field: {field}"

    def test_news_summary_total_is_int(self, client, auth_headers):
        data = client.get("/api/news/summary", headers=auth_headers).json()
        assert isinstance(data["totalArticles"], int)
        assert data["totalArticles"] >= 0

    def test_news_unknown_article_returns_404(self, client, auth_headers):
        r = client.get("/api/news/nonexistent-id-xyz", headers=auth_headers)
        assert r.status_code == 404

    def test_news_category_filter_accepted(self, client, auth_headers):
        r = client.get("/api/news?category=regulatory&limit=5", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_news_scrape_endpoint_returns_200(self, client, auth_headers):
        # Mock-safe: scrape will fail silently if network is unavailable
        r = client.post("/api/news/scrape", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "newArticles" in data
        assert isinstance(data["newArticles"], int)


# ── Alert endpoints ───────────────────────────────────────────────────────────

class TestAlertEndpoints:
    def test_alerts_list_returns_401_without_token(self, client):
        r = client.get("/api/alerts")
        assert r.status_code == 401

    def test_alerts_list_returns_200(self, client, auth_headers):
        r = client.get("/api/alerts", headers=auth_headers)
        assert r.status_code == 200

    def test_alerts_list_returns_list(self, client, auth_headers):
        data = client.get("/api/alerts", headers=auth_headers).json()
        assert isinstance(data, list)

    def test_alerts_summary_returns_200(self, client, auth_headers):
        r = client.get("/api/alerts/summary", headers=auth_headers)
        assert r.status_code == 200

    def test_alerts_summary_has_tier_counts(self, client, auth_headers):
        data = client.get("/api/alerts/summary", headers=auth_headers).json()
        for field in ("total_active", "critical", "warning", "watch"):
            assert field in data, f"alerts/summary missing: {field}"
            assert isinstance(data[field], int)

    def test_alerts_tier_filter_critical(self, client, auth_headers):
        r = client.get("/api/alerts?tier=Critical", headers=auth_headers)
        assert r.status_code == 200

    def test_alerts_acknowledged_filter(self, client, auth_headers):
        r = client.get("/api/alerts?acknowledged=false", headers=auth_headers)
        assert r.status_code == 200

    def test_acknowledge_nonexistent_alert_returns_404(self, client, auth_headers):
        r = client.patch("/api/alerts/nonexistent-id/acknowledge", headers=auth_headers)
        assert r.status_code == 404


# ── Health endpoint ───────────────────────────────────────────────────────────

def test_root_returns_200(client):
    r = client.get("/")
    assert r.status_code == 200

def test_health_returns_401_without_token(client):
    r = client.get("/api/health")
    assert r.status_code == 401

def test_health_returns_status(client, auth_headers):
    r = client.get("/api/health", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert data["status"] in ("Healthy", "Degraded")
    # APScheduler is optional — it may be "Scheduled" or "Unavailable"
    # depending on whether the scheduler dependency is installed.
    assert data["automaticScraper"]["status"] in ("Scheduled", "Unavailable")
    assert len(data["historicalData"]) == 4
    assert "externalFeeds" in data
    assert data["modelQuality"]["accuracyProven"] is False


def test_quarterly_endpoint_returns_provenance(client, auth_headers):
    response = client.get("/api/quarterly/FIN01", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["points"][0]["value"] == 1450.0
    assert data["metadata"]["isSynthetic"] is False


def test_monthly_endpoint_discloses_actual_frequency(client, auth_headers):
    response = client.get("/api/monthly/OPS01?n_months=36", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["requestedFrequency"] == "monthly"
    assert data["metadata"]["actualFrequency"] == "quarterly"