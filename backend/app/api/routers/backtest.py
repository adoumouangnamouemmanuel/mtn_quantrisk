"""Backtesting and model accuracy endpoints."""
from fastapi import APIRouter, HTTPException

from ...services.backtest_service import backtest_kpi, backtest_all_kpis

router = APIRouter(prefix="/api", tags=["backtest"])


@router.get("/backtest/{kpi_id}")
def get_backtest(kpi_id: str, train_size: int | None = None, test_size: int = 2):
    """Walk-forward backtest for a single KPI.

    Returns actual-vs-predicted time series, per-fold metrics, and
    aggregate accuracy statistics (MAE, RMSE, MAPE, direction accuracy).
    """
    result = backtest_kpi(kpi_id, train_size=train_size, test_size=test_size)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


@router.get("/backtest")
def get_all_backtests():
    """Backtest every KPI with sufficient historical data."""
    return backtest_all_kpis()
