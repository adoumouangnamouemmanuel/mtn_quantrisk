"""
Applies scenario impacts to the base case and returns ScenarioOutput-shaped data.
Also handles the scenario list / single-scenario lookups.
"""
import random
import math
from datetime import datetime, timezone
from .data_loader import (
    load_base_case, load_scenario_details, load_scenario_meta,
    KPI_META, FRONTEND_KPIS, PILLAR_MAP, get_kpi_status,
    SCENARIO_DETAIL_CSV, SCENARIO_META_CSV, clear_scenario_cache,
)

# Default macro values used for SHAP explanation calls
DEFAULT_MACRO = {
    "Inflation_YoY_Pct":      5.4,
    "Policy_Rate_Pct":       28.0,
    "Cedi_USD_Avg":          11.6,
    "GDP_Growth_Pct":         5.0,
    "Mobile_Penetration_Pct": 148.0,
    "Data_Penetration_Pct":   72.0,
}


def _trend24m(base_val: float) -> list:
    """Generate a plausible 24-month sparkline around a base value."""
    random.seed(int(abs(base_val)) % 9999)
    return [float(base_val * (1 + random.uniform(-0.08, 0.08))) for _ in range(24)]


def get_all_kpis() -> list:
    base = load_base_case()
    kpis = []
    for kid in FRONTEND_KPIS:
        meta = KPI_META[kid]
        val  = float(base.get(kid, 0.0))
        kpis.append({
            "id":             kid,
            "name":           meta["name"],
            "category":       meta["category"],
            "unit":           meta["unit"],
            "fy25Value":      float(round(val, 4)),
            "lowerThreshold": float(meta["lower"]),
            "upperThreshold": float(meta["upper"]),
            "currentStatus":  get_kpi_status(val, meta["lower"], meta["upper"], kid),
            "trend24m":       _trend24m(val),
        })
    return kpis


def _build_scenario_obj(sc_id: str, detail_df, meta_df) -> dict | None:
    sc_rows = detail_df[detail_df["Scenario_ID"] == sc_id]
    if sc_rows.empty:
        return None

    first = sc_rows.iloc[0]

    # Metadata from mtn_scenario_library.csv
    meta_row = meta_df[meta_df["Scenario ID"] == sc_id]
    if not meta_row.empty:
        mr = meta_row.iloc[0]
        raw_pillar   = str(mr.get("Pillar", "Macro & FX")).strip()
        pillar_id, pillar_name = PILLAR_MAP.get(raw_pillar, ("A", "Macro & FX"))
        sc_name      = str(mr.get("Name", first.get("Scenario_Name", sc_id))).strip()
        description  = str(mr.get("Trigger Phrase(s)", "")).strip()
        sc_type      = str(mr.get("Type", first.get("Type", "Stress"))).strip()
    else:
        pillar_id, pillar_name = "A", "Macro & FX"
        sc_name     = str(first.get("Scenario_Name", sc_id)).strip()
        description = str(first.get("Description", "")).strip()
        sc_type     = str(first.get("Type", "Stress")).strip()

    # Severity / plausibility
    try:
        severity = int(float(first.get("Severity", 3)))
    except (ValueError, TypeError):
        severity = 3
    try:
        plausibility = int(float(first.get("Plausibility", 3)))
    except (ValueError, TypeError):
        plausibility = 3

    # KPI impacts
    impacts = []
    for _, row in sc_rows.iterrows():
        kid  = str(row.get("KPI_ID", "")).strip()
        itype = str(row.get("Impact_Type", "pct")).strip()
        try:
            ival = float(row.get("Impact_Value", 0))
        except (ValueError, TypeError):
            ival = 0.0
        if kid and itype in ("pct", "delta", "abs"):
            impacts.append({"kpiId": kid, "type": itype, "value": ival})

    calib = str(first.get("Calibration_Source", "Historical Volatility")).strip()

    return {
        "id":               sc_id,
        "pillar":           pillar_id,
        "pillarName":       pillar_name,
        "type":             sc_type if sc_type in ("Stress","Shock","Combined","Upside") else "Stress",
        "name":             sc_name,
        "description":      description,
        "severity":         max(1, min(5, severity)),
        "plausibility":     max(1, min(5, plausibility)),
        "calibrationAnchor": calib,
        "lastCalibrated":   "2026-06-01T00:00:00Z",
        "owner":            "MTN Risk Team",
        "kpiImpacts":       impacts,
    }


def get_all_scenarios() -> list:
    detail_df = load_scenario_details()
    meta_df   = load_scenario_meta()
    sc_ids    = sorted(detail_df["Scenario_ID"].unique(), key=lambda x: int(x[1:]) if x[1:].isdigit() else 999)
    result = []
    for sc_id in sc_ids:
        obj = _build_scenario_obj(sc_id, detail_df, meta_df)
        if obj:
            result.append(obj)
    return result


def get_scenario_by_id(sc_id: str) -> dict | None:
    detail_df = load_scenario_details()
    meta_df   = load_scenario_meta()
    return _build_scenario_obj(sc_id, detail_df, meta_df)


