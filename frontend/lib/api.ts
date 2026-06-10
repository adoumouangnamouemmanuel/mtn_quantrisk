import {
  Kpi, Scenario, ScenarioOutput, ReverseStressResult, 
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth,
  KpiId, ReverseOperator, MacroOverlays
} from './types';
import { 
  MOCK_KPIS, MOCK_SCENARIOS, MOCK_FORECAST, MOCK_MONTE_CARLO, 
  MOCK_BRIEFS, MOCK_PIPELINE_HEALTH 
} from './mockData';

const USE_MOCK_API = true;
const DELAY_MS = 400;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchKpis(): Promise<Kpi[]> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_KPIS;
  }
  throw new Error("Not implemented");
}

export async function fetchScenarios(): Promise<Scenario[]> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_SCENARIOS;
  }
  throw new Error("Not implemented");
}

export async function fetchScenarioById(id: string): Promise<Scenario> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    const scenario = MOCK_SCENARIOS.find(s => s.id === id);
    if (!scenario) throw new Error("Scenario not found");
    return scenario;
  }
  throw new Error("Not implemented");
}

export async function runScenario(id: string, severityMultiplier: number, _macroOverlays: MacroOverlays): Promise<ScenarioOutput> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 2);
    // Return a dummy scenario output for now since Batch 1 relies mostly on mock data
    return {
      scenarioId: id,
      severityMultiplier,
      results: [],
      shapAttributions: [],
      generatedAt: new Date().toISOString()
    };
  }
  throw new Error("Not implemented");
}

export async function reverseStress(kpiId: KpiId, threshold: number, operator: ReverseOperator, scenarioId?: string): Promise<ReverseStressResult> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 2);
    return {
      kpiId, threshold, operator, scenarioId,
      distanceToBreach: 10,
      breachProbability: 0.05,
      requiredSeverityMultiplier: 1.5,
      criticalFeatures: [],
      generatedAt: new Date().toISOString()
    };
  }
  throw new Error("Not implemented");
}

export async function fetchForecast(_kpiId: KpiId, _horizon: 7 | 30 | 90): Promise<ForecastPoint[]> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_FORECAST;
  }
  throw new Error("Not implemented");
}

export async function fetchMonteCarlo(_kpiId: KpiId, _iterations: number): Promise<MonteCarloResult> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_MONTE_CARLO[0];
  }
  throw new Error("Not implemented");
}

export async function generateBoardBrief(scenarioIds: string[]): Promise<BoardBrief> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 3);
    const brief: BoardBrief = {
      id: `B${Math.floor(Math.random() * 1000)}`,
      title: "Newly Generated Brief",
      scenarioIds,
      status: 'Ready',
      generatedAt: new Date().toISOString(),
      severityScore: 4.5,
      estimatedImpact: { currency: 'GHS', magnitude: 120, unit: 'M' },
      executiveSummary: "Generated summary",
      keyKpiImpacts: [],
      calibrationNotes: "Generated notes",
      recommendedActions: ["Action 1"],
      keyEntities: ["BoG"]
    };
    return brief;
  }
  throw new Error("Not implemented");
}

export async function fetchBriefs(): Promise<BoardBrief[]> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_BRIEFS;
  }
  throw new Error("Not implemented");
}

export async function fetchPipelineHealth(): Promise<PipelineHealth> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS);
    return MOCK_PIPELINE_HEALTH;
  }
  throw new Error("Not implemented");
}
