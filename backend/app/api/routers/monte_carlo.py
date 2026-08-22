"""Correlated Monte Carlo simulation endpoint."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...services.monte_carlo_service import run_correlated_monte_carlo

router = APIRouter(prefix="/api", tags=["monte-carlo"])


class MonteCarloInput(BaseModel):
    scenarioId: str
    nSimulations: int = Field(default=1000, ge=100, le=10000)
    severityMultiplier: float = Field(default=1.0, ge=0.1, le=5.0)
    uncertaintyPct: float = Field(default=0.20, ge=0.05, le=0.50)


@router.post("/monte-carlo")
def run_monte_carlo(body: MonteCarloInput):
    """Run correlated Monte Carlo simulation.

    Uses Cholesky decomposition on the KPI correlation matrix to generate
    correlated random shocks, producing decision-grade probability
    distributions with VaR and CVaR metrics.
    """
    try:
        return run_correlated_monte_carlo(
            scenario_id=body.scenarioId,
            n_simulations=body.nSimulations,
            severity_multiplier=body.severityMultiplier,
            uncertainty_pct=body.uncertaintyPct,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