def apply_scenario(sc_id: str, severity_multiplier: float, macro_overlays: dict) -> dict:
    """
    Apply scenario impacts to the base case.
    macro_overlays keys: cediShockPct, inflationOverlayPp, policyRateOverlayPp
    Returns ScenarioOutput-shaped dict.
    """
    base      = load_base_case()
    detail_df = load_scenario_details()

    sc_rows = detail_df[detail_df["Scenario_ID"] == sc_id]
    if sc_rows.empty:
        raise ValueError(f"Scenario {sc_id} not found")

    stressed = dict(base)

    # Apply scenario impacts
    for _, row in sc_rows.iterrows():
        kid   = str(row.get("KPI_ID", "")).strip()
        itype = str(row.get("Impact_Type", "pct")).strip()
        try:
            ival = float(row.get("Impact_Value", 0)) * severity_multiplier
        except (ValueError, TypeError):
            continue
        if kid not in stressed:
            continue

        bv = base[kid]
        if itype == "pct":
            stressed[kid] = bv * (1 + ival / 100)
        elif itype == "delta":
            stressed[kid] = bv + ival
        elif itype == "abs":
            stressed[kid] = ival

    # Apply macro overlays (translate slider values to KPI overrides)
    cedi_shock   = macro_overlays.get("cediShockPct", 0)
    infl_overlay = macro_overlays.get("inflationOverlayPp", 0)
    rate_overlay = macro_overlays.get("policyRateOverlayPp", 0)

    if cedi_shock and "EXT03" in stressed:
        stressed["EXT03"] = base["EXT03"] * (1 + cedi_shock / 100)
        # Cedi shock also hits revenue
        if "FIN01" in stressed:
            stressed["FIN01"] *= (1 - abs(cedi_shock) * 0.003)
    if infl_overlay and "EXT01" in stressed:
        stressed["EXT01"] = base.get("EXT01", 5.4) + infl_overlay
    if rate_overlay and "EXT02" in stressed:
        stressed["EXT02"] = base.get("EXT02", 28.0) + rate_overlay

    # Build results for frontend KPIs only
    results = []
    for kid in FRONTEND_KPIS:
        bv = base.get(kid, 0.0)
        sv = stressed.get(kid, bv)
        delta_pct = ((sv - bv) / bv * 100) if bv != 0 else 0.0
        meta = KPI_META[kid]
        status = get_kpi_status(sv, meta["lower"], meta["upper"], kid)
        results.append({
            "kpiId":         kid,
            "baseValue":     float(round(bv, 4)),
            "scenarioValue": float(round(sv, 4)),
            "deltaPct":      float(round(delta_pct, 3)),
            "status":        status,
        })

    # SHAP attributions — try real model, fall back to heuristic
    shap_attrs = _get_shap_attributions(sc_id, severity_multiplier)

    return {
        "scenarioId":        sc_id,
        "severityMultiplier": severity_multiplier,
        "results":           results,
        "shapAttributions":  shap_attrs,
        "generatedAt":       datetime.now(timezone.utc).isoformat(),
    }


def _get_shap_attributions(sc_id: str, severity: float) -> list:
    """Try real SHAP, fall back to heuristic ranking."""
    try:
        import sys
        from pathlib import Path
        proj_root = Path(__file__).resolve().parents[4]
        if str(proj_root) not in sys.path:
            sys.path.insert(0, str(proj_root))
        from models.explain import explain_kpi
        result = explain_kpi("FIN03", DEFAULT_MACRO)
        if "error" not in result:
            attrs = []
            for feat in result["ranked_drivers"]:
                info = result["explanation"][feat]
                attrs.append({"feature": feat, "contribution": info["shap_value"]})
            return attrs
    except Exception:
        pass

    # Heuristic fallback
    features = [
        ("Cedi_USD_Avg",          -0.38 * severity),
        ("Inflation_YoY_Pct",     -0.22 * severity),
        ("Policy_Rate_Pct",       -0.18 * severity),
        ("GDP_Growth_Pct",         0.12 * severity),
        ("Mobile_Penetration_Pct", 0.06),
        ("Data_Penetration_Pct",   0.04),
    ]
    return [{"feature": f, "contribution": round(v, 5)} for f, v in features]


# ── CRUD helpers ───────────────────────────────────────────────────────────────

_PILLAR_ID_TO_NAME = {
    "A": "Macro & FX",
    "B": "Regulatory",
    "C": "Tech & Cyber",
    "D": "Competitive",
    "E": "Operational & Climate",
    "F": "Upside",
    "G": "Tail Risk",
}


def _read_raw_detail():
    import pandas as pd
    df = pd.read_csv(SCENARIO_DETAIL_CSV, on_bad_lines="skip", encoding="utf-8-sig")
    df.columns = [c.strip().replace(" ", "_") for c in df.columns]
    df["Scenario_ID"] = df["Scenario_ID"].astype(str).str.strip()
    return df


