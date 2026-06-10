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
  category: 'Financial' | 'Segment' | 'Operational' | 'External';
  unit: string;             // 'GHSm' | '%' | 'GHS' | 'M' | 'GHS/USD'
  fy25Value: number;
  lowerThreshold: number | null;
  upperThreshold: number | null;
  currentStatus: StatusLevel;
  trend24m: number[];       // for sparkline
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

export interface MonteCarloResult {
  kpiId: KpiId;
  iterations: number;
  var5: number;
  var50: number;
  var95: number;
  cvar5: number;
  generatedAt: string;
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
  sources: Array<{
    name: string;
    status: 'Healthy' | 'Degraded' | 'Failed';
    latencyMs: number;
    lastSyncAt: string;
  }>;
}

export type ReverseOperator = '>' | '<' | '>=' | '<=' | '==';

export interface ReverseStressResult {
  kpiId: KpiId;
  threshold: number;
  operator: ReverseOperator;
  scenarioId?: string;
  distanceToBreach: number;
  breachProbability: number;
  requiredSeverityMultiplier: number;
  criticalFeatures: Array<{ feature: string; requiredDelta: number }>;
  generatedAt: string;
}

export type MacroOverlays = Record<string, number>;
