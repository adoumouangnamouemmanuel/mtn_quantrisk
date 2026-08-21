# pipeline/scenario_engine.py
#
# Historically this module held a second, divergent copy of the scenario
# engine. Two engines that can produce different results is a high-severity
# audit finding (TD-07 / H3). The backend service is now the single source of
# truth, so this module simply re-exports it for any callers (e.g. the ML
# training scripts) that still import from `pipeline.scenario_engine`.
#
# Do not add scenario logic here — add it to
# `backend/app/services/scenario_service.py` instead.

import sys
from pathlib import Path

# Make the backend package importable when this module is run from the project
# root (e.g. `python -m pipeline.scenario_engine` or from a training script).
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.app.services.data_loader import (  # noqa: F401  (re-export)
    load_base_case,
    load_scenario_details as load_scenario_library,
    SCENARIO_DETAIL_CSV as SCENARIO_LIB_PATH,
    BASE_CASE_CSV as BASE_CASE_PATH,
)
from backend.app.services.scenario_service import (  # noqa: F401  (re-export)
    apply_scenario,
    get_all_scenarios as _get_all_scenarios,
)


def run_all_scenarios(severity: float = 1.0):
    """Return a lightweight summary of every scenario at the given severity.

    Kept for parity with the old module's public API; the reverse-stress
    endpoint and sensitivity views now use ``backend`` services directly.
    """
    import pandas as pd

    rows = []
    for sc in _get_all_scenarios():
        try:
            r = apply_scenario(sc["id"], severity, {})
            stressed = {row["kpiId"]: row["scenarioValue"] for row in r["results"]}
            rows.append(
                {
                    "Scenario_ID": sc["id"],
                    "Scenario_Name": sc["name"],
                    "Type": sc["type"],
                    "Severity": sc["severity"],
                    "FIN01_Stressed": stressed.get("FIN01"),
                    "FIN03_Stressed": stressed.get("FIN03"),
                    "SEG03_Stressed": stressed.get("SEG03"),
                    "OPS04_Stressed": stressed.get("OPS04"),
                }
            )
        except Exception as exc:  # pragma: no cover - defensive
            print(f"  [WARN] Skipping {sc['id']}: {exc}")
    return pd.DataFrame(rows)


if __name__ == "__main__":  # pragma: no cover
    result = apply_scenario("S01", severity_multiplier=1.0)
    fin01 = next((r for r in result["results"] if r["kpiId"] == "FIN01"), None)
    base = fin01["baseValue"] if fin01 else 0
    stressed = fin01["scenarioValue"] if fin01 else 0
    print(f"S01 FIN01: {base:.0f} -> {stressed:.0f}")
    summary = run_all_scenarios()
    print(f"\nAll-scenario summary: {len(summary)} rows")
