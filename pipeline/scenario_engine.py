# pipeline/scenario_engine.py

import pandas as pd  # type: ignore[import]
import numpy as np
from pathlib import Path
from functools import lru_cache

BASE_CASE_PATH    = Path("data/structured/base_case.csv")
SCENARIO_LIB_PATH = Path("data/structured/scenario_library.csv")
THRESHOLDS_PATH   = Path("data/structured/kri_register.csv")


@lru_cache(maxsize=1)
def load_base_case() -> dict:
    """Returns {KPI_ID: float_value}. Cached - reload by clearing cache."""
    df = pd.read_csv(BASE_CASE_PATH)
    return dict(zip(df["KPI_ID"], df["FY25_Base_Value"].astype(float)))


@lru_cache(maxsize=1)
def load_scenario_library() -> pd.DataFrame:
    return pd.read_csv(SCENARIO_LIB_PATH)


def apply_scenario(
    scenario_id: str,
    severity_multiplier: float = 1.0,
    macro_overlays: dict = None
) -> dict:
    """
    Apply a scenario to the FY25 base case.

    Parameters
    ----------
    scenario_id        : e.g. "S24"
    severity_multiplier: 0.0 (no impact) to 2.0+ (extreme). Default 1.0.
    macro_overlays     : optional {KPI_ID: override_value} for dashboard sliders.
                         Applied AFTER scenario impacts.

    Returns
    -------
    {
        "scenario_id"         : str,
        "severity_multiplier" : float,
        "base_case"           : {KPI_ID: float},
        "stressed"            : {KPI_ID: float},
        "stressed_macro"      : {KPI_ID: float},   # NEW: macro variables (EXTxx)
        "deltas"              : {KPI_ID: float},        # stressed - base
        "delta_pcts"          : {KPI_ID: float},        # (stressed - base) / base × 100
        "breached_thresholds" : list[dict],
        "scenario_meta"       : dict                    # name, type, sev, plaus, recov, lever
    }
    """
    base      = load_base_case()
    scenarios = load_scenario_library()
    sc_rows   = scenarios[scenarios["Scenario_ID"] == scenario_id]

    if sc_rows.empty:
        raise ValueError(f"Scenario '{scenario_id}' not found in scenario_library.csv")

    # Meta from first row (merged-cell fields)
    first     = sc_rows.iloc[0]
    meta      = {
        "name"    : first.get("Scenario_Name", ""),
        "type"    : first.get("Type", ""),
        "severity": int(first.get("Severity_1_5", 0)),
        "plaus"   : int(first.get("Plausibility_1_5", 0)),
        "recov"   : int(first.get("Recovery_Qtrs", 0)),
        "lever"   : first.get("Mitigation_Lever", "")
    }

    stressed = base.copy()

    # --- NEW: Extract base macro variables (all KPIs starting with "EXT") ---
    base_macro = {k: v for k, v in base.items() if k.startswith("EXT")}
    stressed_macro = base_macro.copy()

    # --- Apply scenario impacts ---
    for _, row in sc_rows.iterrows():
        kpi_id     = str(row.get("KPI_ID", "")).strip()
        impact_type = str(row.get("Impact_Type", "pct")).strip()
        impact_val = float(row.get("Impact_Value", 0))

        if kpi_id not in stressed:
            continue

        base_val   = base[kpi_id]
        scaled_val = impact_val * severity_multiplier

        if impact_type == "pct":
            stressed[kpi_id] = base_val * (1 + scaled_val / 100)
        elif impact_type == "delta":
            stressed[kpi_id] = base_val + scaled_val
        elif impact_type == "abs":
            stressed[kpi_id] = scaled_val
        else:
            raise ValueError(f"Unknown impact_type '{impact_type}' for {scenario_id}/{kpi_id}")

        # --- NEW: also update stressed_macro if this KPI is a macro variable ---
        if kpi_id in stressed_macro:
            if impact_type == "pct":
                stressed_macro[kpi_id] = base_macro[kpi_id] * (1 + scaled_val / 100)
            elif impact_type == "delta":
                stressed_macro[kpi_id] = base_macro[kpi_id] + scaled_val
            elif impact_type == "abs":
                stressed_macro[kpi_id] = scaled_val

    # --- Apply macro overlays on top (affects both stressed and stressed_macro) ---
    if macro_overlays:
        for kpi_id, value in macro_overlays.items():
            if kpi_id in stressed:
                stressed[kpi_id] = float(value)
            # Also update macro dict if the overlay targets a macro variable
            if kpi_id in stressed_macro:
                stressed_macro[kpi_id] = float(value)

    # --- Compute deltas ---
    deltas     = {k: stressed[k] - base[k] for k in base}
    delta_pcts = {}
    for k in base:
        delta_pcts[k] = (deltas[k] / base[k] * 100) if base[k] != 0 else 0.0

    breached = _check_thresholds(stressed)

    return {
        "scenario_id"         : scenario_id,
        "severity_multiplier" : severity_multiplier,
        "base_case"           : base,
        "stressed"            : stressed,
        "stressed_macro"      : stressed_macro,          # NEW
        "deltas"              : deltas,
        "delta_pcts"          : delta_pcts,
        "breached_thresholds" : breached,
        "scenario_meta"       : meta,
    }


