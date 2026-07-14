"""
Tests for impact_service — GHS impact formula and alert tier logic.
Run with: pytest tests/test_impact.py -v
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import pytest
from app.services.impact_service import (
    estimate_impact,
    compute_alert_tier,
    CATEGORY_BASE_EXPOSURE_GHSm,
)


# ── estimate_impact ───────────────────────────────────────────────────────────

class TestEstimateImpact:
    @pytest.mark.parametrize("category", list(CATEGORY_BASE_EXPOSURE_GHSm.keys()))
    def test_all_categories_return_three_values(self, category):
        result = estimate_impact(category, severity=5.0, mtn_relevance=0.8, confidence=0.7)
        assert set(result.keys()) == {"impact_ghs_min", "impact_ghs_mid", "impact_ghs_max"}

    @pytest.mark.parametrize("category", list(CATEGORY_BASE_EXPOSURE_GHSm.keys()))
    def test_min_lt_mid_lt_max(self, category):
        r = estimate_impact(category, severity=5.0, mtn_relevance=0.8, confidence=0.7)
        assert r["impact_ghs_min"] <= r["impact_ghs_mid"] <= r["impact_ghs_max"]

    def test_higher_severity_gives_higher_impact(self):
        low  = estimate_impact("fx_financial", severity=2.0, mtn_relevance=0.9, confidence=0.8)
        high = estimate_impact("fx_financial", severity=8.0, mtn_relevance=0.9, confidence=0.8)
        assert high["impact_ghs_mid"] > low["impact_ghs_mid"]

    def test_higher_relevance_gives_higher_impact(self):
        low  = estimate_impact("regulatory", severity=5.0, mtn_relevance=0.2, confidence=0.8)
        high = estimate_impact("regulatory", severity=5.0, mtn_relevance=0.9, confidence=0.8)
        assert high["impact_ghs_mid"] > low["impact_ghs_mid"]

    def test_zero_severity_gives_near_zero_impact(self):
        r = estimate_impact("competitive", severity=0.0, mtn_relevance=1.0, confidence=1.0)
        assert r["impact_ghs_mid"] == pytest.approx(0.0, abs=0.01)

    def test_confidence_floor_applied(self):
        # Confidence 0.0 should still produce non-zero result due to floor at 0.2
        r_zero = estimate_impact("operational", severity=5.0, mtn_relevance=0.8, confidence=0.0)
        r_floor = estimate_impact("operational", severity=5.0, mtn_relevance=0.8, confidence=0.2)
        assert r_zero["impact_ghs_mid"] == pytest.approx(r_floor["impact_ghs_mid"], rel=0.01)

    def test_all_values_non_negative(self):
        for cat in CATEGORY_BASE_EXPOSURE_GHSm:
            r = estimate_impact(cat, severity=7.0, mtn_relevance=0.6, confidence=0.5)
            assert r["impact_ghs_min"] >= 0
            assert r["impact_ghs_mid"] >= 0
            assert r["impact_ghs_max"] >= 0

    def test_fx_financial_has_highest_base_exposure(self):
        # fx_financial should produce the highest mid impact at equal params
        results = {
            cat: estimate_impact(cat, severity=5.0, mtn_relevance=1.0, confidence=1.0)["impact_ghs_mid"]
            for cat in CATEGORY_BASE_EXPOSURE_GHSm
        }
        assert max(results, key=results.get) == "fx_financial"


# ── compute_alert_tier ────────────────────────────────────────────────────────

class TestComputeAlertTier:
    @pytest.mark.parametrize("severity,relevance,expected", [
        (8.0, 0.9, "Critical"),
        (7.5, 0.5, "Critical"),   # exactly at threshold
        (6.0, 0.4, "Warning"),
        (5.0, 0.3, "Warning"),    # exactly at threshold
        (4.0, 0.4, "Watch"),
        (3.0, 0.5, "Watch"),      # exactly at threshold
        (2.9, 0.8, None),         # below watch threshold
        (9.0, 0.1, None),         # high severity but low relevance → filtered out
        (0.0, 0.0, None),         # both zero
    ])
    def test_tier_boundaries(self, severity, relevance, expected):
        result = compute_alert_tier(severity, relevance)
        assert result == expected, (
            f"severity={severity}, relevance={relevance}: "
            f"expected {expected!r}, got {result!r}"
        )

    def test_relevance_gate_at_025(self):
        # Just below the relevance gate — no tier regardless of severity
        assert compute_alert_tier(10.0, 0.24) is None
        # Just above — should produce a tier
        assert compute_alert_tier(10.0, 0.25) is not None

    def test_returns_string_or_none(self):
        for sev in [1.0, 3.5, 5.5, 8.0]:
            for rel in [0.0, 0.3, 0.7, 1.0]:
                result = compute_alert_tier(sev, rel)
                assert result is None or isinstance(result, str)
