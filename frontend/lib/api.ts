import type {
  Kpi, Scenario, ScenarioOutput, ReverseStressResult, ReverseStressInput,
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth,
  QuarterlyPoint, MonthlyPoint,
  KpiId, MacroOverlays, ScenarioFormData,
  FeedbackPayload, BaseCaseLogEntry, UploadResult, PdfKpiCandidate,
} from './types';

const USE_MOCK_API = false;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

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
export async function fetchMonteCarlo(): Promise<MonteCarloResult | null> {
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

// ── News Feed ──────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  url: string;
  title: string;
  body?: string;
  sourceName: string | null;
  publishedAt: string | null;
  scrapedAt: string | null;
  category: string | null;
  severity: number | null;
  confidence: number | null;
  mtnRelevance: number | null;
  alertTier: string | null;
  sentiment: string | null;
  impactGhsMin: number | null;
  impactGhsMid: number | null;
  impactGhsMax: number | null;
  entities: { orgs: string[]; money: string[]; locations: string[]; persons: string[] } | null;
  keywordHits?: Record<string, number>;
}

export interface NewsSummary {
  articlesToday: number;
  totalArticles: number;
  topRiskCategory: string | null;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

export async function fetchNews(params: {
  category?: string;
  source?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<NewsArticle[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.source)   qs.set('source',   params.source);
  if (params.limit)    qs.set('limit',    String(params.limit));
  if (params.offset)   qs.set('offset',   String(params.offset));
  return apiFetch<NewsArticle[]>(`/api/news?${qs}`);
}

export async function fetchNewsArticle(id: string): Promise<NewsArticle> {
  return apiFetch<NewsArticle>(`/api/news/${id}`);
}

export async function fetchNewsSummary(): Promise<NewsSummary> {
  return apiFetch<NewsSummary>('/api/news/summary');
}

export async function triggerScrape(): Promise<{ newArticles: number; status: string }> {
  return apiFetch('/api/news/scrape', { method: 'POST' });
}

// ── Alerts ─────────────────────────────────────────────────────────────────────

export interface NewsAlert {
  id: string;
  articleId: string;
  tier: 'Critical' | 'Warning' | 'Watch';
  category: string;
  headline: string;
  sourceName: string | null;
  severity: number;
  impactGhsMid: number | null;
  mtnRelevance: number | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface AlertSummary {
  total_active: number;
  critical: number;
  warning: number;
  watch: number;
}

export async function fetchAlerts(params: {
  tier?: string;
  acknowledged?: boolean;
  limit?: number;
} = {}): Promise<NewsAlert[]> {
  const qs = new URLSearchParams();
  if (params.tier !== undefined)         qs.set('tier',         params.tier);
  if (params.acknowledged !== undefined) qs.set('acknowledged', String(params.acknowledged));
  if (params.limit !== undefined)        qs.set('limit',        String(params.limit));
  return apiFetch<NewsAlert[]>(`/api/alerts?${qs}`);
}

export async function fetchAlertSummary(): Promise<AlertSummary> {
  return apiFetch<AlertSummary>('/api/alerts/summary');
}

export async function acknowledgeAlert(alertId: string): Promise<NewsAlert> {
  return apiFetch<NewsAlert>(`/api/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
}

// ── Ghana Economics (World Bank) ───────────────────────────────────────────────

export interface EconomicIndicator {
  latest: number | null;
  year: number | null;
  unit: string;
  description: string;
  history: { year: number; value: number }[];
}

export interface GhanaEconomics {
  lastUpdated: string;
  source: string;
  country: string;
  indicators: {
    inflation:    EconomicIndicator;
    gdp_growth:   EconomicIndicator;
    fx_usd_ghs:   EconomicIndicator;
    unemployment: EconomicIndicator;
    debt_service:  EconomicIndicator;
    fdi_inflows:  EconomicIndicator;
  };
}

export interface EconomicsRiskContext {
  inflation_risk: 'Critical' | 'Warning' | 'Watch' | 'Normal';
  growth_risk:    'Critical' | 'Warning' | 'Normal';
  fx_risk:        'Critical' | 'Warning' | 'Watch' | 'Normal';
  summary: string;
  raw: GhanaEconomics;
}

export async function fetchGhanaEconomics(refresh = false): Promise<GhanaEconomics> {
  return apiFetch<GhanaEconomics>(`/api/economics${refresh ? '?refresh=true' : ''}`);
}

export async function fetchEconomicsRiskContext(): Promise<EconomicsRiskContext> {
  return apiFetch<EconomicsRiskContext>('/api/economics/risk-context');
}

// ── Intelligence Briefing (LLM daily summary) ─────────────────────────────────

export interface IntelligenceTopArticle {
  title: string;
  source: string | null;
  url: string | null;
  tier: string | null;
  severity: number | null;
  sentiment: string | null;
  impact_ghs_mid: number | null;
}

export interface IntelligenceSection {
  category: string;
  label: string;
  icon: string;
  article_count: number;
  critical_count: number;
  summary: string;
  top_articles: IntelligenceTopArticle[];
}

export interface IntelligenceSummary {
  generated_at: string;
  period: string;
  total_articles: number;
  tier_counts: { Critical: number; Warning: number; Watch: number };
  overall_risk: string;
  risk_color: string;
  headline: {
    title: string;
    source: string | null;
    tier: string;
    severity: number | null;
    url: string | null;
  } | null;
  sections: IntelligenceSection[];
  used_llm: boolean;
}

export async function fetchIntelligenceSummary(): Promise<IntelligenceSummary> {
  return apiFetch<IntelligenceSummary>('/api/intelligence/summary');
}