def _check_thresholds(kpi_values: dict) -> list:
    """Compare stressed values against RED thresholds from KRI Register."""
    if not THRESHOLDS_PATH.exists():
        return []
    thresholds = pd.read_csv(THRESHOLDS_PATH)
    breaches   = []
    for _, row in thresholds.iterrows():
        kpi_id = str(row.get("KPI_ID", "")).strip()
        if kpi_id not in kpi_values:
            continue
        red_floor    = row.get("Red_Threshold")
        direction    = str(row.get("Direction", "higher")).lower()
        stressed_val = kpi_values[kpi_id]
        if pd.isna(red_floor):
            continue
        breached = (stressed_val < float(red_floor)) if direction == "higher" \
                   else (stressed_val > float(red_floor))
        if breached:
            breaches.append({
                "kpi_id"       : kpi_id,
                "kpi_name"     : row.get("KRI_Name", kpi_id),
                "stressed_val" : round(stressed_val, 3),
                "red_floor"    : float(red_floor),
                "direction"    : direction,
            })
    return breaches


def run_all_scenarios(severity: float = 1.0) -> pd.DataFrame:
    """
    Run all 56 scenarios and return a summary DataFrame.
    Used by the reverse stress endpoint and the sensitivity heatmap.
    """
    lib        = load_scenario_library()
    scenario_ids = lib["Scenario_ID"].unique()
    rows       = []
    for sc_id in scenario_ids:
        try:
            r = apply_scenario(sc_id, severity)
            rows.append({
                "Scenario_ID"   : sc_id,
                "Scenario_Name" : r["scenario_meta"]["name"],
                "Type"          : r["scenario_meta"]["type"],
                "Severity"      : r["scenario_meta"]["severity"],
                "FIN01_Stressed": r["stressed"].get("FIN01"),
                "FIN03_Stressed": r["stressed"].get("FIN03"),
                "SEG03_Stressed": r["stressed"].get("SEG03"),
                "OPS04_Stressed": r["stressed"].get("OPS04"),
                "FIN01_Delta_Pct": r["delta_pcts"].get("FIN01"),
                "FIN03_Delta_Pp" : r["deltas"].get("FIN03"),
                "N_Breaches"    : len(r["breached_thresholds"]),
            })
        except Exception as e:
            print(f"  [WARN] Skipping {sc_id}: {e}")
    return pd.DataFrame(rows)


