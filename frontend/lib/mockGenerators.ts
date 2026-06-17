import { 
  KpiId, ScenarioOutput, ReverseStressResult, 
  BoardBrief, MacroOverlays, ReverseStressInput, StatusLevel
} from './types';
import { MOCK_KPIS, MOCK_SCENARIOS } from './mockData';

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
  
  if (kpi.upperThreshold !== null && value > kpi.upperThreshold * 0.9) return 'Warning';
  if (kpi.lowerThreshold !== null && value < kpi.lowerThreshold * 1.1) return 'Warning';
  
  return 'Safe';
}

function getShapFeatures(pillar: string): string[] {
  switch (pillar) {
    case 'A': return ['Cedi/USD Shock Magnitude', 'Inflation Pass-through Lag', 'Policy Rate Transmission', 'USD-Denominated Capex', 'Brent Crude Volatility', 'Treasury Yield Spread', 'Import Duty Index', 'Real GDP Contraction'];
    case 'B': return ['MoMo Levy Rate', 'Tax Regime Shift', 'Regulatory Fines', 'Spectrum Fee Amortization', 'Regulatory Asymmetry', 'Data Pricing Floor', 'SIM Registration Churn', 'Compliance Cost Scale'];
    case 'C': return ['Ransomware Dwell Time', 'Fiber Cut Frequency', 'Data Center Uptime', 'Vendor Concentration Risk', 'Cloud Availability Drop', 'API Gateway Load Factor', 'Hardware Lead Time', 'Legacy Debt Exploitation'];
    case 'D': return ['Competitor 4G Capex', 'Market Share Delta', 'Sub Churn Velocity', 'Price War Intensity', 'OTT Voice Erosion', 'Brand Sentiment Drop', 'Youth Segment Adoption', 'Retail Presence Gap'];
    case 'E': return ['Power Outage Hours', 'Fuel Price Spike', 'Flood Risk Probability', 'Supply Chain Latency', 'Theft Incident Rate', 'Warehouse Stock Cover', 'Fleet Availability', 'Staff Attrition Rate'];
    case 'F': return ['5G Uptake Velocity', 'MFS Penetration Rate', 'Enterprise B2B Growth', 'Rural Expansion Yield', 'Smartphone Penetration', 'API Monetization Scale', 'Fiber To Home Conversion', 'Digital Services Adoption'];
    default: return ['Compound Macro Factor', 'Historical Volatility Regime', 'FX Reserves Depletion', 'Sovereign Rating Downgrade', 'Consumer Confidence Index', 'Unemployment Spike', 'FDI Inflow Contraction', 'Election Uncertainty Weight'];
  }
}

const WATERFALL_DRIVERS = {
  A: {
    FIN01: ['Cedi FX Pass-through', 'Inflation Pricing Power', 'Subscriber Real Income', 'USD Capex Drag'],
    FIN03: ['FX Translation', 'Tariff Repricing Lag', 'Energy Cost Inflation', 'Opex Indexation']
  },
  B: {
    FIN01: ['Tariff Cap Compliance', 'MoMo Levy Pass-through', 'Volume Substitution', 'Licence Fee Drag'],
    FIN03: ['Compliance Opex', 'Regulatory Provision', 'Spectrum Amortisation']
  },
  C: {
    FIN01: ['Outage Lost Days', 'Customer Recovery', 'Reputation Churn', 'Enterprise Contract Loss'],
    FIN03: ['Incident Response Cost', 'Recovery Capex Acceleration', 'Insurance Premium Step-up']
  },
  D: {
    FIN01: ['ARPU Compression', 'Subscriber Churn', 'CAC Inflation', 'Bundle Loss-Leader'],
    FIN03: ['Price Defense Cost', 'CAC Amortisation', 'Loyalty Program Spend']
  },
  E: {
    FIN01: ['Site Availability Loss', 'Coverage Gap Revenue', 'Service Credit Issuance'],
    FIN03: ['Diesel Cost Step-up', 'Emergency Capex Run-rate', 'Restoration Opex']
  },
  F: {
    FIN01: ['New Service Adoption', 'ARPU Lift', 'Subscriber Acquisition', 'Enterprise Upsell'],
    FIN03: ['Operating Leverage', 'Mix Improvement', 'Cost Discipline']
  },
  G: {
    FIN01: ['Compound Macro Hit', 'Compound Regulatory', 'Compound Cyber', 'Compound Climate'],
    FIN03: ['Compound Margin Compression', 'Compound Opex', 'Compound Capex']
  }
};

