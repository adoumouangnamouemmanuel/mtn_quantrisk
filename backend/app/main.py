import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .api.auth import router as auth_router
from .core.security import get_current_user
from .core.rate_limit import RateLimitMiddleware
from .core.metrics import MetricsMiddleware, metrics_endpoint
from .core.audit import AuditMiddleware

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_scrape_interval_minutes() -> int:
    """Return the configured automatic scrape interval in minutes."""
    interval = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "15"))
    if interval < 1:
        raise ValueError("SCRAPE_INTERVAL_MINUTES must be at least 1")
    return interval


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("Starting MTN QuantRisk API...")

    # 1. Create SQLite tables
    try:
        from .models.database import init_db
        init_db()
        logger.info("SQLite tables ready")
    except Exception as exc:
        logger.error("DB init failed: %s", exc)

    # 2. Start APScheduler — scrape immediately in the background, then at the
    # configured interval. Keeping the initial scrape off the lifespan thread
    # lets the API become ready even when many articles need NLP processing.
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from .services.scraper_service import run_scrape_and_store

        scrape_interval = get_scrape_interval_minutes()
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            run_scrape_and_store,
            "interval",
            minutes=scrape_interval,
            id="rss_scraper",
            replace_existing=True,
            coalesce=True,
            max_instances=1,
            misfire_grace_time=scrape_interval * 60,
            next_run_time=datetime.now(timezone.utc),
        )
        scheduler.start()
        app.state.scheduler = scheduler
        logger.info(
            "APScheduler started — scraping every %d minutes",
            scrape_interval,
        )
    except Exception as exc:
        logger.warning("APScheduler not started (non-fatal): %s", exc)

    yield  # ── App is running ─────────────────────────────────────────────

    # ── Shutdown ─────────────────────────────────────────────────────────────
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")


app = FastAPI(
    title="MTN QuantRisk API",
    description="AI-powered quantitative risk intelligence for MTN Ghana",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(MetricsMiddleware)
app.add_middleware(AuditMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routes (no auth required)
app.include_router(auth_router)

# Protected API routes — all /api/* endpoints require a valid JWT
app.include_router(router, dependencies=[Depends(get_current_user)])


@app.get("/")
def root():
    return {"status": "ok", "service": "MTN QuantRisk API", "version": "2.1.0"}


# Prometheus metrics — intentionally public (no auth) so scrapers can poll.
@app.get("/metrics")
def metrics():
    return metrics_endpoint()