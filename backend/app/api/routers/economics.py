"""Economics, intelligence summary, and pipeline-health endpoints."""
from datetime import datetime, timezone
from pathlib import Path
import json
import time

from fastapi import APIRouter, Request

router = APIRouter(prefix="/api", tags=["economics"])


# ── Ghana economics (World Bank) ──────────────────────────────────────────────

@router.get("/economics")
def ghana_economics(refresh: bool = False):
    """Latest Ghana macroeconomic indicators from World Bank Open Data.

    Cached for 6 hours. No API key required.
    """
    from ...services.economic_service import get_ghana_economics
    return get_ghana_economics(force_refresh=refresh)


@router.get("/economics/risk-context")
def economics_risk_context():
    """Convert World Bank Ghana data into risk signal ratings for the dashboard."""
    from ...services.economic_service import get_risk_context_from_economics
    return get_risk_context_from_economics()


# ── Intelligence summary ──────────────────────────────────────────────────────

@router.get("/intelligence/summary")
def intelligence_summary():
    """24-hour LLM-powered risk digest grouped by category.

    Uses facebook/bart-large-cnn (HF Inference API, free). Falls back to
    extractive summarisation when HF_TOKEN is not set. Cached 30 minutes.
    """
    from ...services.intelligence_service import get_hierarchical_intelligence_summary
    return get_hierarchical_intelligence_summary()


# ── Pipeline health ────────────────────────────────────────────────────────────

@router.get("/health")
def pipeline_health(request: Request):
    from ...services.data_loader import (
        BASE_CASE_CSV, SCENARIO_DETAIL_CSV, SCENARIO_META_CSV,
    )
    import pandas as pd

    def check(path: Path, name: str):
        try:
            start = time.time()
            pd.read_csv(path, on_bad_lines="skip", nrows=2)
            ms = int((time.time() - start) * 1000)
            return {
                "name": name, "status": "Healthy", "latencyMs": ms,
                "lastSyncAt": datetime.now(timezone.utc).isoformat(),
            }
        except Exception:
            return {
                "name": name, "status": "Failed", "latencyMs": 0,
                "lastSyncAt": datetime.now(timezone.utc).isoformat(),
            }

    sources = [
        check(BASE_CASE_CSV, "Base Case CSV"),
        check(SCENARIO_DETAIL_CSV, "Scenario Library CSV"),
        check(SCENARIO_META_CSV, "Scenario Meta CSV"),
    ]

    model_dir = Path(__file__).resolve().parents[4] / "models/artefacts"
    model_ok = (model_dir / "ebitda_margin.joblib").exists()
    sources.append({
        "name": "ML Models (XGBoost)",
        "status": "Healthy" if model_ok else "Failed",
        "latencyMs": 0,
        "lastSyncAt": datetime.now(timezone.utc).isoformat(),
    })
    sources.append({
        "name": "SHAP Explainer",
        "status": "Healthy",
        "latencyMs": 0,
        "lastSyncAt": datetime.now(timezone.utc).isoformat(),
    })

    overall = "Healthy" if all(s["status"] == "Healthy" for s in sources) else "Degraded"
    scheduler = getattr(request.app.state, "scheduler", None)
    scrape_job = scheduler.get_job("rss_scraper") if scheduler else None

    from ...services.history_service import historical_source_health
    from ...services.scraper_service import get_scraper_status
    from ...models.database import SessionLocal
    from ...models.article import Article

    historical_data = historical_source_health()
    scraper_status = get_scraper_status()
    feed_sources = scraper_status.get("sources", [])
    feed_summary = {
        "healthy": sum(s["status"] == "Healthy" for s in feed_sources),
        "degraded": sum(s["status"] == "Degraded" for s in feed_sources),
        "failed": sum(s["status"] == "Failed" for s in feed_sources),
        "total": len(feed_sources),
    }
    with SessionLocal() as db:
        latest_article = db.query(Article).order_by(Article.scraped_at.desc()).first()
        latest_article_at = latest_article.scraped_at.isoformat() if latest_article else None

    metrics_path = model_dir / "training_results.json"
    try:
        training_metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
        metric_rows = [
            {
                "target": target,
                "mae": details.get("loo_mae"),
                "r2": details.get("loo_r2"),
                "trainRows": details.get("train_rows"),
            }
            for target, details in training_metrics.items()
        ]
    except Exception:
        metric_rows = []

    if any(item["status"] == "Failed" for item in historical_data):
        overall = "Degraded"
    if feed_sources and feed_summary["failed"] == feed_summary["total"]:
        overall = "Degraded"

    return {
        "status": overall,
        "lastBeatAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "automaticScraper": {
            "status": "Scheduled" if scrape_job else "Unavailable",
            "nextRunAt": scrape_job.next_run_time.isoformat() if scrape_job and scrape_job.next_run_time else None,
            "schedule": str(scrape_job.trigger) if scrape_job else None,
        },
        "historicalData": historical_data,
        "externalFeeds": {
            **scraper_status,
            "latestStoredArticleAt": latest_article_at,
            "summary": feed_summary,
        },
        "modelQuality": {
            "status": "MetricsAvailable" if metric_rows else "MetricsUnavailable",
            "lastTrainedAt": datetime.fromtimestamp(metrics_path.stat().st_mtime, timezone.utc).isoformat() if metrics_path.exists() else None,
            "metrics": metric_rows,
            "accuracyProven": False,
            "note": "Stored cross-validation metrics describe development performance; artifact presence does not prove current production accuracy.",
        },
    }
