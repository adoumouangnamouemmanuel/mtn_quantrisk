"""Aggregated API router.

This module composes the per-feature routers under ``app/api/routers/`` into a
single router that ``main.py`` mounts behind the JWT dependency. Each feature
domain (kpis, scenarios, forecasts, briefs, news, economics) lives in its own
module for maintainability (audit finding M1 / TD-07).
"""
from fastapi import APIRouter

from .routers import kpis, scenarios, forecasts, briefs, news, economics, history, backtest, monte_carlo, stress_test, admin

router = APIRouter()

# Feature routers are mounted flat (each already carries its own /api prefix).
router.include_router(kpis.router)
router.include_router(scenarios.router)
router.include_router(forecasts.router)
router.include_router(briefs.router)
router.include_router(news.router)
router.include_router(economics.router)
router.include_router(history.router)
router.include_router(backtest.router)
router.include_router(monte_carlo.router)
router.include_router(stress_test.router)
router.include_router(admin.router)
