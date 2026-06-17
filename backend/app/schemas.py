from pydantic import BaseModel
from typing import Optional, Literal, List

PillarId = Literal['A', 'B', 'C', 'D', 'E', 'F', 'G']
StatusLevel = Literal['Safe', 'Watch', 'Warning', 'Critical']
ScenarioType = Literal['Stress', 'Shock', 'Combined', 'Upside']


class Kpi(BaseModel):
    id: str
    name: str
    category: Literal['Financial', 'Segment', 'Operational', 'External']
    unit: str
    fy25Value: float
    lowerThreshold: Optional[float]
    upperThreshold: Optional[float]
    currentStatus: StatusLevel
    trend24m: List[float]


class KpiImpact(BaseModel):
    kpiId: str
    type: Literal['pct', 'delta', 'abs']
    value: float


class Scenario(BaseModel):
    id: str
    pillar: PillarId
    pillarName: str
    type: ScenarioType
    name: str
    description: str
    severity: int
    plausibility: int
    calibrationAnchor: str
    lastCalibrated: str
    owner: str
    kpiImpacts: List[KpiImpact]


class ScenarioResultRow(BaseModel):
    kpiId: str
    baseValue: float
    scenarioValue: float
    deltaPct: float
    status: StatusLevel


class ShapAttribution(BaseModel):
    feature: str
    contribution: float


class ScenarioOutput(BaseModel):
    scenarioId: str
    severityMultiplier: float
    results: List[ScenarioResultRow]
    shapAttributions: List[ShapAttribution]
    generatedAt: str


class RunScenarioRequest(BaseModel):
    severityMultiplier: float = 1.0
    macroOverlays: dict = {}


class KpiImpactInput(BaseModel):
    kpiId: str
    type: Literal['pct', 'delta', 'abs']
    value: float


class ScenarioMutateInput(BaseModel):
    name: str
    pillar: PillarId
    type: ScenarioType
    severity: int
    plausibility: int
    description: str
    kpiImpacts: List[KpiImpactInput]
    calibrationAnchor: Optional[str] = ""


class ForecastPoint(BaseModel):
    date: str
    median: float
    p05: float
    p50: float
    p95: float
    isHistorical: bool


class ReverseStressInput(BaseModel):
    kpiId: str
    operator: Literal['lt', 'gt', 'dropsBy', 'risesAbove']
    threshold: float
    scenarioId: Optional[str] = None


class CrossScenarioRankRow(BaseModel):
    scenarioId: str
    scenarioName: str
    pillar: PillarId
    requiredSeverityMultiplier: float
    breachKpiValue: float


class SingleScenarioSolverResult(BaseModel):
    scenarioId: str
    requiredSeverityMultiplier: float
    breachKpiValue: float
    binarySearchTrajectory: List[dict]


class ReverseStressResult(BaseModel):
    input: ReverseStressInput
    singleScenarioResult: Optional[SingleScenarioSolverResult] = None
    crossScenarioRanking: Optional[List[CrossScenarioRankRow]] = None
    generatedAt: str


class BoardBriefImpact(BaseModel):
    kpiId: str
    narrative: str


class BoardBrief(BaseModel):
    id: str
    title: str
    scenarioIds: List[str]
    status: Literal['Ready', 'Generating', 'Failed']
    generatedAt: str
    severityScore: float
    estimatedImpact: dict
    executiveSummary: str
    keyKpiImpacts: List[BoardBriefImpact]
    calibrationNotes: str
    recommendedActions: List[str]
    keyEntities: List[str]


class PipelineHealthSource(BaseModel):
    name: str
    status: Literal['Healthy', 'Degraded', 'Failed']
    latencyMs: int
    lastSyncAt: str


class PipelineHealth(BaseModel):
    status: Literal['Healthy', 'Degraded', 'Failed']
    lastBeatAt: str
    sources: List[PipelineHealthSource]
