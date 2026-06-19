import type {
  Kpi, Scenario, ScenarioOutput, ReverseStressResult, ReverseStressInput,
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth,
  QuarterlyPoint, MonthlyPoint,
  KpiId, MacroOverlays, ScenarioFormData,
  FeedbackPayload, BaseCaseLogEntry, UploadResult, PdfKpiCandidate,
} from './types';

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
  if (res.status === 204) return undefined as unknown as T;
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

// fetchMonteCarlo kept for backwards compat — prefer runMonteCarlo(scenarioId)
export async function fetchMonteCarlo(_kpiId: KpiId, _iterations: number): Promise<MonteCarloResult | null> {
  return null;
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

// ── Upload ─────────────────────────────────────────────────────────────────────

export async function uploadCsv(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload/csv`, { method: 'POST', body: form });
  if (!res.ok) { const t = await res.text(); throw new Error(`Upload failed: ${t.slice(0, 200)}`); }
  return res.json();
}

export async function uploadPdf(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload/pdf`, { method: 'POST', body: form });
  if (!res.ok) { const t = await res.text(); throw new Error(`Upload failed: ${t.slice(0, 200)}`); }
  return res.json();
}

export async function applyPdfCandidates(filename: string, candidates: PdfKpiCandidate[]): Promise<UploadResult> {
  return apiFetch<UploadResult>('/api/upload/pdf/apply', {
    method: 'POST',
    body: JSON.stringify({ filename, candidates }),
  });
}

// ── Monte Carlo ────────────────────────────────────────────────────────────────

export async function runMonteCarlo(
  scenarioId: string,
  nSimulations = 1000,
  severityMultiplier = 1.0,
  uncertaintyPct = 0.20,
): Promise<MonteCarloResult> {
  return apiFetch<MonteCarloResult>('/api/monte-carlo', {
    method: 'POST',
    body: JSON.stringify({ scenarioId, nSimulations, severityMultiplier, uncertaintyPct }),
  });
}

// ── Retrain ────────────────────────────────────────────────────────────────────

export async function retrainModels(): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return apiFetch('/api/retrain', { method: 'POST', body: '{}' });
}

// ── Feedback ───────────────────────────────────────────────────────────────────

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await apiFetch('/api/feedback', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchFeedback(): Promise<FeedbackPayload[]> {
  return apiFetch('/api/feedback');
}

// ── Logs ───────────────────────────────────────────────────────────────────────

export async function fetchBaseCaseLogs(): Promise<BaseCaseLogEntry[]> {
  return apiFetch('/api/logs/base-case');
}