if __name__ == "__main__":
    # Smoke test
    result = apply_scenario("S01", severity_multiplier=1.0)
    print(f"S01 FIN01: {result['base_case']['FIN01']:.0f} → {result['stressed']['FIN01']:.0f}")
    print(f"S01 Macro variables (stressed): {result['stressed_macro']}")
    summary = run_all_scenarios()
    print(f"\nAll-scenario summary: {len(summary)} rows")
    print(summary[["Scenario_ID","FIN01_Delta_Pct","FIN03_Delta_Pp","N_Breaches"]].head(10))
    

# # pipeline/scenario_engine.py

# import pandas as pd  # type: ignore[import]
# import numpy as np
# from pathlib import Path
# from functools import lru_cache

# BASE_CASE_PATH    = Path("data/structured/base_case.csv")
# SCENARIO_LIB_PATH = Path("data/structured/scenario_library.csv")
# THRESHOLDS_PATH   = Path("data/structured/kri_register.csv")


# @lru_cache(maxsize=1)
# def load_base_case() -> dict:
#     """Returns {KPI_ID: float_value}. Cached - reload by clearing cache."""
#     df = pd.read_csv(BASE_CASE_PATH)
#     return dict(zip(df["KPI_ID"], df["FY25_Base_Value"].astype(float)))


# @lru_cache(maxsize=1)
# def load_scenario_library() -> pd.DataFrame:
#     return pd.read_csv(SCENARIO_LIB_PATH)


# def apply_scenario(
#     scenario_id: str,
#     severity_multiplier: float = 1.0,
#     macro_overlays: dict = None
# ) -> dict:
#     """
#     Apply a scenario to the FY25 base case.

#     Parameters
#     ----------
#     scenario_id        : e.g. "S24"
#     severity_multiplier: 0.0 (no impact) to 2.0+ (extreme). Default 1.0.
#     macro_overlays     : optional {KPI_ID: override_value} for dashboard sliders.
#                          Applied AFTER scenario impacts.

#     Returns
#     -------
#     {
#         "scenario_id"         : str,
#         "severity_multiplier" : float,
#         "base_case"           : {KPI_ID: float},
#         "stressed"            : {KPI_ID: float},
#         "deltas"              : {KPI_ID: float},        # stressed - base
#         "delta_pcts"          : {KPI_ID: float},        # (stressed - base) / base × 100
#         "breached_thresholds" : list[dict],
#         "scenario_meta"       : dict                    # name, type, sev, plaus, recov, lever
#     }
#     """
#     base      = load_base_case()
#     scenarios = load_scenario_library()
#     sc_rows   = scenarios[scenarios["Scenario_ID"] == scenario_id]

#     if sc_rows.empty:
#         raise ValueError(f"Scenario '{scenario_id}' not found in scenario_library.csv")

#     # Meta from first row (merged-cell fields)
#     first     = sc_rows.iloc[0]
#     meta      = {
#         "name"    : first.get("Scenario_Name", ""),
#         "type"    : first.get("Type", ""),
#         "severity": int(first.get("Severity_1_5", 0)),
#         "plaus"   : int(first.get("Plausibility_1_5", 0)),
#         "recov"   : int(first.get("Recovery_Qtrs", 0)),
#         "lever"   : first.get("Mitigation_Lever", "")
#     }

#     stressed = base.copy()

#     # --- Apply scenario impacts ---
#     for _, row in sc_rows.iterrows():
#         kpi_id     = str(row.get("KPI_ID", "")).strip()
#         impact_type = str(row.get("Impact_Type", "pct")).strip()
#         impact_val = float(row.get("Impact_Value", 0))

#         if kpi_id not in stressed:
#             continue

#         base_val   = base[kpi_id]
#         scaled_val = impact_val * severity_multiplier

#         if impact_type == "pct":
#             stressed[kpi_id] = base_val * (1 + scaled_val / 100)
#         elif impact_type == "delta":
#             stressed[kpi_id] = base_val + scaled_val
#         elif impact_type == "abs":
#             stressed[kpi_id] = scaled_val
#         else:
#             raise ValueError(f"Unknown impact_type '{impact_type}' for {scenario_id}/{kpi_id}")

