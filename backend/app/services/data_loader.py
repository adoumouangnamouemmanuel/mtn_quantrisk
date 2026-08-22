"""
Reads the project CSVs into clean in-memory structures.
All paths are relative to the project root (mtn_quantrisk/).
"""
import pandas as pd
from pathlib import Path
from functools import lru_cache

ROOT = Path(__file__).resolve().parents[3]  # …/mtn_quantrisk/

BASE_CASE_CSV      = ROOT / "data/structured/base_case.csv"
DASHBOARD_Q1_2026_CSV = ROOT / "data/structured/dashboard_2026q1.csv"
SCENARIO_DETAIL_CSV = ROOT / "data/structured/scenario_library.csv"
SCENARIO_META_CSV  = ROOT / "mtn_scenario_library.csv"

PILLAR_MAP = {
    "Macro & FX":          ("A", "Macro & FX"),
    "Regulatory":          ("B", "Regulatory"),
    "Technology":          ("C", "Tech & Cyber"),
    "Tech & Cyber":        ("C", "Tech & Cyber"),
    "Competitive":         ("D", "Competitive"),
    "Operational":         ("E", "Operational & Climate"),
    "Operational & Climate": ("E", "Operational & Climate"),
    "Upside":              ("F", "Upside"),
    "Tail Risk":           ("G", "Tail Risk"),
    "Combined":            ("A", "Macro & FX"),
    "Financial":           ("A", "Macro & FX"),
}

KPI_META = {
    # Category uses the six-category risk taxonomy (strategic / financial /
    # operational / technological / governance / external).
    "FIN01": {"name": "Service Revenue",    "category": "financial",     "unit": "GHSm",    "lower": 23000, "upper": 26000},
    "FIN02": {"name": "EBITDA",             "category": "financial",     "unit": "GHSm",    "lower": 14000, "upper": 15500},
    "FIN03": {"name": "EBITDA Margin",      "category": "financial",     "unit": "%",       "lower": 58.0,  "upper": 62.0},
    "FIN04": {"name": "PAT",                "category": "financial",     "unit": "GHSm",    "lower": 7500,  "upper": 8500},
    "FIN05": {"name": "PAT Margin",         "category": "financial",     "unit": "%",       "lower": 31.0,  "upper": 35.0},
    "FIN06": {"name": "Revenue Growth YoY", "category": "financial",     "unit": "%",       "lower": 30.0,  "upper": 40.0},
    "SEG01": {"name": "Data Revenue",       "category": "strategic",     "unit": "GHSm",    "lower": 8000,  "upper": 9000},
    "SEG03": {"name": "MoMo Revenue",       "category": "strategic",     "unit": "GHSm",    "lower": 5500,  "upper": 6500},
    "OPS01": {"name": "Total Subscribers",  "category": "strategic",     "unit": "M",       "lower": 29.0,  "upper": 32.0},
    "OPS04": {"name": "ARPU",               "category": "strategic",     "unit": "GHS",     "lower": 64.0,  "upper": 70.0},
    "OPS07": {"name": "4G Coverage",        "category": "technological", "unit": "%",       "lower": 98.0,  "upper": 100.0},
    "EXT01": {"name": "Inflation",          "category": "external",      "unit": "%",       "lower": 4.0,   "upper": 10.0},
    "EXT02": {"name": "BoG Policy Rate",    "category": "external",      "unit": "%",       "lower": 25.0,  "upper": 30.0},
    "EXT03": {"name": "Cedi/USD",           "category": "external",      "unit": "GHS/USD", "lower": 11.0,  "upper": 13.0},
}

FRONTEND_KPIS = list(KPI_META.keys())


@lru_cache(maxsize=1)
def load_base_case() -> dict:
    """Returns {KPI_ID: float}"""
    df = pd.read_csv(BASE_CASE_CSV, on_bad_lines="skip", encoding="utf-8-sig")
    return dict(zip(df["KPI_ID"].astype(str).str.strip(), df["FY25_Base_Value"].astype(float)))


@lru_cache(maxsize=1)
def load_dashboard_q1_2026() -> dict[str, dict]:
    """Return the dashboard-only Q1 2026 snapshot keyed by KPI ID."""
    df = pd.read_csv(DASHBOARD_Q1_2026_CSV, encoding="utf-8-sig")
    df["KPI_ID"] = df["KPI_ID"].astype(str).str.strip()
    return {row["KPI_ID"]: row.to_dict() for _, row in df.iterrows()}


@lru_cache(maxsize=1)
def load_scenario_details() -> pd.DataFrame:
    """Per-KPI impact rows. Normalises column names to underscores."""
    df = pd.read_csv(SCENARIO_DETAIL_CSV, on_bad_lines="skip", encoding="utf-8-sig")
    df.columns = [c.strip().replace(" ", "_") for c in df.columns]
    # Rename to canonical names used in engine logic
    rename = {
        "Scenario_ID":    "Scenario_ID",
        "Scenario_Name":  "Scenario_Name",
        "KPI_ID":         "KPI_ID",
        "Impact_Type":    "Impact_Type",
        "Impact_Value":   "Impact_Value",
        "Severity":       "Severity",
        "Plausibility":   "Plausibility",
        "Recovery_Qtrs":  "Recovery_Qtrs",
        "Mitigation_Lever": "Mitigation_Lever",
        "Calibration_Source": "Calibration_Source",
        "Description":    "Description",
    }
    df = df.rename(columns=rename)
    df["Scenario_ID"] = df["Scenario_ID"].astype(str).str.strip()
    df["KPI_ID"]      = df["KPI_ID"].astype(str).str.strip()
    return df


@lru_cache(maxsize=1)
def load_scenario_meta() -> pd.DataFrame:
    """Scenario metadata with Pillar from mtn_scenario_library.csv"""
    df = pd.read_csv(SCENARIO_META_CSV, on_bad_lines="skip", encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    df["Scenario ID"] = df["Scenario ID"].astype(str).str.strip()
    return df.drop_duplicates(subset=["Scenario ID"])


def clear_scenario_cache() -> None:
    """Invalidate lru_cache for scenario CSVs after a write."""
    load_scenario_details.cache_clear()
    load_scenario_meta.cache_clear()


def get_kpi_status(value: float, lower: float | None, upper: float | None, kpi_id: str) -> str:
    """Compute Safe/Watch/Warning/Critical from value vs thresholds."""
    # For external KPIs (inflation, rate, FX), higher = worse
    higher_is_worse = kpi_id in ("EXT01", "EXT02", "EXT03")

    if lower is None and upper is None:
        return "Safe"

    if higher_is_worse:
        if upper and value > upper:
            return "Critical"
        if lower and value > lower:
            return "Warning"
        return "Safe"
    else:
        if lower and value < lower * 0.95:
            return "Critical"
        if lower and value < lower:
            return "Warning"
        return "Safe"
