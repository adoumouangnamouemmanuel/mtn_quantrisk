export type PillarId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type PillarName = 'Macro & FX' | 'Regulatory' | 'Tech & Cyber'
  | 'Competitive' | 'Operational & Climate' | 'Upside' | 'Tail Risk';

export type ScenarioType = 'Stress' | 'Shock' | 'Combined' | 'Upside';
export type Severity = 1 | 2 | 3 | 4 | 5;
export type Plausibility = 1 | 2 | 3 | 4 | 5;
export type StatusLevel = 'Safe' | 'Watch' | 'Warning' | 'Critical';

export type KpiId = 'FIN01' | 'FIN02' | 'FIN03' | 'FIN04' | 'FIN05' | 'FIN06'
  | 'SEG01' | 'SEG03' | 'OPS01' | 'OPS04' | 'OPS07'
  | 'EXT01' | 'EXT02' | 'EXT03';

export interface Kpi {
  id: KpiId;
  name: string;
  // One of the six canonical risk categories: strategic / financial /
  // operational / technological / governance / external.
  category: string;
  unit: string;             // 'GHSm' | '%' | 'GHS' | 'M' | 'GHS/USD'
  fy25Value: number;
  lowerThreshold: number | null;
  upperThreshold: number | null;
  currentStatus: StatusLevel;
  trend24m: number[];       // for sparkline
  reportingPeriod?: string;
  sourcePeriod?: string;
  sourceType?: 'Reported' | 'Derived' | 'Carried forward';
  notes?: string;
}

export interface Scenario {
  id: string;               // 'S01' .. 'S56'
  pillar: PillarId;
  pillarName: PillarName;
  type: ScenarioType;
  name: string;
  description: string;
  severity: Severity;
  plausibility: Plausibility;
  calibrationAnchor: string;
  lastCalibrated: string;   // ISO date
  owner: string;
  kpiImpacts: KpiImpact[];
}

export interface KpiImpact {
  kpiId: KpiId;
  type: 'pct' | 'delta' | 'abs';
  value: number;
}

export interface ScenarioOutput {
  scenarioId: string;
  severityMultiplier: number;
  results: Array<{
    kpiId: KpiId;
    baseValue: number;
    scenarioValue: number;
    deltaPct: number;
    status: StatusLevel;
  }>;
  shapAttributions: Array<{
    feature: string;
    contribution: number;   // SHAP value, can be negative
  }>;
  shapUnavailable?: boolean; // true when real SHAP attributions could not be computed
  waterfallDrivers?: {
    FIN01: Array<{ name: string; contribution: number }>;
    FIN03: Array<{ name: string; contribution: number }>;
  };
  generatedAt: string;
}

export interface ForecastPoint {
  date: string;
  median: number;
  p05: number;
  p50: number;
  p95: number;
  isHistorical: boolean;
}

/** An event that pressures a forecast point, surfaced for drill-down. */
export interface ForecastEvent {
  articleId: string;
  title: string;
  source: string | null;
  category: string;
  severity: number;
  mtnRelevance: number;
  alertTier: string | null;
  scrapedAt: string;
  ageDays: number;
  decayWeight: number;
  pressureDirection: 'up' | 'down';
  pressureAbs: number;
  pressurePct: number;
  url: string | null;
}

/** A forecast point enriched with live-event pressure + drill-down. */
export interface EventForecastPoint extends ForecastPoint {
  adjustmentAbs?: number;
  adjustmentPct?: number;
  events?: ForecastEvent[];
}

export interface EventForecast {
  kpiId: string;
  baselineModel: string;
  eventAdjusted: boolean;
  eventCount: number;
  aggregatePressure: { up: number; down: number; net: number };
  narrative: string;
  llmUsed: boolean;
  points: EventForecastPoint[];
  generatedAt: string;
}

/** Reasoning breakdown for a news article's scores. */
export interface NewsReasoning {
  articleId: string;
  title: string;
  scored: boolean;
  note?: string;
  category?: string;
  categoryLabel?: string;
  originalCategory?: string;
  severity?: number;
  mtnRelevance?: number;
  confidence?: number;
  alertTier?: string | null;
  sentiment?: string | null;
  relevanceReasons?: Array<{ signal: string; keyword: string | null; weight: number; note?: string }>;
  severityReasons?: Array<{ signal: string; keyword?: string; category?: string; mappedCategory?: string; value?: number | string; note?: string }>;
  sentimentReasons?: Array<{ signal: string; value?: string | null; confidence?: number | null; note?: string }>;
  impactReasons?: Array<{ signal: string; min: number | null; mid: number | null; max: number | null; note?: string }>;
  entities?: { orgs: string[]; money: string[]; locations: string[]; persons: string[] } | null;
  keywordHits?: Record<string, number>;
  matchedCategoryKeywords?: string[];
  llmExplanation?: string | null;
  llmUsed?: boolean;
}

export interface MonteCarloKpiResult {
  kpiId: string;
  kpiName: string;
  unit: string;
  baseValue: number;
  p05: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  mean: number;
  std: number;
  worstCase: number;
  bestCase: number;
}

export interface MonteCarloResult {
  scenarioId: string;
  nSimulations: number;
  uncertaintyPct: number;
  results: MonteCarloKpiResult[];
}

