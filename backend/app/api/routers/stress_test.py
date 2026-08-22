"""Business stress tester endpoint."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...services.stress_test_service import run_stress_test, SHOCK_PRESETS

router = APIRouter(prefix="/api", tags=["stress-test"])


class StressTestInput(BaseModel):
    plan: dict | None = None  # {revenue: [3], ebitda: [3], capex: [3], subscribers: [3]}
    shocks: dict | None = None  # {revenue: %, fx: %, opex: %, churn: pp}
    preset: str | None = None  # key into SHOCK_PRESETS
    nSimulations: int = Field(default=10000, ge=1000, le=50000)


@router.post("/stress-test")
def post_stress_test(body: StressTestInput):
    """Run a 3-year business plan stress test.

    Accepts a management plan and shock parameters (or a named preset).
    Returns deterministic results, 10k Monte Carlo confidence intervals,
    tornado sensitivity, and management action signals.
    """
    shocks = body.shocks
    if body.preset and body.preset in SHOCK_PRESETS:
        shocks = SHOCK_PRESETS[body.preset]
    if not shocks:
        raise HTTPException(status_code=400, detail="Provide shocks or a valid preset")

    try:
        return run_stress_test(
            plan=body.plan,
            shocks=shocks,
            n_simulations=body.nSimulations,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/stress-test/presets")
def get_presets():
    """Return available stress test presets."""
    return SHOCK_PRESETS
