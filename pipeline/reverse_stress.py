# pipeline/reverse_stress.py

import numpy as np
import pandas as pd
from pathlib import Path
from pipeline.scenario_engine import apply_scenario, load_scenario_library


def find_breach_severity(
    scenario_id   : str,
    target_kpi    : str,
    breach_floor  : float,
    direction     : str = "lower",    # "lower" = breach when value falls below floor
    max_severity  : float = 3.0,
    precision_iters: int = 50
) -> dict:
    """
    Binary search for the minimum severity multiplier at which
    target_kpi breaches breach_floor.

    Returns a result dict. If the scenario cannot breach the floor even at
    max_severity, returns {"result": "no_breach", ...}.
    """

    def kpi_at_sev(sev: float) -> float:
        r = apply_scenario(scenario_id, severity_multiplier=sev)
        return r["stressed"].get(target_kpi, 0.0)

    # Quick check: can this scenario breach the floor at all?
    max_val = kpi_at_sev(max_severity)
    breach_at_max = (max_val < breach_floor) if direction == "lower" \
                    else (max_val > breach_floor)
    if not breach_at_max:
        return {
            "result"     : "no_breach",
            "scenario_id": scenario_id,
            "target_kpi" : target_kpi,
            "note"       : f"Even at {max_severity}× severity, {target_kpi} = "
                           f"{max_val:.2f}, which does not breach floor {breach_floor:.2f}"
        }

    # Binary search
    lo, hi       = 0.0, max_severity
    breach_sev   = None
    for _ in range(precision_iters):
        mid = (lo + hi) / 2
        val = kpi_at_sev(mid)
        breached = (val < breach_floor) if direction == "lower" else (val > breach_floor)
        if breached:
            hi = mid
            breach_sev = mid
        else:
            lo = mid

    stressed_val = kpi_at_sev(breach_sev)

    # Narrative
    lib  = load_scenario_library()
    meta = lib[lib["Scenario_ID"] == scenario_id].iloc[0]
    sev_label = ("mild" if breach_sev < 0.5 else
                 "within base definition" if breach_sev < 1.0 else
                 "moderate amplification (1–1.5×)" if breach_sev < 1.5 else
                 "severe (1.5–2×)" if breach_sev < 2.0 else "extreme (>2×)")

    narrative = (
        f"Under '{meta['Scenario_Name']}' at {breach_sev:.3f}× severity, "
        f"{target_kpi} reaches {stressed_val:.2f} - breaching the "
        f"{breach_floor:.2f} floor. "
        f"This is a {sev_label} amplification. "
        f"Expected recovery: {meta.get('Recovery_Qtrs', '?')} quarters. "
        f"Recommended response: {meta.get('Mitigation_Lever', 'See scenario register.')}"
    )

    return {
        "result"         : "breach_found",
        "scenario_id"    : scenario_id,
        "scenario_name"  : meta["Scenario_Name"],
        "scenario_type"  : meta["Type"],
        "target_kpi"     : target_kpi,
        "breach_floor"   : breach_floor,
        "breach_severity": round(breach_sev, 4),
        "stressed_value" : round(stressed_val, 3),
        "sev_label"      : sev_label,
        "narrative"      : narrative,
    }


def rank_all_scenarios_by_breach(
    target_kpi  : str,
    breach_floor: float,
    direction   : str = "lower"
) -> list:
    """
    Run find_breach_severity across ALL 56 scenarios.
    Returns list sorted by breach_severity ascending -
    the most dangerous scenarios (lowest breach threshold) first.
    """
    lib          = load_scenario_library()
    scenario_ids = lib["Scenario_ID"].unique()
    results      = []

    for sc_id in scenario_ids:
        try:
            r = find_breach_severity(sc_id, target_kpi, breach_floor, direction)
            if r.get("result") == "breach_found":
                results.append(r)
        except Exception as e:
            print(f"  [WARN] {sc_id}: {e}")

    results.sort(key=lambda x: x["breach_severity"])
    return results


if __name__ == "__main__":
    # Smoke test - find scenarios that breach EBITDA margin floor of 50%
    print("Ranking all scenarios by how easily they breach FIN03 = 50%...")
    ranked = rank_all_scenarios_by_breach("FIN03", breach_floor=50.0, direction="lower")
    for r in ranked[:5]:
        print(f"  {r['scenario_id']:4s} | {r['scenario_name'][:40]:40s} | "
              f"breach @ {r['breach_severity']:.3f}× | {r['sev_label']}")