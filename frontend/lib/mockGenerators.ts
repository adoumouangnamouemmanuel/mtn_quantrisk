import { 
  KpiId, ScenarioOutput, ReverseStressResult, 
  BoardBrief, MacroOverlays, ReverseStressInput, StatusLevel
} from './types';
import { MOCK_KPIS, MOCK_SCENARIOS } from './mockData';

// Helper for deterministic pseudo-random based on string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return Math.abs(hash);
}

function getStatus(kpiId: KpiId, value: number): StatusLevel {
  const kpi = MOCK_KPIS.find(k => k.id === kpiId);
  if (!kpi) return 'Safe';
  
  if (kpi.upperThreshold !== null && value > kpi.upperThreshold) return 'Critical';
  if (kpi.lowerThreshold !== null && value < kpi.lowerThreshold) return 'Critical';
  
  // Simulated watch/warning bands
  if (kpi.upperThreshold !== null && value > kpi.upperThreshold * 0.9) return 'Warning';
  if (kpi.lowerThreshold !== null && value < kpi.lowerThreshold * 1.1) return 'Warning';
  
  return 'Safe';
}

function getShapFeatures(pillar: string): string[] {
  switch (pillar) {
    case 'A': return ['CEDI/USD RATE', 'INFLATION RATE', 'POLICY RATE', 'USD-DENOMINATED CAPEX', 'BRENT CRUDE', 'TREASURY YIELD', 'IMPORT DUTIES', 'GDP GROWTH'];
    case 'B': return ['SMP DECLARATION', 'TAX REGIME', 'NCA FINES', 'SPECTRUM FEES', 'REGULATORY ASYMMETRY', 'DATA PRICING FLOOR', 'MOBILE MONEY LEVY', 'SIM REGISTRATION'];
    case 'C': return ['RANSOMWARE PROBABILITY', 'FIBER CUT FREQUENCY', 'DATA CENTER UPTIME', 'VENDOR CONCENTRATION', 'CLOUD AVAILABILITY', 'API GATEWAY LOAD', 'HARDWARE LEAD TIME', 'LEGACY DEBT'];
    case 'D': return ['COMPETITOR 4G CAPEX', 'MARKET SHARE DELTA', 'CHURN RATE', 'PRICE WAR INTENSITY', 'OTT VOICE EROSION', 'BRAND SENTIMENT', 'YOUTH ADOPTION', 'RETAIL PRESENCE'];
    case 'E': return ['POWER OUTAGE HRS', 'FUEL PRICES', 'FLOOD PROBABILITY', 'SUPPLY CHAIN LATENCY', 'THEFT INCIDENTS', 'WAREHOUSE STOCK', 'FLEET AVAILABILITY', 'STAFF ATTRITION'];
    case 'F': return ['5G UPTAKE', 'MFS PENETRATION', 'ENTERPRISE B2B', 'RURAL EXPANSION', 'SMARTPHONE PENETRATION', 'API MONETIZATION', 'FIBER TO HOME', 'DIGITAL SERVICES'];
    default: return ['BASE RATE', 'VOLATILITY', 'FX RESERVES', 'SOVEREIGN RATING', 'CONSUMER CONFIDENCE', 'UNEMPLOYMENT', 'FDI INFLOWS', 'ELECTION UNCERTAINTY'];
  }
}

