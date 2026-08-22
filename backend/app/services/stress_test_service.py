"""
Business Stress Tester — 3-year plan stress testing.

Accepts a management business plan (revenue, EBITDA, CAPEX, subscribers)
and applies configurable macro + operational shocks to produce:
  - Stressed EBITDA trajectory across FY2026–FY2028
  - Revenue at risk, margin impact, resilience score
  - Tornado sensitivity (which shock drives the most variance)
  - 10,000 Monte Carlo paths for confidence intervals

This is the backend equivalent of the frontend prototype — it produces
decision-grade numbers instead of illustrative frontend calculations.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

import numpy as np

logger = logging.getLogger(__name__)

# Default 3-year management plan (GHS millions)
DEFAULT_PLAN = {
    "revenue":  [18240, 20790, 23540],
    "ebitda":   [10030, 11640, 13380],
    "capex":    [3560,  3920,  4260],
    "subscribers": [30.8, 32.4, 34.1],
}

SHOCK_PRESETS = {
    "cedi_pressure": {"revenue": -4, "fx": 22, "opex": 9, "churn": 2},
    "price_war":     {"revenue": -12, "fx": 5, "opex": 4, "churn": 11},
    "network_outage": {"revenue": -8, "fx": 3, "opex": 14, "churn": 7},
    "custom":        {"revenue": -6, "fx": 10, "opex": 7, "churn": 4},
}


def _stress_factor(shocks: dict) -> float:
    """Compute the deterministic stress multiplier from shock parameters."""
    rev = shocks.get("revenue", 0)
    fx = shocks.get("fx", 0)
    opex = shocks.get("opex", 0)
    churn = shocks.get("churn", 0)
    return 1 + (rev / 100) - (opex * 0.006) - (fx * 0.003) - (churn * 0.004)


def _stressed_ebitda(
    base_ebitda: list[float],
    factor: float,
) -> list[float]:
    """Apply stress factor with a gentle time-decay (Year 3 slightly worse)."""
    return [
        max(0, ebitda * factor * (1 - i * 0.012))
        for i, ebitda in enumerate(base_ebitda)
    ]


def run_stress_test(
    plan: dict | None = None,
    shocks: dict | None = None,
    n_simulations: int = 10000,
) -> dict:
    """
    Run a full business stress test.

    Args:
        plan: 3-year business plan {revenue, ebitda, capex, subscribers} (each list of 3)
        shocks: {revenue: %, fx: %, opex: %, churn: pp}
        n_simulations: number of Monte Carlo paths

    Returns:
        Deterministic results + Monte Carlo confidence intervals + tornado
    """
    p = plan or DEFAULT_PLAN
    s = shocks or SHOCK_PRESETS["cedi_pressure"]

    base_ebitda = p.get("ebitda", DEFAULT_PLAN["ebitda"])
    base_revenue = p.get("revenue", DEFAULT_PLAN["revenue"])
    base_capex = p.get("capex", DEFAULT_PLAN["capex"])
    base_subs = p.get("subscribers", DEFAULT_PLAN["subscribers"])

    # ── Deterministic result ──────────────────────────────────────────────
    factor = _stress_factor(s)
    stressed = _stressed_ebitda(base_ebitda, factor)
    base_total = sum(base_ebitda)
    stressed_total = sum(stressed)
    impact = base_total - stressed_total

    revenue_at_risk = sum(base_revenue) * abs(min(0, s.get("revenue", 0))) / 100
    margin = stressed[2] / max(
        base_revenue[2] * (1 + s.get("revenue", 0) / 100), 1
    ) * 100

    resilience = max(
        18,
        min(
            96,
            91
            - abs(s.get("revenue", 0)) * 1.5
            - s.get("fx", 0) * 0.35
            - s.get("opex", 0) * 0.8
            - s.get("churn", 0),
        ),
    )

    # ── Monte Carlo paths ─────────────────────────────────────────────────
    rng = np.random.default_rng(seed=42)
    all_paths = np.zeros((n_simulations, 3))

    for sim in range(n_simulations):
        # Add correlated noise to each shock parameter
        rev_noise = rng.normal(0, abs(s.get("revenue", 1)) * 0.3)
        fx_noise = rng.normal(0, s.get("fx", 1) * 0.25)
        opex_noise = rng.normal(0, s.get("opex", 1) * 0.2)
        churn_noise = rng.normal(0, s.get("churn", 1) * 0.15)

        sim_shocks = {
            "revenue": s.get("revenue", 0) + rev_noise,
            "fx": max(0, s.get("fx", 0) + fx_noise),
            "opex": max(0, s.get("opex", 0) + opex_noise),
            "churn": max(0, s.get("churn", 0) + churn_noise),
        }
        sim_factor = _stress_factor(sim_shocks)
        sim_stressed = _stressed_ebitda(base_ebitda, sim_factor)
        all_paths[sim] = sim_stressed

    # Percentiles per year
    p05 = np.percentile(all_paths, 5, axis=0).tolist()
    p25 = np.percentile(all_paths, 25, axis=0).tolist()
    p50 = np.percentile(all_paths, 50, axis=0).tolist()
    p75 = np.percentile(all_paths, 75, axis=0).tolist()
    p95 = np.percentile(all_paths, 95, axis=0).tolist()

    # ── Tornado sensitivity ───────────────────────────────────────────────
    tornado = _compute_tornado(base_ebitda, s, n_simulations=2000)

    # ── Management signals ────────────────────────────────────────────────
    signals = []
    if resilience <= 60:
        signals.append({
            "title": "Liquidity buffer",
            "status": "Escalate",
            "detail": "Protect funding headroom under FX pressure.",
        })
    else:
        signals.append({
            "title": "Liquidity buffer",
            "status": "Monitor",
            "detail": "Protect funding headroom under FX pressure.",
        })

    if s.get("opex", 0) > 10:
        signals.append({
            "title": "Cost response",
            "status": "Priority",
            "detail": "Phase discretionary spend and vendor exposure.",
        })
    else:
        signals.append({
            "title": "Cost response",
            "status": "Prepared",
            "detail": "Phase discretionary spend and vendor exposure.",
        })

    if s.get("churn", 0) > 6:
        signals.append({
            "title": "Customer defence",
            "status": "Priority",
            "detail": "Target retention offers in vulnerable segments.",
        })
    else:
        signals.append({
            "title": "Customer defence",
            "status": "Monitor",
            "detail": "Target retention offers in vulnerable segments.",
        })

    years = ["FY2026", "FY2027", "FY2028"]

    return {
        "plan": {
            "revenue": base_revenue,
            "ebitda": base_ebitda,
            "capex": base_capex,
            "subscribers": base_subs,
            "years": years,
        },
        "shocks": s,
        "deterministic": {
            "ebitda": [round(v, 1) for v in stressed],
            "impact": round(impact, 1),
            "revenueAtRisk": round(revenue_at_risk, 1),
            "margin": round(margin, 1),
            "resilience": round(resilience, 0),
            "baseTotal": round(base_total, 1),
            "stressedTotal": round(stressed_total, 1),
        },
        "monteCarlo": {
            "nSimulations": n_simulations,
            "years": years,
            "p05": [round(v, 1) for v in p05],
            "p25": [round(v, 1) for v in p25],
            "p50": [round(v, 1) for v in p50],
            "p75": [round(v, 1) for v in p75],
            "p95": [round(v, 1) for v in p95],
            "mean": [round(float(np.mean(all_paths[:, i])), 1) for i in range(3)],
            "std": [round(float(np.std(all_paths[:, i])), 1) for i in range(3)],
        },
        "tornado": tornado,
        "signals": signals,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def _compute_tornado(
    base_ebitda: list[float],
    shocks: dict,
    n_simulations: int = 2000,
) -> list[dict]:
    """Which shock parameter drives the most EBITDA variance?"""
    rng = np.random.default_rng(seed=99)
    sensitivities = {}

    for param in ["revenue", "fx", "opex", "churn"]:
        base_val = shocks.get(param, 0)
        # Vary this parameter ±50% while holding others fixed
        low_shocks = dict(shocks)
        high_shocks = dict(shocks)
        low_shocks[param] = base_val * 0.5
        high_shocks[param] = base_val * 1.5

        low_factor = _stress_factor(low_shocks)
        high_factor = _stress_factor(high_shocks)

        low_ebitda = _stressed_ebitda(base_ebitda, low_factor)
        high_ebitda = _stressed_ebitda(base_ebitda, high_factor)

        low_total = sum(low_ebitda)
        high_total = sum(high_ebitda)

        sensitivities[param] = {
            "param": param,
            "lowTotal": round(low_total, 1),
            "highTotal": round(high_total, 1),
            "spread": round(abs(high_total - low_total), 1),
            "label": {
                "revenue": "Revenue shock",
                "fx": "FX depreciation",
                "opex": "Operating cost",
                "churn": "Subscriber churn",
            }.get(param, param),
        }

    # Sort by spread (most sensitive first)
    return sorted(sensitivities.values(), key=lambda x: x["spread"], reverse=True)
