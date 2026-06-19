"""
Monte Carlo simulation engine for MTN QuantRisk.

Runs N stochastic simulations by perturbing a scenario's impact values
within uncertainty bounds, then returns percentile distributions per KPI.
"""
import random
import math
from pathlib import Path

UNCERTAINTY_PCT = 0.20  # 20% noise band on each impact value
DEFAULT_N = 1000


def run_monte_carlo(
    scenario_id: str,
    n_simulations: int = DEFAULT_N,
    severity_multiplier: float = 1.0,
    uncertainty_pct: float = UNCERTAINTY_PCT,
    seed: int | None = None,
) -> dict:
    """
    Run N Monte Carlo simulations for a scenario.
    Each run perturbs every impact value with Gaussian noise,
    applies the stressed impacts to the base case, and records results.
    Returns percentile distributions (P5/P25/P50/P75/P95) per KPI.
    """
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from backend.app.services.data_loader import load_base_case, KPI_META, FRONTEND_KPIS
    from backend.app.services.data_loader import load_scenario_details

    rng = random.Random(seed)
    base = load_base_case()
    detail_df = load_scenario_details()

    sc_rows = detail_df[detail_df["Scenario_ID"] == scenario_id]
    if sc_rows.empty:
        raise ValueError(f"Scenario {scenario_id} not found")

    impacts = []
    for _, row in sc_rows.iterrows():
        kid = str(row.get("KPI_ID", "")).strip()
        itype = str(row.get("Impact_Type", "pct")).strip()
        try:
            ival = float(row.get("Impact_Value", 0)) * severity_multiplier
        except (ValueError, TypeError):
            ival = 0.0
        if kid and itype in ("pct", "delta", "abs"):
            impacts.append((kid, itype, ival))

    sim_results: dict[str, list[float]] = {kid: [] for kid in FRONTEND_KPIS}

    for _ in range(n_simulations):
        stressed = dict(base)
        for kid, itype, ival in impacts:
            if kid not in stressed:
                continue
            perturbed = ival * (1 + rng.gauss(0, uncertainty_pct))
            bv = base[kid]
            if itype == "pct":
                stressed[kid] = bv * (1 + perturbed / 100)
            elif itype == "delta":
                stressed[kid] = bv + perturbed
            elif itype == "abs":
                stressed[kid] = abs(perturbed) if ival != 0 else ival

        for kid in FRONTEND_KPIS:
            sim_results[kid].append(stressed.get(kid, base.get(kid, 0.0)))

    def pct(vals: list[float], p: float) -> float:
        vals = sorted(vals)
        n = len(vals)
        idx = (p / 100) * (n - 1)
        lo, hi = int(idx), min(int(idx) + 1, n - 1)
        return vals[lo] + (vals[hi] - vals[lo]) * (idx - lo)

    results = []
    for kid in FRONTEND_KPIS:
        vals = sim_results[kid]
        mean = sum(vals) / len(vals)
        std = math.sqrt(sum((v - mean) ** 2 for v in vals) / len(vals))
        results.append({
            "kpiId":     kid,
            "kpiName":   KPI_META[kid]["name"],
            "unit":      KPI_META[kid]["unit"],
            "baseValue": round(float(base.get(kid, 0.0)), 4),
            "p05":       round(pct(vals, 5), 4),
            "p25":       round(pct(vals, 25), 4),
            "p50":       round(pct(vals, 50), 4),
            "p75":       round(pct(vals, 75), 4),
            "p95":       round(pct(vals, 95), 4),
            "mean":      round(mean, 4),
            "std":       round(std, 4),
            "worstCase": round(min(vals), 4),
            "bestCase":  round(max(vals), 4),
        })

    return {
        "scenarioId":     scenario_id,
        "nSimulations":   n_simulations,
        "uncertaintyPct": uncertainty_pct,
        "results":        results,
    }


if __name__ == "__main__":
    out = run_monte_carlo("S01", n_simulations=200, seed=42)
    print(f"Scenario {out['scenarioId']}  N={out['nSimulations']}")
    for r in out["results"][:3]:
        print(f"  {r['kpiId']}: base={r['baseValue']} p05={r['p05']} p50={r['p50']} p95={r['p95']}")
