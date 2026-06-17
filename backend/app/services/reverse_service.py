"""
Binary-search reverse stress solver.
Finds the minimum severity multiplier at which a KPI breaches a threshold.
"""
from datetime import datetime, timezone
from .scenario_service import apply_scenario, get_all_scenarios
from .data_loader import PILLAR_MAP


def _kpi_at_severity(sc_id: str, kpi_id: str, severity: float) -> float:
    output = apply_scenario(sc_id, severity, {})
    for row in output["results"]:
        if row["kpiId"] == kpi_id:
            return row["scenarioValue"]
    return 0.0


def _is_breached(value: float, threshold: float, operator: str) -> bool:
    if operator == "lt":
        return value < threshold
    if operator == "gt":
        return value > threshold
    return False


def solve_single(sc_id: str, kpi_id: str, threshold: float, operator: str,
                 max_severity: float = 3.0, iterations: int = 40) -> dict | None:
    """Binary search for breach severity. Returns None if no breach found."""
    # Check if breach even possible at max severity
    val_max = _kpi_at_severity(sc_id, kpi_id, max_severity)
    if not _is_breached(val_max, threshold, operator):
        return None

    trajectory = []
    lo, hi = 0.0, max_severity
    breach_sev = max_severity

    for i in range(iterations):
        mid = (lo + hi) / 2
        val = _kpi_at_severity(sc_id, kpi_id, mid)
        trajectory.append({"iteration": i + 1, "severity": round(mid, 4), "kpiValue": round(val, 4)})
        if _is_breached(val, threshold, operator):
            hi = mid
            breach_sev = mid
        else:
            lo = mid

    breach_val = _kpi_at_severity(sc_id, kpi_id, breach_sev)

    return {
        "scenarioId":                 sc_id,
        "requiredSeverityMultiplier": round(breach_sev, 4),
        "breachKpiValue":             round(breach_val, 4),
        "binarySearchTrajectory":     trajectory,
    }


def solve_cross_scenario(kpi_id: str, threshold: float, operator: str) -> list:
    """Run solve_single across all scenarios. Returns sorted ranking."""
    scenarios = get_all_scenarios()
    ranking = []

    for sc in scenarios:
        sc_id = sc["id"]
        result = solve_single(sc_id, kpi_id, threshold, operator, max_severity=3.0, iterations=20)
        if result:
            ranking.append({
                "scenarioId":                 sc_id,
                "scenarioName":               sc["name"],
                "pillar":                     sc["pillar"],
                "requiredSeverityMultiplier": result["requiredSeverityMultiplier"],
                "breachKpiValue":             result["breachKpiValue"],
            })

    ranking.sort(key=lambda x: x["requiredSeverityMultiplier"])
    return ranking


def run_reverse_stress(payload: dict) -> dict:
    kpi_id    = payload["kpiId"]
    operator  = payload["operator"]
    threshold = payload["threshold"]
    sc_id     = payload.get("scenarioId")

    # Normalise dropsBy / risesAbove to lt / gt with absolute threshold
    if operator == "dropsBy":
        from .data_loader import load_base_case
        base_val  = load_base_case().get(kpi_id, threshold)
        threshold = base_val * (1 - threshold / 100)
        operator  = "lt"
    elif operator == "risesAbove":
        operator  = "gt"

    single_result   = None
    cross_ranking   = None

    if sc_id:
        single_result = solve_single(sc_id, kpi_id, threshold, operator)
    else:
        cross_ranking = solve_cross_scenario(kpi_id, threshold, operator)
        # Also solve the most dangerous scenario individually for the trajectory chart
        if cross_ranking:
            top_sc = cross_ranking[0]["scenarioId"]
            single_result = solve_single(top_sc, kpi_id, threshold, operator)

    return {
        "input":                 payload,
        "singleScenarioResult":  single_result,
        "crossScenarioRanking":  cross_ranking,
        "generatedAt":           datetime.now(timezone.utc).isoformat(),
    }
