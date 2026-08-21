"""Scenario, reverse-stress, and Monte Carlo endpoints."""
from fastapi import APIRouter, HTTPException

from ...schemas import (
    RunScenarioRequest,
    ReverseStressInput,
    ScenarioMutateInput,
    MonteCarloRequest,
)
from ...services.scenario_service import (
    get_all_scenarios,
    get_scenario_by_id,
    apply_scenario,
    create_scenario,
    update_scenario,
    delete_scenario,
)
from ...services.reverse_service import run_reverse_stress

router = APIRouter(prefix="/api", tags=["scenarios"])


# ── Scenario library ─────────────────────────────────────────────────────────

@router.get("/scenarios")
def list_scenarios():
    return get_all_scenarios()


@router.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    sc = get_scenario_by_id(scenario_id)
    if not sc:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    return sc


@router.post("/scenarios", status_code=201)
def create_scenario_route(body: ScenarioMutateInput):
    return create_scenario(body.model_dump())


@router.put("/scenarios/{scenario_id}")
def update_scenario_route(scenario_id: str, body: ScenarioMutateInput):
    result = update_scenario(scenario_id, body.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    return result


@router.delete("/scenarios/{scenario_id}", status_code=204)
def delete_scenario_route(scenario_id: str):
    if not delete_scenario(scenario_id):
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")


@router.post("/scenarios/{scenario_id}/run")
def run_scenario(scenario_id: str, body: RunScenarioRequest):
    try:
        return apply_scenario(scenario_id, body.severityMultiplier, body.macroOverlays)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Reverse stress ───────────────────────────────────────────────────────────

@router.post("/reverse-stress")
def reverse_stress(body: ReverseStressInput):
    return run_reverse_stress(body.model_dump())


# ── Monte Carlo ──────────────────────────────────────────────────────────────

@router.post("/monte-carlo")
def run_mc(body: MonteCarloRequest):
    from models.monte_carlo import run_monte_carlo
    try:
        return run_monte_carlo(
            body.scenarioId,
            n_simulations=body.nSimulations,
            severity_multiplier=body.severityMultiplier,
            uncertainty_pct=body.uncertaintyPct,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
