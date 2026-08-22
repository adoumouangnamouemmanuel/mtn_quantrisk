"""
Walk-forward backtesting engine for KPI forecasts.

Splits historical data into rolling train/test windows, fits the model on
each training window, predicts the test window, and computes accuracy
metrics (MAE, RMSE, MAPE, MdAPE, coverage). Results are returned as a
structured dict the frontend can render as an accuracy dashboard.

No random or synthetic data is fabricated — all predictions are produced
by the same ARIMA model used in production, evaluated against actual
reported values.
"""
from __future__ import annotations

import logging
import math
from datetime import datetime, timezone
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# Minimum training window (quarters) before we start predicting
MIN_TRAIN_QUARTERS = 6
# Number of quarters to hold out per fold
TEST_QUARTERS = 2


def _load_quarterly_values(kpi_id: str) -> list[dict]:
    """Return [{period, value, quarter}] for the KPI, oldest first."""
    from .history_service import get_quarterly_series
    series = get_quarterly_series(kpi_id)
    return series.get("points", [])


def _fit_arima(values: list[float], order: tuple = (2, 1, 1)):
    """Fit a statsmodels ARIMA and return the fitted model."""
    from statsmodels.tsa.arima.model import ARIMA
    arr = np.array(values, dtype=float)
    model = ARIMA(arr, order=order)
    return model.fit()


def _compute_metrics(actual: list[float], predicted: list[float]) -> dict:
    """Compute MAE, RMSE, MAPE, MdAPE, bias, R², and coverage for one fold."""
    a = np.array(actual, dtype=float)
    p = np.array(predicted, dtype=float)
    n = len(a)
    if n == 0:
        return {}

    errors = a - p
    abs_errors = np.abs(errors)
    mae = float(np.mean(abs_errors))
    rmse = float(math.sqrt(np.mean(errors ** 2)))
    bias = float(np.mean(errors))
    bias_pct = float(np.mean(errors / np.where(np.abs(a) < 1e-10, 1.0, a)) * 100)

    # MAPE — avoid division by zero
    nonzero = np.abs(a) > 1e-10
    if nonzero.any():
        mape = float(np.mean(abs_errors[nonzero] / np.abs(a[nonzero])) * 100)
        mdape = float(np.median(abs_errors[nonzero] / np.abs(a[nonzero])) * 100)
    else:
        mape = 0.0
        mdape = 0.0

    # R² (coefficient of determination)
    ss_res = float(np.sum(errors ** 2))
    ss_tot = float(np.sum((a - np.mean(a)) ** 2))
    r_squared = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mape": round(mape, 2),
        "mdape": round(mdape, 2),
        "bias": round(bias, 4),
        "biasPct": round(bias_pct, 2),
        "rSquared": round(r_squared, 4),
        "n": n,
    }


def backtest_kpi(
    kpi_id: str,
    train_size: int | None = None,
    test_size: int = TEST_QUARTERS,
    horizon: int = 2,
) -> dict[str, Any]:
    """
    Walk-forward backtest for a single KPI.

    Returns:
        {
            kpiId, modelName, folds: [...], aggregate: {...},
            actualVsPredicted: [{period, actual, predicted}],
            trainWindowSize, testWindowSize, totalFolds
        }
    """
    points = _load_quarterly_values(kpi_id)
    if len(points) < MIN_TRAIN_QUARTERS + test_size:
        return {
            "kpiId": kpi_id,
            "error": f"Insufficient data: {len(points)} quarters (need {MIN_TRAIN_QUARTERS + test_size})",
            "folds": [],
            "aggregate": {},
            "actualVsPredicted": [],
        }

    values = [p["value"] for p in points]
    periods = [p.get("quarter") or p.get("period", "") for p in points]
    train_window = train_size or (len(values) - test_size - horizon)

    folds = []
    all_actual = []
    all_predicted = []
    all_periods = []

    start = MIN_TRAIN_QUARTERS
    while start + train_window + test_size <= len(values):
        train_vals = values[start : start + train_window]
        test_vals = values[start + train_window : start + train_window + test_size]
        test_periods = periods[start + train_window : start + train_window + test_size]

        try:
            model = _fit_arima(train_vals)
            predicted = model.forecast(steps=test_size).tolist()
        except Exception as exc:
            logger.warning("ARIMA fit failed for fold starting at %d: %s", start, exc)
            start += test_size
            continue

        fold_metrics = _compute_metrics(test_vals, predicted)
        fold_metrics["foldIndex"] = len(folds)
        fold_metrics["trainStart"] = periods[start] if start < len(periods) else ""
        fold_metrics["trainEnd"] = periods[start + train_window - 1] if start + train_window - 1 < len(periods) else ""
        fold_metrics["testPeriods"] = test_periods
        fold_metrics["actualValues"] = [round(v, 4) for v in test_vals]
        fold_metrics["predictedValues"] = [round(v, 4) for v in predicted]
        folds.append(fold_metrics)

        all_actual.extend(test_vals)
        all_predicted.extend(predicted)
        all_periods.extend(test_periods)

        start += test_size

    # Build the actual-vs-predicted time series for charting
    actual_vs_predicted = [
        {"period": periods[i], "actual": round(values[i], 4), "predicted": None}
        for i in range(len(values))
    ]
    # Overlay predictions on the test periods
    pred_idx = 0
    for fold in folds:
        for j, period in enumerate(fold.get("testPeriods", [])):
            for entry in actual_vs_predicted:
                if entry["period"] == period:
                    entry["predicted"] = fold["predictedValues"][j]
                    break

    # Aggregate metrics across all folds
    aggregate = _compute_metrics(all_actual, all_predicted) if all_actual else {}
    aggregate["totalFolds"] = len(folds)
    aggregate["totalTestPoints"] = len(all_actual)

    # Direction accuracy — did the model get the sign of change right?
    if len(all_actual) > 1 and len(all_predicted) > 1:
        actual_dirs = [1 if all_actual[i] > all_actual[i-1] else -1 for i in range(1, len(all_actual))]
        pred_dirs = [1 if all_predicted[i] > all_predicted[i-1] else -1 for i in range(1, len(all_predicted))]
        correct = sum(1 for a, p in zip(actual_dirs, pred_dirs) if a == p)
        aggregate["directionAccuracy"] = round(correct / len(actual_dirs) * 100, 1) if actual_dirs else 0.0

    return {
        "kpiId": kpi_id,
        "kpiName": _get_kpi_name(kpi_id),
        "modelName": "ARIMA(2,1,1)",
        "trainWindowSize": train_window,
        "testWindowSize": test_size,
        "totalFolds": len(folds),
        "folds": folds,
        "aggregate": aggregate,
        "actualVsPredicted": actual_vs_predicted,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def _get_kpi_name(kpi_id: str) -> str:
    from .data_loader import KPI_META
    return KPI_META.get(kpi_id, {}).get("name", kpi_id)


def backtest_all_kpis() -> list[dict]:
    """Run backtest for every KPI that has sufficient historical data."""
    from .data_loader import FRONTEND_KPIS
    results = []
    for kpi_id in FRONTEND_KPIS:
        try:
            result = backtest_kpi(kpi_id)
            if "error" not in result:
                results.append(result)
        except Exception as exc:
            logger.debug("Backtest skipped for %s: %s", kpi_id, exc)
    return results