function decomposeDelta(delta: number, driverNames: string[], hash: number) {
  if (!driverNames || driverNames.length === 0) return [];
  const weights = driverNames.map((_, i) => Math.abs((hash % (i + 3)) + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const contributions = driverNames.map((name, i) => {
    return { name, contribution: delta * ((weights[i] || 0) / totalWeight) };
  });
  const sumSoFar = contributions.slice(0, -1).reduce((a, b) => a + b.contribution, 0);
  if (contributions.length > 0) {
    const lastEntry = contributions[contributions.length - 1];
    if (lastEntry) lastEntry.contribution = delta - sumSoFar;
  }
  return contributions;
}

export function mockRunScenario(id: string, severityMultiplier: number, overlays: MacroOverlays): ScenarioOutput {
  const scenario = MOCK_SCENARIOS.find(s => s.id === id);
  if (!scenario) throw new Error("Scenario not found");

  const hash = hashCode(id + severityMultiplier.toString() + overlays.cediShockPct.toString());

  const results = scenario.kpiImpacts.map(impact => {
    const kpi = MOCK_KPIS.find(k => k.id === impact.kpiId)!;
    let scenarioValue = kpi.fy25Value;
    
    // Explicit elasticities apply to FIN01 and FIN03 primarily, but overlays modulate the multiplier
    const overlayModifier = 1 + (overlays.cediShockPct / 100) + (overlays.inflationOverlayPp / 100);
    const effectiveMultiplier = severityMultiplier * overlayModifier;

    if (impact.type === 'pct') {
      scenarioValue = kpi.fy25Value * (1 + (impact.value * effectiveMultiplier) / 100);
    } else if (impact.type === 'delta') {
      scenarioValue = kpi.fy25Value + (impact.value * effectiveMultiplier);
    } else {
      scenarioValue = impact.value * effectiveMultiplier;
    }

    // Apply strict margin compression caps
    if (kpi.id === 'FIN03') {
       const isCompound = scenario.pillar === 'G' || ['S11', 'S13', 'S14', 'S32', 'S56'].includes(scenario.id);
       const maxDrop = isCompound ? 8.0 : 2.0;
       const dropLimit = kpi.fy25Value - maxDrop;
       if (scenarioValue < dropLimit) {
         scenarioValue = dropLimit;
       }
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

  const features = getShapFeatures(scenario.pillar);
  
  const shapAttributions = features.map((f, i) => {
    const magnitude = (hash % (10 - i)) * 1.5 * severityMultiplier;
    const sign = (hash % (i + 2) === 0) ? 1 : -1;
    return {
      feature: f,
      contribution: magnitude * sign
    };
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Build Waterfall Drivers
  const fin01Result = results.find(r => r.kpiId === 'FIN01');
  const fin03Result = results.find(r => r.kpiId === 'FIN03');
  
  const fin01Delta = fin01Result ? fin01Result.scenarioValue - fin01Result.baseValue : 0;
  const fin03Delta = fin03Result ? fin03Result.scenarioValue - fin03Result.baseValue : 0;

  const p = scenario.pillar as keyof typeof WATERFALL_DRIVERS;
  const driversDict = WATERFALL_DRIVERS[p] || WATERFALL_DRIVERS['A'];

  const waterfallDrivers = {
    FIN01: decomposeDelta(fin01Delta, driversDict.FIN01, hash),
    FIN03: decomposeDelta(fin03Delta, driversDict.FIN03, hash + 1)
  };

  return {
    scenarioId: id,
    severityMultiplier,
    results,
    shapAttributions,
    waterfallDrivers,
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
    
    // Deterministic binary search
    const trajectory = [];
    let low = 0.1, high = 5.0, mid = 2.5;
    let kpiValue = kpi.fy25Value;
    
    for (let i = 1; i <= 10; i++) {
      mid = (low + high) / 2;
      let effectiveImpact = 0;
      if (impact) {
        if (impact.type === 'pct') {
          effectiveImpact = kpi.fy25Value * (impact.value * mid / 100);
        } else if (impact.type === 'delta') {
          effectiveImpact = impact.value * mid;
        } else {
          effectiveImpact = impact.value * mid - kpi.fy25Value; // Simplified
        }
      }
      kpiValue = kpi.fy25Value + effectiveImpact;
      
      // Strict cap application to match runScenario
      if (kpi.id === 'FIN03') {
        const isCompound = scenario.pillar === 'G' || ['S11', 'S13', 'S14', 'S32', 'S56'].includes(scenario.id);
        const maxDrop = isCompound ? 8.0 : 2.0;
        const dropLimit = kpi.fy25Value - maxDrop;
        if (kpiValue < dropLimit) kpiValue = dropLimit;
      }

      trajectory.push({ iteration: i, severity: mid, kpiValue });
      
      const breached = checkBreach(kpiValue, input.threshold, input.operator);
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
      
      let requiredSeverity = 0;
      
      if (impact.type === 'pct') {
        const deltaPctNeeded = ((effThreshold - kpi.fy25Value) / kpi.fy25Value) * 100;
        requiredSeverity = deltaPctNeeded / impact.value;
      } else {
        const deltaNeeded = effThreshold - kpi.fy25Value;
        requiredSeverity = deltaNeeded / impact.value;
      }

      // Re-check with caps
      if (kpi.id === 'FIN03') {
        const isCompound = scenario.pillar === 'G' || ['S11', 'S13', 'S14', 'S32', 'S56'].includes(scenario.id);
        const maxDrop = isCompound ? 8.0 : 2.0;
        const dropLimit = kpi.fy25Value - maxDrop;
        if (effThreshold < dropLimit) return null; // Impossible to breach
      }

      if (requiredSeverity <= 0 || requiredSeverity > 10) return null;

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

  const p = s1?.pillar as keyof typeof WATERFALL_DRIVERS;
  const driverName = WATERFALL_DRIVERS[p]?.FIN01[0] || 'Macro conditions';

  const templates = [
    `This scenario outlines a significant risk vector originating from the ${s1?.pillarName} pillar. Immediate cross-functional alignment is required to mitigate projected KPI degradation.`,
    `A critical stress event is modeled here, highlighting structural vulnerabilities to ${driverName}. Proactive capital reallocation is strongly advised.`,
    `Modeled impacts demonstrate acute compression in core segments. The shock transmission channel runs primarily through the ${s1?.pillarName} pillar.`,
    `This output represents a tail-risk manifestation. Executive intervention is required to buffer the balance sheet against ${driverName} pressures.`,
    `We observe cascading failures originating from ${s1?.name}. The severity multiplier implies conditions beyond the FY22 historical analogue.`
  ];
  
  const hash = hashCode(s1?.id || 'A');
  const execSummary = isComparative 
    ? `Scenario A (${s1?.name}) presents a primary risk to operational stability, whereas Scenario B (${s2?.name}) drives immediate financial compression. A unified mitigation strategy must balance CapEx defense with short-term liquidity reserves.`
    : (templates[hash % templates.length] || templates[0] || '');

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
    executiveSummary: execSummary,
    keyKpiImpacts: [
      { kpiId: 'FIN01', narrative: `FIN01 declines significantly, driven primarily by ${driverName}, partially offset by secondary pricing power.` },
      { kpiId: 'FIN03', narrative: `EBITDA Margin compression is capped due to historical FY22 calibration resilience.` }
    ],
    calibrationNotes: isComparative 
      ? `Calibrated against dual historical anchors including ${s1?.calibrationAnchor} and ${s2?.calibrationAnchor}.`
      : `Modeled severity is calibrated to 80% of the FY22 cedi crisis observed impact (Anchor: ${s1?.calibrationAnchor}).`,
    recommendedActions: [
      "Accelerate USD-denominated capex commitments before further Cedi weakness materializes.",
      "Hedge FX exposures for Q3 hardware orders.",
      "Defer non-critical Tier 3 infrastructure upgrades.",
      "Engage BoG regarding anticipated liquidity tightening."
    ],
    keyEntities: ["NCA", "Bank of Ghana", "Key Suppliers", "MTN Group"]
  };
}
