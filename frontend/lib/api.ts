import type {
  Kpi, Scenario, ScenarioOutput, ReverseStressResult, ReverseStressInput,
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth,
  QuarterlyPoint, MonthlyPoint,
  KpiId, MacroOverlays, ScenarioFormData,
} from './types';
import {
  MOCK_MONTE_CARLO,
} from './mockData';

const USE_MOCK_API = false;
const API_BASE = 'http://127.0.0.1:8001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchKpis(): Promise<Kpi[]> {
  if (USE_MOCK_API) {
    const { MOCK_KPIS } = await import('./mockData');
    return MOCK_KPIS;
  }
  return apiFetch<Kpi[]>('/api/kpis');
}

export async function fetchScenarios(): Promise<Scenario[]> {
  if (USE_MOCK_API) {
    const { MOCK_SCENARIOS } = await import('./mockData');
    return MOCK_SCENARIOS;
  }
  return apiFetch<Scenario[]>('/api/scenarios');
}

export async function fetchScenarioById(id: string): Promise<Scenario> {
  if (USE_MOCK_API) {
    const { MOCK_SCENARIOS } = await import('./mockData');
    const scenario = MOCK_SCENARIOS.find(s => s.id === id);
    if (!scenario) throw new Error('Scenario not found');
    return scenario;
  }
  return apiFetch<Scenario>(`/api/scenarios/${id}`);
}

export async function runScenario(id: string, severityMultiplier: number, macroOverlays: MacroOverlays): Promise<ScenarioOutput> {
  if (USE_MOCK_API) {
    const { mockRunScenario } = await import('./mockGenerators');
    return mockRunScenario(id, severityMultiplier, macroOverlays);
  }
  return apiFetch<ScenarioOutput>(`/api/scenarios/${id}/run`, {
    method: 'POST',
    body: JSON.stringify({ severityMultiplier, macroOverlays }),
  });
}

export async function reverseStress(input: ReverseStressInput): Promise<ReverseStressResult> {
  if (USE_MOCK_API) {
    const { mockReverseStress } = await import('./mockGenerators');
    return mockReverseStress(input);
  }
  return apiFetch<ReverseStressResult>('/api/reverse-stress', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchForecast(kpiId: KpiId, horizon: 7 | 30 | 90): Promise<ForecastPoint[]> {
  if (USE_MOCK_API) {
    const { MOCK_FORECAST } = await import('./mockData');
    return MOCK_FORECAST;
  }
  return apiFetch<ForecastPoint[]>(`/api/forecast/${kpiId}?horizon=${horizon}`);
}

export async function fetchMonteCarlo(_kpiId: KpiId, _iterations: number): Promise<MonteCarloResult> {
  // No Monte Carlo ML model yet — always use mock
  return MOCK_MONTE_CARLO[0]!;
}

export async function generateBoardBrief(scenarioIds: string[]): Promise<BoardBrief> {
  if (USE_MOCK_API) {
    const { mockGenerateBoardBrief } = await import('./mockGenerators');
    return mockGenerateBoardBrief(scenarioIds);
  }
  return apiFetch<BoardBrief>('/api/briefs/generate', {
    method: 'POST',
    body: JSON.stringify({ scenarioIds }),
  });
}

export async function fetchBriefs(): Promise<BoardBrief[]> {
  if (USE_MOCK_API) {
    const { MOCK_BRIEFS } = await import('./mockData');
    return MOCK_BRIEFS;
  }
  return apiFetch<BoardBrief[]>('/api/briefs');
}

export async function fetchQuarterly(kpiId: KpiId): Promise<QuarterlyPoint[]> {
  return apiFetch<QuarterlyPoint[]>(`/api/quarterly/${kpiId}`);
}

export async function fetchMonthly(kpiId: KpiId, nMonths: number = 36): Promise<MonthlyPoint[]> {
  return apiFetch<MonthlyPoint[]>(`/api/monthly/${kpiId}?n_months=${nMonths}`);
}

export async function createScenario(data: ScenarioFormData): Promise<Scenario> {
  return apiFetch<Scenario>('/api/scenarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateScenario(id: string, data: ScenarioFormData): Promise<Scenario> {
  return apiFetch<Scenario>(`/api/scenarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteScenario(id: string): Promise<void> {
  await apiFetch<void>(`/api/scenarios/${id}`, { method: 'DELETE' });
}

export async function fetchPipelineHealth(): Promise<PipelineHealth> {
  if (USE_MOCK_API) {
    const { MOCK_PIPELINE_HEALTH } = await import('./mockData');
    return MOCK_PIPELINE_HEALTH;
  }
  return apiFetch<PipelineHealth>('/api/health');
}