#     # --- Apply macro overlays on top ---
#     if macro_overlays:
#         for kpi_id, value in macro_overlays.items():
#             if kpi_id in stressed:
#                 stressed[kpi_id] = float(value)

#     # --- Compute deltas ---
#     deltas     = {k: stressed[k] - base[k] for k in base}
#     delta_pcts = {}
#     for k in base:
#         delta_pcts[k] = (deltas[k] / base[k] * 100) if base[k] != 0 else 0.0

#     breached = _check_thresholds(stressed)

#     return {
#         "scenario_id"         : scenario_id,
#         "severity_multiplier" : severity_multiplier,
#         "base_case"           : base,
#         "stressed"            : stressed,
#         "deltas"              : deltas,
#         "delta_pcts"          : delta_pcts,
#         "breached_thresholds" : breached,
#         "scenario_meta"       : meta,
#     }


# def _check_thresholds(kpi_values: dict) -> list:
#     """Compare stressed values against RED thresholds from KRI Register."""
#     if not THRESHOLDS_PATH.exists():
#         return []
#     thresholds = pd.read_csv(THRESHOLDS_PATH)
#     breaches   = []
#     for _, row in thresholds.iterrows():
#         kpi_id = str(row.get("KPI_ID", "")).strip()
#         if kpi_id not in kpi_values:
#             continue
#         red_floor    = row.get("Red_Threshold")
#         direction    = str(row.get("Direction", "higher")).lower()
#         stressed_val = kpi_values[kpi_id]
#         if pd.isna(red_floor):
#             continue
#         breached = (stressed_val < float(red_floor)) if direction == "higher" \
#                    else (stressed_val > float(red_floor))
#         if breached:
#             breaches.append({
#                 "kpi_id"       : kpi_id,
#                 "kpi_name"     : row.get("KRI_Name", kpi_id),
#                 "stressed_val" : round(stressed_val, 3),
#                 "red_floor"    : float(red_floor),
#                 "direction"    : direction,
#             })
#     return breaches


# def run_all_scenarios(severity: float = 1.0) -> pd.DataFrame:
#     """
#     Run all 56 scenarios and return a summary DataFrame.
#     Used by the reverse stress endpoint and the sensitivity heatmap.
#     """
#     lib        = load_scenario_library()
#     scenario_ids = lib["Scenario_ID"].unique()
#     rows       = []
#     for sc_id in scenario_ids:
#         try:
#             r = apply_scenario(sc_id, severity)
#             rows.append({
#                 "Scenario_ID"   : sc_id,
#                 "Scenario_Name" : r["scenario_meta"]["name"],
#                 "Type"          : r["scenario_meta"]["type"],
#                 "Severity"      : r["scenario_meta"]["severity"],
#                 "FIN01_Stressed": r["stressed"].get("FIN01"),
#                 "FIN03_Stressed": r["stressed"].get("FIN03"),
#                 "SEG03_Stressed": r["stressed"].get("SEG03"),
#                 "OPS04_Stressed": r["stressed"].get("OPS04"),
#                 "FIN01_Delta_Pct": r["delta_pcts"].get("FIN01"),
#                 "FIN03_Delta_Pp" : r["deltas"].get("FIN03"),
#                 "N_Breaches"    : len(r["breached_thresholds"]),
#             })
#         except Exception as e:
#             print(f"  [WARN] Skipping {sc_id}: {e}")
#     return pd.DataFrame(rows)


# if __name__ == "__main__":
#     # Smoke test
#     result = apply_scenario("S01", severity_multiplier=1.0)
#     print(f"S01 FIN01: {result['base_case']['FIN01']:.0f} → {result['stressed']['FIN01']:.0f}")
#     summary = run_all_scenarios()
#     print(f"\nAll-scenario summary: {len(summary)} rows")
#     print(summary[["Scenario_ID","FIN01_Delta_Pct","FIN03_Delta_Pp","N_Breaches"]].head(10))