def _read_raw_meta():
    import pandas as pd
    df = pd.read_csv(SCENARIO_META_CSV, on_bad_lines="skip", encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    df["Scenario ID"] = df["Scenario ID"].astype(str).str.strip()
    return df


def _next_scenario_id() -> str:
    df = _read_raw_detail()
    ids = df["Scenario_ID"].astype(str).tolist()
    nums = [int(i[1:]) for i in ids if len(i) > 1 and i[0] == "S" and i[1:].isdigit()]
    return f"S{max(nums, default=87) + 1}"


def _detail_rows_for(sc_id: str, data: dict) -> list:
    impacts = data.get("kpiImpacts", [])
    if not impacts:
        impacts = [{"kpiId": "FIN01", "type": "pct", "value": 0.0}]
    rows = []
    for imp in impacts:
        rows.append({
            "Scenario_ID":       sc_id,
            "Scenario_Name":     data["name"],
            "KPI_ID":            imp["kpiId"],
            "Impact_Type":       imp["type"],
            "Impact_Value":      float(imp["value"]),
            "Severity":          int(data.get("severity", 3)),
            "Plausibility":      int(data.get("plausibility", 3)),
            "Recovery_Qtrs":     4,
            "Mitigation_Lever":  "",
            "Calibration_Source": data.get("calibrationAnchor", ""),
            "Description":       data.get("description", ""),
            "Type":              data.get("type", "Stress"),
        })
    return rows


def _meta_row_for(sc_id: str, data: dict) -> dict:
    pillar_name = _PILLAR_ID_TO_NAME.get(data.get("pillar", "A"), "Macro & FX")
    return {
        "Scenario ID":      sc_id,
        "Pillar":           pillar_name,
        "Name":             data["name"],
        "Type":             data.get("type", "Stress"),
        "Trigger Phrase(s)": data.get("description", ""),
    }


def create_scenario(data: dict) -> dict:
    import pandas as pd
    sc_id = _next_scenario_id()

    detail_df = _read_raw_detail()
    new_rows = pd.DataFrame(_detail_rows_for(sc_id, data))
    for col in detail_df.columns:
        if col not in new_rows.columns:
            new_rows[col] = ""
    new_rows = new_rows.reindex(columns=detail_df.columns)
    detail_df = pd.concat([detail_df, new_rows], ignore_index=True)
    detail_df.to_csv(SCENARIO_DETAIL_CSV, index=False, encoding="utf-8-sig")

    meta_df = _read_raw_meta()
    new_meta = pd.DataFrame([_meta_row_for(sc_id, data)])
    for col in meta_df.columns:
        if col not in new_meta.columns:
            new_meta[col] = ""
    new_meta = new_meta.reindex(columns=meta_df.columns)
    meta_df = pd.concat([meta_df, new_meta], ignore_index=True)
    meta_df.to_csv(SCENARIO_META_CSV, index=False, encoding="utf-8-sig")

    clear_scenario_cache()
    return _build_scenario_obj(sc_id, load_scenario_details(), load_scenario_meta())


def update_scenario(sc_id: str, data: dict) -> dict | None:
    import pandas as pd
    detail_df = _read_raw_detail()
    if not (detail_df["Scenario_ID"] == sc_id).any():
        return None

    detail_df = detail_df[detail_df["Scenario_ID"] != sc_id].copy()
    new_rows = pd.DataFrame(_detail_rows_for(sc_id, data))
    for col in detail_df.columns:
        if col not in new_rows.columns:
            new_rows[col] = ""
    new_rows = new_rows.reindex(columns=detail_df.columns)
    detail_df = pd.concat([detail_df, new_rows], ignore_index=True)
    detail_df.to_csv(SCENARIO_DETAIL_CSV, index=False, encoding="utf-8-sig")

    meta_df = _read_raw_meta()
    meta_df = meta_df[meta_df["Scenario ID"] != sc_id].copy()
    new_meta = pd.DataFrame([_meta_row_for(sc_id, data)])
    for col in meta_df.columns:
        if col not in new_meta.columns:
            new_meta[col] = ""
    new_meta = new_meta.reindex(columns=meta_df.columns)
    meta_df = pd.concat([meta_df, new_meta], ignore_index=True)
    meta_df.to_csv(SCENARIO_META_CSV, index=False, encoding="utf-8-sig")

    clear_scenario_cache()
    return _build_scenario_obj(sc_id, load_scenario_details(), load_scenario_meta())


def delete_scenario(sc_id: str) -> bool:
    detail_df = _read_raw_detail()
    if not (detail_df["Scenario_ID"] == sc_id).any():
        return False

    detail_df = detail_df[detail_df["Scenario_ID"] != sc_id]
    detail_df.to_csv(SCENARIO_DETAIL_CSV, index=False, encoding="utf-8-sig")

    meta_df = _read_raw_meta()
    meta_df = meta_df[meta_df["Scenario ID"] != sc_id]
    meta_df.to_csv(SCENARIO_META_CSV, index=False, encoding="utf-8-sig")

    clear_scenario_cache()
    return True
