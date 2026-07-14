"""
RSS feed scraper — pulls articles from 6 Ghana/Africa news sources every 15 min.
Uses feedparser; no Scrapy/Playwright needed for RSS.
"""

import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Optional

import feedparser

logger = logging.getLogger(__name__)

# ── Source registry ───────────────────────────────────────────────────────────

RSS_SOURCES = [
    {
        "name": "JoyFM",
        "url": "https://www.myjoyonline.com/feed/",
        "category_hint": "ghana_local",
    },
    {
        "name": "Citi FM",
        "url": "https://citinewsroom.com/feed/",
        "category_hint": "ghana_local",
    },
    {
        "name": "Reuters Africa",
        "url": "https://feeds.reuters.com/reuters/AFRICANews",
        "category_hint": "global_finance",
    },
    {
        "name": "BBC Africa",
        "url": "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
        "category_hint": "global_finance",
    },
    {
        "name": "Modern Ghana",
        "url": "https://www.modernghana.com/rss/news.aspx",
        "category_hint": "ghana_local",
    },
    {
        "name": "TechCabal",
        "url": "https://techcabal.com/feed/",
        "category_hint": "tech_telecom",
    },
]


# ── Parse helpers ─────────────────────────────────────────────────────────────

def _parse_published(entry: dict) -> Optional[datetime]:
    """Try multiple feedparser date fields, return UTC datetime or None."""
    for field in ("published_parsed", "updated_parsed"):
        val = entry.get(field)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    for field in ("published", "updated"):
        val = entry.get(field)
        if val:
            try:
                return parsedate_to_datetime(val).astimezone(timezone.utc)
            except Exception:
                pass
    return None


def _extract_body(entry: dict) -> str:
    """Pull the longest text we can find from the entry."""
    for field in ("content", "summary_detail", "description"):
        raw = entry.get(field)
        if isinstance(raw, list) and raw:
            raw = raw[0].get("value", "")
        if isinstance(raw, dict):
            raw = raw.get("value", "")
        if raw and len(raw) > 50:
            # Strip basic HTML tags cheaply
            try:
                from bs4 import BeautifulSoup
                return BeautifulSoup(raw, "html.parser").get_text(separator=" ", strip=True)
            except ImportError:
                import re
                return re.sub(r"<[^>]+>", " ", raw).strip()
    return entry.get("summary", "")


# ── Core scrape function ──────────────────────────────────────────────────────

def scrape_all_sources() -> list[dict]:
    """
    Scrape all RSS sources and return a list of raw article dicts.
    Each dict has: url, title, body, source_name, source_url, published_at
    Does NOT write to DB — caller handles persistence + deduplication.
    """
    articles = []
    for source in RSS_SOURCES:
        try:
            feed = feedparser.parse(source["url"])
            if feed.bozo and not feed.entries:
                logger.warning("Feed %s may be malformed: %s", source["name"], feed.bozo_exception)
                continue
            for entry in feed.entries:
                url = entry.get("link") or entry.get("id")
                title = entry.get("title", "").strip()
                if not url or not title:
                    continue
                articles.append({
                    "url": url,
                    "title": title,
                    "body": _extract_body(entry),
                    "source_name": source["name"],
                    "source_url": source["url"],
                    "published_at": _parse_published(entry),
                })
            logger.info("Scraped %d articles from %s", len(feed.entries), source["name"])
        except Exception as exc:
            logger.error("Failed to scrape %s: %s", source["name"], exc)
    return articles


# ── DB-persisting entry point ─────────────────────────────────────────────────

def run_scrape_and_store() -> int:
    """
    Called by APScheduler every 15 min.
    Returns number of NEW articles stored.
    """
    from ..models.database import SessionLocal
    from ..models.article import Article
    from .pipeline_service import process_article

    raw_articles = scrape_all_sources()
    new_count = 0

    with SessionLocal() as db:
        for raw in raw_articles:
            # Deduplication — UNIQUE constraint on url handles concurrent calls
            exists = db.query(Article).filter(Article.url == raw["url"]).first()
            if exists:
                continue
            article = Article(
                url=raw["url"],
                title=raw["title"],
                body=raw["body"],
                source_name=raw["source_name"],
                source_url=raw["source_url"],
                published_at=raw["published_at"],
            )
            db.add(article)
            try:
                db.commit()
                db.refresh(article)
                new_count += 1
                # Immediately score the new article
                try:
                    process_article(article.id)
                except Exception as nlp_exc:
                    logger.error("NLP pipeline failed for %s: %s", article.id, nlp_exc)
            except Exception as db_exc:
                db.rollback()
                logger.debug("Skipped duplicate: %s (%s)", raw["url"][:60], db_exc)

    logger.info("Scrape complete — %d new articles stored", new_count)
    return new_count