export interface FeedbackPayload {
  page: string;
  feedbackType: 'wrong_prediction' | 'false_alert' | 'inaccurate' | 'other';
  rating: 'positive' | 'negative';
  message: string;
  context?: Record<string, unknown>;
}

export interface BaseCaseLogEntry {
  timestamp: string;
  kpiId: string;
  oldValue: number;
  newValue: number;
  delta: number;
  deltaPct: number;
  source: string;
}

export interface PdfKpiCandidate {
  kpiId: string;
  kpiName: string;
  value: number;
  unit: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface UploadResult {
  filename: string;
  changesApplied?: number;
  changes?: Array<{ kpiId: string; kpiName: string; oldValue: number; newValue: number; deltaPct: number }>;
  kpiCandidates?: PdfKpiCandidate[];
  llmUsed?: boolean;
}

export interface BoardBrief {
  id: string;
  title: string;
  scenarioIds: string[];
  status: 'Ready' | 'Generating' | 'Failed';
  generatedAt: string;
  severityScore: number;
  estimatedImpact: { currency: 'GHS'; magnitude: number; unit: 'M' | 'Bn' };
  executiveSummary: string;
  keyKpiImpacts: Array<{ kpiId: KpiId; narrative: string }>;
  calibrationNotes: string;
  recommendedActions: string[];
  keyEntities: string[];
}

export interface PipelineHealth {
  status: 'Healthy' | 'Degraded' | 'Failed';
  lastBeatAt: string;
  automaticScraper?: {
    status: 'Scheduled' | 'Unavailable';
    nextRunAt: string | null;
    schedule: string | null;
  };
  historicalData?: Array<{
    name: string;
    status: 'Healthy' | 'Failed';
    path: string;
    rows: number;
    lastModifiedAt: number | null;
    error: string | null;
  }>;
  externalFeeds?: {
    lastAttemptAt: string | null;
    lastCompletedAt: string | null;
    lastSuccessfulFetchAt: string | null;
    lastNewArticleAt: string | null;
    latestStoredArticleAt: string | null;
    fetchedCount: number;
    newArticleCount: number;
    filteredCount: number;
    gnewsConfigured: boolean;
    summary: { healthy: number; degraded: number; failed: number; total: number };
  };
  modelQuality?: {
    status: 'MetricsAvailable' | 'MetricsUnavailable';
    lastTrainedAt: string | null;
    metrics: Array<{ target: string; mae: number | null; r2: number | null; trainRows: number | null }>;
    accuracyProven: boolean;
    note: string;
  };
  sources: Array<{
    name: string;
    status: 'Healthy' | 'Degraded' | 'Failed';
    latencyMs: number;
    lastSyncAt: string;
  }>;
}

export type ReverseOperator = 'lt' | 'gt' | 'dropsBy' | 'risesAbove';

export interface ReverseStressInput {
  kpiId: KpiId;
  operator: ReverseOperator;
  threshold: number;
  scenarioId?: string; // optional: solve for one scenario; absent = solve across all 56
}

export interface ReverseStressResult {
  input: ReverseStressInput;
  singleScenarioResult?: {
    scenarioId: string;
    requiredSeverityMultiplier: number;
    breachKpiValue: number;
    binarySearchTrajectory: Array<{ iteration: number; severity: number; kpiValue: number }>;
  };
  crossScenarioRanking?: Array<{
    scenarioId: string;
    scenarioName: string;
    pillar: PillarId;
    requiredSeverityMultiplier: number;
    breachKpiValue: number;
  }>;
  generatedAt: string;
}

export interface MacroOverlays {
  cediShockPct: number;       // -50 to +50
  inflationOverlayPp: number; // -10 to +30
  policyRateOverlayPp: number; // -10 to +15
}

export interface QuarterlyPoint {
  quarter: string; // "FY20Q1"
  period: string;
  value: number;
  quality: 'Reported' | 'Interpolated' | 'Estimated' | 'Source';
}

export interface MonthlyPoint {
  month: string; // "Jan 2023"
  period: string;
  value: number;
  quality: 'Reported' | 'Interpolated' | 'Estimated' | 'Source';
}

export interface HistoryMetadata {
  kpiId: string;
  requestedFrequency: 'quarterly' | 'monthly';
  actualFrequency: 'quarterly' | 'annual' | 'monthly';
  sourceFile: string;
  sourceModifiedAt: number;
  lastPeriod: string | null;
  pointCount: number;
  containsReported: boolean;
  containsInterpolated: boolean;
  containsEstimated: boolean;
  isSynthetic: boolean;
  note: string;
}

export interface QuarterlySeries {
  points: QuarterlyPoint[];
  metadata: HistoryMetadata;
}

export interface MonthlySeries {
  points: MonthlyPoint[];
  metadata: HistoryMetadata;
}

export interface ScenarioFormData {
  name: string;
  pillar: PillarId;
  type: ScenarioType;
  severity: number;
  plausibility: number;
  description: string;
  kpiImpacts: { kpiId: string; type: 'pct' | 'delta' | 'abs'; value: number }[];
  calibrationAnchor?: string;
}

export interface ComparisonRow {
  kpiId: KpiId;
  baseValue: number;
  scenarioAValue: number;
  scenarioBValue: number;
  deltaA: number;
  deltaB: number;
  worseOf: 'A' | 'B' | 'tie';
}
