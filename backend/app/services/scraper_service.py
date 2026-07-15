"""
RSS scraper + optional GNews API — pulls articles from 13 Ghana/Africa sources every 15 min.
Set GNEWS_TOKEN env var (free at gnews.io) to also search for MTN-specific articles.
"""

import logging
import os
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Optional

import feedparser

GNEWS_TOKEN = os.environ.get("GNEWS_TOKEN", "")

logger = logging.getLogger(__name__)

# ── Source registry ───────────────────────────────────────────────────────────

RSS_SOURCES = [
    # ── Ghana local ──────────────────────────────────────────────────────────
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
        "name": "Modern Ghana",
        "url": "https://www.modernghana.com/rss/news.aspx",
        "category_hint": "ghana_local",
    },
    {
        "name": "GhanaWeb",
        "url": "https://www.ghanaweb.com/GhanaHomePage/rss/",
        "category_hint": "ghana_local",
    },
    {
        "name": "Graphic Online",
        "url": "https://www.graphic.com.gh/feed",
        "category_hint": "ghana_local",
    },
    {
        "name": "Ghana Business News",
        "url": "https://www.ghanabusinessnews.com/feed/",
        "category_hint": "ghana_business",
    },
    {
        "name": "Pulse Ghana",
        "url": "https://www.pulse.com.gh/rss",
        "category_hint": "ghana_local",
    },
    # ── Tech & Telecom ────────────────────────────────────────────────────────
    {
        "name": "TechCabal",
        "url": "https://techcabal.com/feed/",
        "category_hint": "tech_telecom",
    },
    {
        "name": "Disrupt Africa",
        "url": "https://disrupt-africa.com/feed/",
        "category_hint": "tech_telecom",
    },
    # ── Africa / Global Finance ───────────────────────────────────────────────
    {
        "name": "BBC Africa",
        "url": "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
        "category_hint": "global_finance",
    },
    {
        "name": "The Africa Report",
        "url": "https://www.theafricareport.com/feed/",
        "category_hint": "global_finance",
    },
    {
        "name": "African Business",
        "url": "https://african.business/feed/",
        "category_hint": "global_finance",
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


# ── GNews API (optional, free 100 req/day) ───────────────────────────────────

def _fetch_gnews(query: str = "MTN Ghana telecom", max_results: int = 10) -> list[dict]:
    """
    Fetch targeted articles from GNews free tier (100 req/day).
    Requires GNEWS_TOKEN env var — get one free at https://gnews.io/
    Returns same shape as scrape_all_sources().
    """
    if not GNEWS_TOKEN:
        return []
    try:
        import requests
        url = "https://gnews.io/api/v4/search"
        params = {
            "q": query,
            "token": GNEWS_TOKEN,
            "lang": "en",
            "max": max_results,
            "sortby": "publishedAt",
        }
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code != 200:
            logger.warning("GNews returned %s: %s", resp.status_code, resp.text[:200])
            return []
        data = resp.json().get("articles", [])
        articles = []
        for a in data:
            pub = a.get("publishedAt")
            try:
                pub_dt = datetime.fromisoformat(pub.replace("Z", "+00:00")) if pub else None
            except Exception:
                pub_dt = None
            articles.append({
                "url":         a.get("url", ""),
                "title":       a.get("title", "").strip(),
                "body":        a.get("content") or a.get("description") or "",
                "source_name": a.get("source", {}).get("name", "GNews"),
                "source_url":  a.get("source", {}).get("url", ""),
                "published_at": pub_dt,
            })
        logger.info("GNews returned %d articles for query '%s'", len(articles), query)
        return articles
    except Exception as exc:
        logger.error("GNews fetch failed: %s", exc)
        return []


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

    # Augment with targeted GNews search for MTN-specific articles
    raw_articles += _fetch_gnews("MTN Ghana telecom MoMo", max_results=10)
    raw_articles += _fetch_gnews("Ghana cedi inflation NCA regulation", max_results=10)

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
