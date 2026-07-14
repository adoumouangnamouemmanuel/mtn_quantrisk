"""
Tests for alert tier thresholds and the full pipeline service.
Run with: pytest tests/test_alerts.py -v
"""
import sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import pytest
from app.services.impact_service import compute_alert_tier

# Use an in-memory SQLite DB for all DB-touching tests
os.environ.setdefault("DB_PATH", ":memory:")


# ── Tier threshold contract ───────────────────────────────────────────────────
# These are the exact values used in the demo. Any change here breaks the SLA.

class TestAlertTierThresholds:
    """Validate the severity/relevance → tier contract is stable."""

    def test_critical_threshold_at_7_5(self):
        assert compute_alert_tier(7.5, 0.5) == "Critical"

    def test_warning_threshold_at_5_0(self):
        assert compute_alert_tier(5.0, 0.5) == "Warning"
        assert compute_alert_tier(7.4, 0.5) == "Warning"

    def test_watch_threshold_at_3_0(self):
        assert compute_alert_tier(3.0, 0.5) == "Watch"
        assert compute_alert_tier(4.9, 0.5) == "Watch"

    def test_none_below_3_0(self):
        assert compute_alert_tier(2.9, 0.5) is None
        assert compute_alert_tier(0.0, 1.0) is None

    def test_relevance_gate_blocks_low_relevance(self):
        # High severity but low MTN relevance → no alert
        assert compute_alert_tier(9.0, 0.24) is None
        assert compute_alert_tier(9.0, 0.25) is not None

    @pytest.mark.parametrize("severity,relevance,tier", [
        (8.5, 0.9, "Critical"),
        (7.5, 0.3, "Critical"),
        (6.0, 0.5, "Warning"),
        (5.0, 0.4, "Warning"),
        (4.0, 0.6, "Watch"),
        (3.1, 0.3, "Watch"),
        (2.5, 0.8, None),
        (9.9, 0.0, None),
    ])
    def test_parametrized_tier_assignments(self, severity, relevance, tier):
        assert compute_alert_tier(severity, relevance) == tier


# ── alert_service with direct in-memory session ───────────────────────────────

class TestAlertService:
    """Light smoke test: alert_service functions run without crashing."""

    @pytest.fixture()
    def db_session(self):
        """Create an isolated in-memory SQLite session with all tables."""
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.models.database import Base
        # Import model files so their tables are registered on Base.metadata
        import app.models.article   # noqa: F401
        import app.models.risk_score  # noqa: F401
        import app.models.alert     # noqa: F401

        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    def test_get_alert_summary_returns_dict(self, db_session):
        from app.services.alert_service import get_alert_summary
        result = get_alert_summary(db_session)
        assert isinstance(result, dict)
        assert "total_active" in result
        assert "critical" in result
        assert result["total_active"] == 0  # fresh DB, no alerts

    def test_list_alerts_returns_list(self, db_session):
        from app.services.alert_service import list_alerts
        result = list_alerts(db_session)
        assert isinstance(result, list)
        assert len(result) == 0  # empty DB

    def test_summary_counts_are_ints(self, db_session):
        from app.services.alert_service import get_alert_summary
        result = get_alert_summary(db_session)
        for key in ("total_active", "critical", "warning", "watch"):
            assert isinstance(result[key], int)
