"""Tests for the configurable automatic scraper interval."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.main import get_scrape_interval_minutes


def test_scrape_interval_defaults_to_fifteen_minutes(monkeypatch):
    monkeypatch.delenv("SCRAPE_INTERVAL_MINUTES", raising=False)
    assert get_scrape_interval_minutes() == 15


def test_scrape_interval_accepts_configuration(monkeypatch):
    monkeypatch.setenv("SCRAPE_INTERVAL_MINUTES", "30")
    assert get_scrape_interval_minutes() == 30


@pytest.mark.parametrize("value", ["0", "-1"])
def test_scrape_interval_rejects_invalid_values(monkeypatch, value):
    monkeypatch.setenv("SCRAPE_INTERVAL_MINUTES", value)
    with pytest.raises(ValueError):
        get_scrape_interval_minutes()
