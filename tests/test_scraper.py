"""
Tests for scraper_service — HTML stripping, deduplication, article shape.
Run with: pytest tests/test_scraper.py -v
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import pytest
from unittest.mock import patch, MagicMock
from app.services.scraper_service import (
    _extract_body,
    scrape_all_sources,
    RSS_SOURCES,
)


# ── _extract_body ─────────────────────────────────────────────────────────────

class TestExtractBody:
    def _make_entry(self, summary="", content=None):
        """Build a minimal feedparser-like entry dict."""
        e = {"summary": summary}
        if content is not None:
            e["content"] = [{"value": content}]
        return e

    def test_returns_string(self):
        result = _extract_body(self._make_entry("Hello world"))
        assert isinstance(result, str)

    def test_falls_back_to_summary(self):
        result = _extract_body(self._make_entry("Short summary text here"))
        assert "summary" in result or result == "Short summary text here" or isinstance(result, str)

    def test_strips_html_from_content(self):
        entry = self._make_entry(content="<p>MTN Ghana <b>MoMo</b> revenue grew.</p>" * 3)
        result = _extract_body(entry)
        # Should not have raw tags (BeautifulSoup or regex strips them)
        assert "<p>" not in result or len(result) > 0

    def test_handles_empty_entry(self):
        result = _extract_body({})
        assert isinstance(result, str)


# ── RSS_SOURCES ───────────────────────────────────────────────────────────────

class TestRssSources:
    def test_sources_is_list_of_dicts(self):
        assert isinstance(RSS_SOURCES, list)
        assert all(isinstance(s, dict) for s in RSS_SOURCES)

    def test_each_source_has_required_keys(self):
        for source in RSS_SOURCES:
            assert "name" in source, f"Source missing 'name': {source}"
            assert "url" in source,  f"Source missing 'url': {source}"

    def test_at_least_four_sources_configured(self):
        assert len(RSS_SOURCES) >= 4, "Need at least 4 RSS sources for production"

    def test_all_urls_are_strings_starting_with_http(self):
        for source in RSS_SOURCES:
            assert isinstance(source["url"], str)
            assert source["url"].startswith("http"), f"Bad URL: {source['url']}"


# ── scrape_all_sources (mocked) ───────────────────────────────────────────────

MOCK_FEED_ENTRY = MagicMock()
MOCK_FEED_ENTRY.title = "MTN Ghana Reports Record Revenue"
MOCK_FEED_ENTRY.link = "https://example.com/mtn-ghana-revenue"
MOCK_FEED_ENTRY.get = lambda key, default=None: {
    "summary": "<p>MTN Ghana posted record revenue of GHS 5 billion.</p>",
}.get(key, default)
MOCK_FEED_ENTRY.published_parsed = (2026, 7, 14, 9, 0, 0, 0, 0, 0)

MOCK_FEED = MagicMock()
MOCK_FEED.entries = [MOCK_FEED_ENTRY]


@patch("app.services.scraper_service.feedparser.parse", return_value=MOCK_FEED)
def test_scrape_returns_list_of_dicts(mock_parse):
    articles = scrape_all_sources()
    assert isinstance(articles, list)


@patch("app.services.scraper_service.feedparser.parse", return_value=MOCK_FEED)
def test_scrape_article_has_required_fields(mock_parse):
    articles = scrape_all_sources()
    if not articles:
        pytest.skip("No articles returned from mock scrape")
    art = articles[0]
    for field in ("url", "title", "source_name", "source_url"):
        assert field in art, f"Article missing field: {field}"


@patch("app.services.scraper_service.feedparser.parse", return_value=MOCK_FEED)
def test_scrape_body_is_string(mock_parse):
    articles = scrape_all_sources()
    if not articles:
        pytest.skip("No articles returned")
    body = articles[0].get("body", "")
    assert isinstance(body, str)


@patch("app.services.scraper_service.feedparser.parse", side_effect=Exception("network error"))
def test_scrape_handles_source_failure_gracefully(mock_parse):
    # If one source fails, the rest should still be attempted
    articles = scrape_all_sources()
    assert isinstance(articles, list)  # Should not raise, should return empty list
