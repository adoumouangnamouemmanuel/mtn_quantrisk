"""Historical charts must use repository observations, never random histories."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services.history_service import (
    get_monthly_series,
    get_quarterly_series,
    historical_source_health,
)


def test_fin01_quarterly_matches_repository_csv():
    series = get_quarterly_series("FIN01")
    first = series["points"][0]
    assert first["period"] == "2020Q1"
    assert first["value"] == 1450.0
    assert first["quality"] == "Interpolated"
    assert series["metadata"]["isSynthetic"] is False
    assert series["metadata"]["sourceFile"] == "data/structured/quarterly.csv"


def test_fin06_is_calculated_as_quarterly_year_over_year_growth():
    series = get_quarterly_series("FIN06")
    assert series["points"][0]["period"] == "2021Q1"
    expected = ((1985 / 1450) - 1) * 100
    assert series["points"][0]["value"] == round(expected, 4)


def test_monthly_request_does_not_generate_monthly_points():
    series = get_monthly_series("OPS01", 36)
    assert series["metadata"]["requestedFrequency"] == "monthly"
    assert series["metadata"]["actualFrequency"] == "quarterly"
    assert series["metadata"]["isSynthetic"] is False
    assert len(series["points"]) == 12


def test_macro_series_declares_annual_frequency():
    series = get_quarterly_series("EXT01")
    assert series["metadata"]["actualFrequency"] == "annual"
    assert series["points"][-1]["period"] == "2025FY"


def test_historical_source_health_reads_all_configured_files():
    results = historical_source_health()
    assert len(results) == 4
    assert all(item["status"] == "Healthy" for item in results)
    assert all(item["rows"] > 0 for item in results)
