import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


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

    # 2. Run initial scrape so the news feed isn't empty on first boot
    try:
        from .services.scraper_service import run_scrape_and_store
        count = run_scrape_and_store()
        logger.info("Initial scrape: %d new articles", count)
    except Exception as exc:
        logger.warning("Initial scrape failed (non-fatal): %s", exc)

    # 3. Start APScheduler — scrape every 15 minutes
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from .services.scraper_service import run_scrape_and_store

        scheduler = BackgroundScheduler()
        scheduler.add_job(run_scrape_and_store, "interval", minutes=15, id="rss_scraper")
        scheduler.start()
        app.state.scheduler = scheduler
        logger.info("APScheduler started — scraping every 15 minutes")
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
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"status": "ok", "service": "MTN QuantRisk API", "version": "2.0.0"}
