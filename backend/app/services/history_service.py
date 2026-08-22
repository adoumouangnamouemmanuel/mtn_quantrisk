"""Validated historical KPI series loaded from repository CSV files.

No random or synthetic history is generated here. When monthly observations do
not exist, the monthly endpoint returns the best available quarterly or annual
observations and declares that actual frequency in its metadata.
"""

from pathlib import Path
from typing import Any

import pandas as pd

from .data_loader import ROOT


QUARTERLY_FINANCIAL = ROOT / "data/structured/quarterly.csv"
QUARTERLY_SEGMENTS = ROOT / "data/structured/segments_quarterly.csv"
QUARTERLY_OPERATIONAL = ROOT / "data/structured/operational_quarterly.csv"
MACRO_CONTEXT = ROOT / "data/structured/macro_context.csv"

_QUALITY_LABELS = {"R": "Reported", "I": "Interpolated", "E": "Estimated"}

_KPI_SOURCES: dict[str, dict[str, Any]] = {
    "FIN01": {"path": QUARTERLY_FINANCIAL, "column": "Service_Revenue", "flag": "Service_Revenue_Flag"},
    "FIN02": {"path": QUARTERLY_FINANCIAL, "column": "EBITDA", "flag": "EBITDA_Flag"},
    "FIN03": {"path": QUARTERLY_FINANCIAL, "column": "EBITDA_Margin_Pct", "flag": "EBITDA_Margin_Flag"},
    "FIN04": {"path": QUARTERLY_FINANCIAL, "column": "PAT", "flag": "PAT_Flag"},
    "FIN05": {"path": QUARTERLY_FINANCIAL, "column": "PAT_Margin_Pct", "flag": "PAT_Margin_Flag"},
    "FIN06": {"path": QUARTERLY_FINANCIAL, "column": "Service_Revenue", "flag": "Service_Revenue_Flag", "yoy": True},
    "SEG01": {"path": QUARTERLY_SEGMENTS, "column": "Data_Revenue", "flag": "Data_Flag"},
    "SEG03": {"path": QUARTERLY_SEGMENTS, "column": "MoMo_Revenue", "flag": "MoMo_Flag"},
    "OPS01": {"path": QUARTERLY_OPERATIONAL, "column": "Total_Subscribers_M", "flag": "Subs_Flag"},
    "OPS04": {"path": QUARTERLY_OPERATIONAL, "column": "ARPU_GHS", "flag": "ARPU_Flag"},
    "OPS07": {"path": QUARTERLY_OPERATIONAL, "column": "4G_Coverage_Pct", "flag": "Coverage_Flag"},
    "EXT01": {"path": MACRO_CONTEXT, "column": "Inflation_YoY_Pct", "frequency": "mixed"},
    "EXT02": {"path": MACRO_CONTEXT, "column": "Policy_Rate_Pct", "frequency": "mixed"},
    "EXT03": {"path": MACRO_CONTEXT, "column": "Cedi_USD_Avg", "frequency": "mixed"},
}


def _read_source(kpi_id: str) -> tuple[pd.DataFrame, dict[str, Any]]:
    config = _KPI_SOURCES.get(kpi_id)
    if not config:
        raise ValueError(f"No historical source configured for KPI {kpi_id}")
    path: Path = config["path"]
    frame = pd.read_csv(path, encoding="utf-8-sig", on_bad_lines="error")
    required = {"Period_ID", "Year", config["column"]}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"{path.name} is missing columns: {', '.join(sorted(missing))}")
    return frame, config


def _quality(flag: Any) -> str:
    return _QUALITY_LABELS.get(str(flag).strip().upper(), "Source")


def _series(kpi_id: str, requested_frequency: str, limit: int | None = None) -> dict:
    frame, config = _read_source(kpi_id)
    actual_frequency = config.get("frequency", "quarterly")
    values = pd.to_numeric(frame[config["column"]], errors="coerce")
    if config.get("yoy"):
        values = values.pct_change(periods=4, fill_method=None) * 100

    records = []
    for index, row in frame.assign(_value=values).iterrows():
        value = row["_value"]
        if pd.isna(value):
            continue
        period_id = str(row["Period_ID"])
        row_frequency = str(row.get("Period_Type", actual_frequency)).strip().lower()
        is_quarter = row_frequency == "quarter" or "Q" in period_id.upper()
        if is_quarter:
            quarter = str(row.get("Quarter", period_id[-2:]))
            if quarter.lower() == "nan":
                quarter = period_id[-2:]
            month_number = {"Q1": 3, "Q2": 6, "Q3": 9, "Q4": 12}.get(quarter, 12)
            display = f"FY{str(int(row['Year']))[-2:]}{quarter}"
            month = pd.Timestamp(int(row["Year"]), month_number, 1).strftime("%b %Y")
        else:
            display = f"FY{str(int(row['Year']))[-2:]}"
            month = f"Dec {int(row['Year'])}"
        records.append({
            "period": period_id,
            "quarter": display,
            "month": month,
            "value": round(float(value), 4),
            "quality": _quality(row.get(config.get("flag", ""), "Source")),
        })

    if limit:
        records = records[-limit:]
    qualities = {record["quality"] for record in records}
    path: Path = config["path"]
    metadata = {
        "kpiId": kpi_id,
        "requestedFrequency": requested_frequency,
        "actualFrequency": actual_frequency,
        "sourceFile": path.relative_to(ROOT).as_posix(),
        "sourceModifiedAt": path.stat().st_mtime,
        "lastPeriod": records[-1]["period"] if records else None,
        "pointCount": len(records),
        "containsReported": "Reported" in qualities,
        "containsInterpolated": "Interpolated" in qualities,
        "containsEstimated": "Estimated" in qualities,
        "isSynthetic": False,
        "note": (
            f"No monthly source is available; showing {actual_frequency} observations without interpolation."
            if requested_frequency == "monthly" and actual_frequency != "monthly"
            else "Loaded directly from the repository historical CSV."
        ),
    }
    return {"points": records, "metadata": metadata}


def get_quarterly_series(kpi_id: str) -> dict:
    return _series(kpi_id, "quarterly")


def get_monthly_series(kpi_id: str, n_months: int = 36) -> dict:
    # 36 requested months corresponds to at most 12 quarterly or 3 annual points.
    config = _KPI_SOURCES.get(kpi_id, {})
    actual = config.get("frequency", "quarterly")
    limit = max(1, n_months // (12 if actual in {"annual", "mixed"} else 3))
    return _series(kpi_id, "monthly", limit=limit)


def get_quarterly(kpi_id: str) -> list[dict]:
    """Compatibility helper used by the FIN01 forecast route."""
    return get_quarterly_series(kpi_id)["points"]


def get_monthly(kpi_id: str, n_months: int = 36) -> list[dict]:
    return get_monthly_series(kpi_id, n_months)["points"]


def historical_source_health() -> list[dict]:
    results = []
    for path in dict.fromkeys(config["path"] for config in _KPI_SOURCES.values()):
        try:
            frame = pd.read_csv(path, encoding="utf-8-sig", on_bad_lines="error")
            results.append({
                "name": path.name,
                "status": "Healthy" if len(frame) else "Failed",
                "path": path.relative_to(ROOT).as_posix(),
                "rows": len(frame),
                "lastModifiedAt": path.stat().st_mtime,
                "error": None,
            })
        except Exception as exc:
            results.append({
                "name": path.name,
                "status": "Failed",
                "path": path.relative_to(ROOT).as_posix(),
                "rows": 0,
                "lastModifiedAt": None,
                "error": str(exc),
            })
    return results
