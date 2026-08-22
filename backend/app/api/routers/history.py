"""API endpoints for querying persisted forecast adjustments and news reasoning history."""
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history/forecast-adjustments")
def get_forecast_adjustments(
    kpi_id: str = Query(..., description="KPI identifier"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Query persisted forecast adjustment history for a KPI."""
    from ...models.database import SessionLocal
    from ...models.forecast_adjustment import ForecastAdjustment

    with SessionLocal() as db:
        query = (
            db.query(ForecastAdjustment)
            .filter(ForecastAdjustment.kpi_id == kpi_id)
            .order_by(ForecastAdjustment.computed_at.desc())
            .offset(offset)
            .limit(limit)
        )
        records = query.all()
        return [r.to_dict() for r in records]


@router.get("/history/news-reasoning")
def get_news_reasoning_history(
    article_id: str | None = Query(None, description="Filter by article ID"),
    category: str | None = Query(None, description="Filter by risk category"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Query persisted news reasoning breakdowns."""
    from ...models.database import SessionLocal
    from ...models.news_reasoning import NewsReasoningRecord

    with SessionLocal() as db:
        query = db.query(NewsReasoningRecord)
        if article_id:
            query = query.filter(NewsReasoningRecord.article_id == article_id)
        if category:
            query = query.filter(NewsReasoningRecord.category == category)
        records = (
            query.order_by(NewsReasoningRecord.computed_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [r.to_dict() for r in records]


@router.get("/llm/usage")
def get_llm_usage():
    """Return LLM usage statistics from the current process."""
    from ...core.llm_client import get_llm_client

    client = get_llm_client()
    return {
        "totalCostUsd": round(client.total_cost_usd, 6),
        "totalLatencyMs": round(client.total_latency_ms, 1),
        "calls": client.get_usage_log(),
    }