export function mockRunScenario(id: string, severityMultiplier: number, overlays: MacroOverlays): ScenarioOutput {
  const scenario = MOCK_SCENARIOS.find(s => s.id === id);
  if (!scenario) throw new Error("Scenario not found");

  const results = scenario.kpiImpacts.map(impact => {
    const kpi = MOCK_KPIS.find(k => k.id === impact.kpiId)!;
    let scenarioValue = kpi.fy25Value;
    
    // Apply overlays conceptually
    const overlayModifier = 1 + (overlays.cediShockPct / 100) + (overlays.inflationOverlayPp / 100);
    const effectiveMultiplier = severityMultiplier * overlayModifier;

    if (impact.type === 'pct') {
      scenarioValue = kpi.fy25Value * (1 + (impact.value * effectiveMultiplier) / 100);
    } else if (impact.type === 'delta') {
      scenarioValue = kpi.fy25Value + (impact.value * effectiveMultiplier);
    } else {
      scenarioValue = impact.value * effectiveMultiplier;
    }

    const deltaPct = ((scenarioValue - kpi.fy25Value) / Math.abs(kpi.fy25Value)) * 100;

    return {
      kpiId: kpi.id,
      baseValue: kpi.fy25Value,
      scenarioValue,
      deltaPct,
      status: getStatus(kpi.id, scenarioValue)
    };
  });

  const hash = hashCode(id + severityMultiplier.toString());
  const features = getShapFeatures(scenario.pillar);
  
  const shapAttributions = features.map((f, i) => {
    const magnitude = (hash % (10 - i)) * 1.5 * severityMultiplier;
    const sign = (hash % (i + 2) === 0) ? 1 : -1;
    return {
      feature: f,
      contribution: magnitude * sign
    };
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    scenarioId: id,
    severityMultiplier,
    results,
    shapAttributions,
    generatedAt: new Date().toISOString()
  };
}

export function mockReverseStress(input: ReverseStressInput): ReverseStressResult {
  const kpi = MOCK_KPIS.find(k => k.id === input.kpiId);
  if (!kpi) throw new Error("KPI not found");

  const checkBreach = (val: number, threshold: number, operator: string) => {
    switch(operator) {
      case 'lt': return val < threshold;
      case 'gt': return val > threshold;
      case 'dropsBy': return val < kpi.fy25Value * (1 - threshold/100);
      case 'risesAbove': return val > kpi.fy25Value * (1 + threshold/100);
      default: return false;
    }
  };

  const getEffectiveThreshold = (threshold: number, operator: string) => {
    if (operator === 'dropsBy') return kpi.fy25Value * (1 - threshold/100);
    if (operator === 'risesAbove') return kpi.fy25Value * (1 + threshold/100);
    return threshold;
  };

  const effThreshold = getEffectiveThreshold(input.threshold, input.operator);

  if (input.scenarioId) {
    const scenario = MOCK_SCENARIOS.find(s => s.id === input.scenarioId)!;
    const impact = scenario.kpiImpacts.find(i => i.kpiId === input.kpiId);
    
    // Simulate binary search
    const trajectory = [];
    let low = 0.1, high = 5.0, mid = 2.5;
    let kpiValue = kpi.fy25Value;
    
    for (let i = 1; i <= 10; i++) {
      mid = (low + high) / 2;
      const effectiveImpact = impact ? (impact.type === 'pct' ? kpi.fy25Value * (impact.value * mid / 100) : impact.value * mid) : 0;
      kpiValue = kpi.fy25Value + effectiveImpact;
      
      trajectory.push({ iteration: i, severity: mid, kpiValue });
      
      const breached = checkBreach(kpiValue, input.threshold, input.operator);
      // Logic assumes monotonic impact. If breach happens, we can lower severity to find edge
      // But if impact moves away from threshold, it will never breach
      if (breached) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return {
      input,
      singleScenarioResult: {
        scenarioId: input.scenarioId,
        requiredSeverityMultiplier: Number(mid.toFixed(2)),
        breachKpiValue: Number(kpiValue.toFixed(2)),
        binarySearchTrajectory: trajectory
      },
      generatedAt: new Date().toISOString()
    };
  } else {
    // Cross scenario sweep
    const ranking = MOCK_SCENARIOS.map(scenario => {
      const impact = scenario.kpiImpacts.find(i => i.kpiId === input.kpiId);
      if (!impact || impact.value === 0) return null;
      
      // Calculate multiplier needed
      let requiredSeverity = 0;
      
      if (impact.type === 'pct') {
        const deltaPctNeeded = ((effThreshold - kpi.fy25Value) / kpi.fy25Value) * 100;
        requiredSeverity = deltaPctNeeded / impact.value;
      } else {
        const deltaNeeded = effThreshold - kpi.fy25Value;
        requiredSeverity = deltaNeeded / impact.value;
      }

      if (requiredSeverity <= 0 || requiredSeverity > 10) return null; // Wrong direction or impossible

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        pillar: scenario.pillar,
        requiredSeverityMultiplier: Number(requiredSeverity.toFixed(2)),
        breachKpiValue: effThreshold
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    ranking.sort((a, b) => a.requiredSeverityMultiplier - b.requiredSeverityMultiplier);

    return {
      input,
      crossScenarioRanking: ranking,
      generatedAt: new Date().toISOString()
    };
  }
}

export function mockGenerateBoardBrief(scenarioIds: string[]): BoardBrief {
  const isComparative = scenarioIds.length === 2;
  const s1 = MOCK_SCENARIOS.find(s => s.id === scenarioIds[0]);
  const s2 = isComparative ? MOCK_SCENARIOS.find(s => s.id === scenarioIds[1]) : null;

  return {
    id: `B${Math.floor(Math.random() * 1000)}`,
    title: isComparative 
      ? `Comparative Analysis: ${s1?.name} vs ${s2?.name}`
      : `Executive Brief: ${s1?.name}`,
    scenarioIds,
    status: 'Ready',
    generatedAt: new Date().toISOString(),
    severityScore: isComparative ? Math.max(s1?.severity||1, s2?.severity||1) : (s1?.severity || 3),
    estimatedImpact: { currency: 'GHS', magnitude: isComparative ? 450 : 250, unit: 'M' },
    executiveSummary: isComparative 
      ? `Scenario A (${s1?.name}) presents a primary risk to operational stability, whereas Scenario B (${s2?.name}) drives immediate financial compression. A unified mitigation strategy must balance CapEx defense with short-term liquidity reserves.`
      : `This scenario outlines a significant risk vector originating from the ${s1?.pillarName} pillar. Immediate cross-functional alignment is required to mitigate projected KPI degradation across core segments.`,
    keyKpiImpacts: [
      { kpiId: 'FIN01', narrative: 'Projected to drop significantly below baseline expectations.' },
      { kpiId: 'OPS04', narrative: 'ARPU severely impacted by shifting consumer behaviors.' }
    ],
    calibrationNotes: isComparative 
      ? `Calibrated against dual historical anchors including ${s1?.calibrationAnchor} and ${s2?.calibrationAnchor}.`
      : `Calibrated against ${s1?.calibrationAnchor} with standard severity overlays.`,
    recommendedActions: [
      "Hedge FX exposures for Q3 hardware orders",
      "Accelerate localized marketing in key resilient regions",
      "Defer non-critical Tier 3 infrastructure upgrades"
    ],
    keyEntities: ["NCA", "Bank of Ghana", "Key Suppliers"]
  };
}
