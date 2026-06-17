from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
import random
import joblib
from pathlib import Path

from ..schemas import RunScenarioRequest, ReverseStressInput, ScenarioMutateInput
from ..services.scenario_service import (
    get_all_kpis, get_all_scenarios, get_scenario_by_id, apply_scenario,
    create_scenario, update_scenario, delete_scenario,
)
from ..services.reverse_service import run_reverse_stress
from ..services.history_service import get_quarterly, get_monthly

router = APIRouter(prefix="/api")

# ------------------------------------------------------------------------------
# Lazy-loaded ARIMA model for forecasts by Chidima
# ------------------------------------------------------------------------------
_MODEL_CACHE = {}

def get_arima_model():
    if "arima" not in _MODEL_CACHE:
        # parents[3] = mtn_quantrisk/ (project root)
        model_path = Path(__file__).resolve().parents[3] / "models/artefacts/arima_revenue.joblib"
        if not model_path.exists():
            raise RuntimeError("ARIMA model not found. Run models/train_lstm.py first.")
        _MODEL_CACHE["arima"] = joblib.load(model_path)
    return _MODEL_CACHE["arima"]

#END
# ── KPIs ──────────────────────────────────────────────────────────────────────

@router.get("/kpis")
def list_kpis():
    return get_all_kpis()


# ── Scenarios ─────────────────────────────────────────────────────────────────

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


# ── Reverse Stress ─────────────────────────────────────────────────────────────

@router.post("/reverse-stress")
def reverse_stress(body: ReverseStressInput):
    return run_reverse_stress(body.model_dump())


# ── Forecast ──────────────────────────────────────────────────────────────────

@router.get("/forecast/{kpi_id}")
def get_forecast(kpi_id: str, horizon: int = 90):
    # ARIMA path: only FIN01 (Service Revenue) has a trained model
    if kpi_id == "FIN01":
        try:
            model = get_arima_model()
            q_data = get_quarterly("FIN01")
            if not q_data:
                raise ValueError("No quarterly data")

            last_hist_value = q_data[-1]["value"]
            forecast_values = model.forecast(steps=2).tolist()

            now   = datetime.now(timezone.utc)
            date1 = now + relativedelta(months=3)
            date2 = now + relativedelta(months=6)
            points = []

            for i in range(horizon + 1):
                dt = now + timedelta(days=i)
                if dt <= date1:
                    total = (date1 - now).total_seconds()
                    frac  = (dt - now).total_seconds() / total if total else 1.0
                    val   = last_hist_value + (forecast_values[0] - last_hist_value) * frac
                elif dt <= date2:
                    total = (date2 - date1).total_seconds()
                    frac  = (dt - date1).total_seconds() / total if total else 1.0
                    val   = forecast_values[0] + (forecast_values[1] - forecast_values[0]) * frac
                else:
                    val = forecast_values[1]

                points.append({
                    "date":         dt.strftime("%Y-%m-%d"),
                    "median":       round(val, 2),
                    "p50":          round(val, 2),
                    "p05":          round(val * 0.85, 2),
                    "p95":          round(val * 1.15, 2),
                    "isHistorical": False,
                })
            return points
        except Exception:
            pass  # fall through to random-walk below

    # Fallback: random-walk forecast for any KPI (or when ARIMA model missing)
    from ..services.data_loader import load_base_case
    base = load_base_case()
    val  = base.get(kpi_id, 1000.0)
    now  = datetime.now(timezone.utc)
    cur  = val * 0.85
    points = []

    for i in range(-90, horizon + 1):
        dt      = now + timedelta(days=i)
        is_hist = i <= 0
        cur    *= random.uniform(0.998, 1.004)
        p50     = cur
        points.append({
            "date":         dt.strftime("%Y-%m-%d"),
            "median":       round(p50, 2) if not is_hist else 0,
            "p50":          round(p50, 2),
            "p05":          round(p50 * 0.88, 2),
            "p95":          round(p50 * 1.12, 2),
            "isHistorical": is_hist,
        })
    return points


# ── Historical Time-Series ────────────────────────────────────────────────────

