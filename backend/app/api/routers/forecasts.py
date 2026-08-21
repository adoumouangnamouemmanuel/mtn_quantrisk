"""Forecast and historical time-series endpoints."""
from datetime import datetime, timezone, timedelta

import joblib
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, HTTPException
from pathlib import Path

from ...services.history_service import (
    get_quarterly,
    get_quarterly_series,
    get_monthly_series,
)

router = APIRouter(prefix="/api", tags=["forecast"])


MAX_FORECAST_HORIZON_DAYS = 365


def _get_arima_model():
    """Lazily load the FIN01 ARIMA model (cached for the process lifetime)."""
    if not hasattr(_get_arima_model, "_cache"):
        _get_arima_model._cache = {}
    if "arima" not in _get_arima_model._cache:
        model_path = Path(__file__).resolve().parents[4] / "models/artefacts/arima_revenue.joblib"
        if not model_path.exists():
            raise RuntimeError("ARIMA model not found. Run models/train_lstm.py first.")
        _get_arima_model._cache["arima"] = joblib.load(model_path)
    return _get_arima_model._cache["arima"]


@router.get("/forecast/{kpi_id}")
def get_forecast(kpi_id: str, horizon: int = 90):
    """Return a model-driven forecast for a KPI.

    Only FIN01 (Service Revenue) currently has a trained ARIMA model. When no
    trained model exists for the requested KPI — or the model cannot be loaded
    — the endpoint refuses to fabricate numbers and returns HTTP 503 with a
    clear "forecast unavailable" message. There is deliberately no
    random-walk fallback (audit finding C4 / TD-04).
    """
    if horizon < 1 or horizon > MAX_FORECAST_HORIZON_DAYS:
        raise HTTPException(
            status_code=400,
            detail=f"horizon must be between 1 and {MAX_FORECAST_HORIZON_DAYS} days",
        )

    # Only FIN01 has a trained ARIMA forecast model today.
    if kpi_id != "FIN01":
        raise HTTPException(
            status_code=503,
            detail=(
                f"No trained forecast model for KPI {kpi_id}. "
                "Train an ARIMA model for this KPI to enable forecasting."
            ),
        )

    try:
        model = _get_arima_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    q_data = get_quarterly("FIN01")
    if not q_data:
        raise HTTPException(
            status_code=503,
            detail="No quarterly historical data available to anchor a forecast.",
        )

    last_hist_value = q_data[-1]["value"]
    forecast_values = model.forecast(steps=2).tolist()

    now = datetime.now(timezone.utc)
    date1 = now + relativedelta(months=3)
    date2 = now + relativedelta(months=6)
    points = []

    for i in range(horizon + 1):
        dt = now + timedelta(days=i)
        if dt <= date1:
            total = (date1 - now).total_seconds()
            frac = (dt - now).total_seconds() / total if total else 1.0
            val = last_hist_value + (forecast_values[0] - last_hist_value) * frac
        elif dt <= date2:
            total = (date2 - date1).total_seconds()
            frac = (dt - date1).total_seconds() / total if total else 1.0
            val = forecast_values[0] + (forecast_values[1] - forecast_values[0]) * frac
        else:
            val = forecast_values[1]

        band_uncertainty = 0.15 + 0.001 * i
        points.append({
            "date": dt.strftime("%Y-%m-%d"),
            "median": round(val, 2),
            "p50": round(val, 2),
            "p05": round(val * (1 - band_uncertainty), 2),
            "p95": round(val * (1 + band_uncertainty), 2),
            "isHistorical": False,
        })
    return points


@router.get("/forecast/{kpi_id}/events")
def get_event_forecast(kpi_id: str, horizon: int = 90):
    """Real-time, event-aware forecast with per-point drill-down.

    Blends the ARIMA baseline with live news risk events (recency-decayed,
    KPI-mapped) so the forecast reflects the *current* risk picture. Every
    point carries its contributing events and an LLM narrative when an API
    key is available.
    """
    from ...services.forecast_service import build_event_adjusted_forecast

    baseline = get_forecast(kpi_id, horizon)
    return build_event_adjusted_forecast(kpi_id, baseline)


# ── Historical time-series ───────────────────────────────────────────────────

@router.get("/quarterly/{kpi_id}")
def quarterly_series(kpi_id: str):
    data = get_quarterly_series(kpi_id)
    if not data["points"]:
        raise HTTPException(status_code=404, detail=f"No data for KPI {kpi_id}")
    return data


@router.get("/monthly/{kpi_id}")
def monthly_series(kpi_id: str, n_months: int = 36):
    data = get_monthly_series(kpi_id, n_months)
    if not data["points"]:
        raise HTTPException(status_code=404, detail=f"No data for KPI {kpi_id}")
    return data
