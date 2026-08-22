"""News feed and alerts endpoints."""
from datetime import date

from fastapi import APIRouter, HTTPException, Query

from ...models.database import SessionLocal
from ...services.news_service import (
    list_news as _list_news,
    get_news_summary,
    get_news_by_id,
)
from ...services.alert_service import (
    list_alerts as _list_alerts,
    get_alert_summary,
    acknowledge_alert as _ack_alert,
)
from ...services.scraper_service import run_scrape_and_store

router = APIRouter(prefix="/api", tags=["news"])


# ── News feed ─────────────────────────────────────────────────────────────────

@router.get("/news")
def list_news(
    category: str | None = None,
    source: str | None = None,
    q: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Paginated list of scraped articles with NLP risk scores."""
    with SessionLocal() as db:
        return _list_news(
            db, category=category, source=source, keyword=q,
            date_from=date_from, date_to=date_to, limit=limit, offset=offset,
        )


@router.get("/news/summary")
def news_summary():
    """Dashboard summary: articles today, top category, category breakdown."""
    with SessionLocal() as db:
        return get_news_summary(db)


@router.get("/news/{article_id}")
def get_news_article(article_id: str):
    """Full article detail — includes body, entities, keyword_hits."""
    with SessionLocal() as db:
        result = get_news_by_id(db, article_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Article {article_id} not found")
    return result


@router.get("/news/{article_id}/reasoning")
def get_news_reasoning(article_id: str):
    """Explain *why* an article has its relevance, severity, and category.

    Returns the matched keywords, entity hits, impact formula breakdown, and an
    optional LLM narrative. Powers the drill-down panel on the news page.
    """
    from ...services.news_reasoning_service import build_reasoning

    result = build_reasoning(article_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Article {article_id} not found")
    return result


@router.post("/news/scrape")
def trigger_scrape():
    """Manually trigger a scrape cycle (useful for testing)."""
    count = run_scrape_and_store()
    return {"newArticles": count, "status": "ok"}


# ── Alerts ────────────────────────────────────────────────────────────────────

@router.get("/alerts")
def list_alerts(
    tier: str | None = None,
    acknowledged: bool | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List alerts — filter by tier (Critical/Warning/Watch) and acknowledged status."""
    with SessionLocal() as db:
        return _list_alerts(db, tier=tier, acknowledged=acknowledged, limit=limit, offset=offset)


@router.get("/alerts/summary")
def alerts_summary():
    """Active alert counts per tier — used by the dashboard."""
    with SessionLocal() as db:
        return get_alert_summary(db)


@router.patch("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    """Mark an alert as acknowledged."""
    with SessionLocal() as db:
        result = _ack_alert(db, alert_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return result
