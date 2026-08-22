"""KPI endpoints."""
from fastapi import APIRouter, HTTPException

from ...services.scenario_service import get_all_kpis

router = APIRouter(prefix="/api", tags=["kpis"])


@router.get("/kpis")
def list_kpis(period: str | None = None):
    if period not in (None, "2025FY", "2026Q1"):
        raise HTTPException(status_code=400, detail="Supported periods: 2025FY, 2026Q1")
    return get_all_kpis(period)
