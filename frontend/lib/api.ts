import {
  Kpi, Scenario, ScenarioOutput, ReverseStressResult, ReverseStressInput,
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth,
  KpiId, ReverseOperator, MacroOverlays
} from './types';
import { 
  MOCK_KPIS, MOCK_SCENARIOS, MOCK_FORECAST, MOCK_MONTE_CARLO, 
  MOCK_BRIEFS, MOCK_PIPELINE_HEALTH 
} from './mockData';
import { mockRunScenario, mockReverseStress, mockGenerateBoardBrief } from './mockGenerators';

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

export async function runScenario(id: string, severityMultiplier: number, macroOverlays: MacroOverlays): Promise<ScenarioOutput> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 2);
    return mockRunScenario(id, severityMultiplier, macroOverlays);
  }
  throw new Error("Not implemented");
}

export async function reverseStress(input: ReverseStressInput): Promise<ReverseStressResult> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 2);
    return mockReverseStress(input);
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
    return MOCK_MONTE_CARLO[0]!;
  }
  throw new Error("Not implemented");
}

export async function generateBoardBrief(scenarioIds: string[]): Promise<BoardBrief> {
  if (USE_MOCK_API) {
    await delay(DELAY_MS * 3);
    return mockGenerateBoardBrief(scenarioIds);
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
