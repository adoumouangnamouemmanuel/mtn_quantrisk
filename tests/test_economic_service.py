"""Tests for Ghana macro data shaping, caching, and risk signals."""

import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services import economic_service


def setup_function():
    economic_service._CACHE.clear()


def test_economics_uses_available_debt_service_series():
    def fake_fetch(code, history_years=8):
        return [{"year": 2025, "value": 42.0}]

    with patch.object(
        economic_service, "_fetch_indicator", side_effect=fake_fetch
    ), patch.object(economic_service, "_fetch_gss_current", return_value={}), patch.object(
        economic_service, "_fetch_bog_fx", return_value=None
    ), patch.object(
        economic_service, "_fetch_market_fx", return_value=None
    ):
        result = economic_service.get_ghana_economics()

    assert "debt_service" in result["indicators"]
    assert "public_debt" not in result["indicators"]
    assert result["indicators"]["debt_service"]["latest"] == 42.0


def test_force_refresh_bypasses_cache():
    economic_service._CACHE.update({"data": {"cached": True}, "fetched_at": 10**20})
    with patch.object(
        economic_service,
        "_fetch_indicator",
        return_value=[{"year": 2025, "value": 1.0}],
    ) as fetch:
        result = economic_service.get_ghana_economics(force_refresh=True)

    assert "indicators" in result
    assert fetch.call_count == len(economic_service._INDICATORS)


def test_failed_refresh_preserves_existing_cache():
    cached = {"lastUpdated": "old", "indicators": {}}
    economic_service._CACHE.update({"data": cached, "fetched_at": 0})
    with patch.object(economic_service, "_fetch_indicator", return_value=[]), patch.object(
        economic_service, "_fetch_gss_current", return_value={}
    ), patch.object(economic_service, "_fetch_bog_fx", return_value=None), patch.object(
        economic_service, "_fetch_market_fx", return_value=None
    ):
        result = economic_service.get_ghana_economics(force_refresh=True)

    assert result is cached


def test_risk_context_includes_fx_risk():
    data = {
        "indicators": {
            "inflation": {"latest": 14.0},
            "gdp_growth": {"latest": 5.0},
            "fx_usd_ghs": {
                "latest": 12.0,
                "history": [
                    {"year": 2024, "value": 10.0},
                    {"year": 2025, "value": 12.0},
                ],
                "frequency": "Annual",
            },
        }
    }
    with patch.object(economic_service, "get_ghana_economics", return_value=data):
        result = economic_service.get_risk_context_from_economics()

    assert result["fx_risk"] == "Warning"