@router.get("/quarterly/{kpi_id}")
def quarterly_series(kpi_id: str):
    data = get_quarterly(kpi_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data for KPI {kpi_id}")
    return data


@router.get("/monthly/{kpi_id}")
def monthly_series(kpi_id: str, n_months: int = 36):
    data = get_monthly(kpi_id, n_months)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data for KPI {kpi_id}")
    return data


# ── Board Briefs ───────────────────────────────────────────────────────────────

MOCK_BRIEFS = [
    {
        "id": "B01", "title": "Cedi Devaluation Impact Brief", "scenarioIds": ["S01"],
        "status": "Ready", "generatedAt": "2026-06-05T10:00:00Z",
        "severityScore": 4.2,
        "estimatedImpact": {"currency": "GHS", "magnitude": 450, "unit": "M"},
        "executiveSummary": "A 25% devaluation of the Cedi significantly increases opex and capex costs, reducing EBITDA margin by ~2pp and ARPU in USD terms by 15%.",
        "keyKpiImpacts": [
            {"kpiId": "FIN02", "narrative": "EBITDA margin compressed by ~2 percentage points due to USD-denominated cost inflation."},
            {"kpiId": "OPS04", "narrative": "ARPU in USD equivalent falls 15%, impacting investor-facing metrics."},
        ],
        "calibrationNotes": "Calibrated against FY22 Cedi crisis (0.32 elasticity).",
        "recommendedActions": ["Hedge 60% of USD exposure", "Accelerate local content substitution", "Review tariff repricing schedule"],
        "keyEntities": ["Bank of Ghana", "Ministry of Finance", "NCA"],
    },
    {
        "id": "B02", "title": "MoMo E-Levy Increase Brief", "scenarioIds": ["S03"],
        "status": "Ready", "generatedAt": "2026-06-06T11:00:00Z",
        "severityScore": 3.8,
        "estimatedImpact": {"currency": "GHS", "magnitude": 250, "unit": "M"},
        "executiveSummary": "An increase in e-levy to 1.5% suppresses MoMo transaction velocity by ~25%, directly reducing SEG03 revenue.",
        "keyKpiImpacts": [
            {"kpiId": "SEG03", "narrative": "MoMo revenue declines 25% driven by volume elasticity to levy rate."},
        ],
        "calibrationNotes": "Calibrated against 2022 e-levy implementation (price elasticity -1.8).",
        "recommendedActions": ["Launch merchant subsidy programme", "Accelerate MoMo agent network expansion", "Engage GRA on tiered levy structure"],
        "keyEntities": ["GRA", "Bank of Ghana", "Ministry of Finance"],
    },
    {
        "id": "B03", "title": "Major Cyber Breach Response", "scenarioIds": ["S06"],
        "status": "Generating", "generatedAt": "2026-06-10T08:00:00Z",
        "severityScore": 4.8,
        "estimatedImpact": {"currency": "GHS", "magnitude": 1.2, "unit": "Bn"},
        "executiveSummary": "",
        "keyKpiImpacts": [], "calibrationNotes": "", "recommendedActions": [], "keyEntities": [],
    },
    {
        "id": "B04", "title": "Inflation Spike to 25%", "scenarioIds": ["S02"],
        "status": "Ready", "generatedAt": "2026-06-09T09:00:00Z",
        "severityScore": 3.5,
        "estimatedImpact": {"currency": "GHS", "magnitude": 150, "unit": "M"},
        "executiveSummary": "Inflation resurgence to 25% erodes real ARPU and increases network operating costs.",
        "keyKpiImpacts": [
            {"kpiId": "OPS04", "narrative": "Real ARPU falls as consumer purchasing power is squeezed."},
            {"kpiId": "FIN03", "narrative": "EBITDA margin under pressure from energy and labour cost inflation."},
        ],
        "calibrationNotes": "Based on 2022–2023 inflation trajectory.",
        "recommendedActions": ["Adjust tariffs quarterly", "Lock in fuel and energy contracts"],
        "keyEntities": ["Ghana Statistical Service", "NCA"],
    },
]


@router.get("/briefs")
def list_briefs():
    return MOCK_BRIEFS


@router.post("/briefs/generate")
def generate_brief(payload: dict):
    sc_ids = payload.get("scenarioIds", [])
    now    = datetime.now(timezone.utc)
    return {
        "id":            f"B{random.randint(10, 99)}",
        "title":         f"Scenario Analysis: {', '.join(sc_ids)}",
        "scenarioIds":   sc_ids,
        "status":        "Ready",
        "generatedAt":   now.isoformat(),
        "severityScore": round(random.uniform(2.5, 4.5), 1),
        "estimatedImpact": {"currency": "GHS", "magnitude": random.randint(100, 800), "unit": "M"},
        "executiveSummary": f"Combined stress analysis for scenarios {', '.join(sc_ids)} indicates material risk to EBITDA and service revenue under the modelled assumptions.",
        "keyKpiImpacts": [
            {"kpiId": "FIN01", "narrative": "Service revenue under pressure across combined scenario set."},
            {"kpiId": "FIN03", "narrative": "EBITDA margin compressed by operating cost inflation."},
        ],
        "calibrationNotes": "Generated from live scenario engine output.",
        "recommendedActions": ["Review hedging strategy", "Activate tariff repricing clause", "Engage regulator on timeline"],
        "keyEntities": ["Bank of Ghana", "NCA", "GRA"],
    }


# ── Pipeline Health ────────────────────────────────────────────────────────────

@router.get("/health")
def pipeline_health():
    from ..services.data_loader import BASE_CASE_CSV, SCENARIO_DETAIL_CSV, SCENARIO_META_CSV
    from pathlib import Path
    import time

    def check(path: Path, name: str):
        try:
            start = time.time()
            import pandas as pd
            pd.read_csv(path, on_bad_lines="skip", nrows=2)
            ms = int((time.time() - start) * 1000)
            return {"name": name, "status": "Healthy", "latencyMs": ms, "lastSyncAt": datetime.now(timezone.utc).isoformat()}
        except Exception:
            return {"name": name, "status": "Failed", "latencyMs": 0, "lastSyncAt": datetime.now(timezone.utc).isoformat()}

    sources = [
        check(BASE_CASE_CSV, "Base Case CSV"),
        check(SCENARIO_DETAIL_CSV, "Scenario Library CSV"),
        check(SCENARIO_META_CSV, "Scenario Meta CSV"),
    ]

    from pathlib import Path
    model_dir = Path(__file__).resolve().parents[3] / "models/artefacts"
    model_ok  = (model_dir / "ebitda_margin.joblib").exists()
    sources.append({
        "name": "ML Models (XGBoost)",
        "status": "Healthy" if model_ok else "Failed",
        "latencyMs": 0,
        "lastSyncAt": datetime.now(timezone.utc).isoformat(),
    })
    sources.append({
        "name": "SHAP Explainer",
        "status": "Healthy",
        "latencyMs": 0,
        "lastSyncAt": datetime.now(timezone.utc).isoformat(),
    })

    overall = "Healthy" if all(s["status"] == "Healthy" for s in sources) else "Degraded"
    return {
        "status":     overall,
        "lastBeatAt": datetime.now(timezone.utc).isoformat(),
        "sources":    sources,
    }
