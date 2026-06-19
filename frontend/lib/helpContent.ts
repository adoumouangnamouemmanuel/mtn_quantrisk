export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface HelpGuide {
  id: string;
  title: string;
  description: string;
  iconName: string;
  content: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "ARIMA",
    definition: "AutoRegressive Integrated Moving Average. A statistical model used in our Predictive Forecasts to analyze and forecast future time series data based on past trends and momentum."
  },
  {
    term: "P50 / P95 Confidence Intervals",
    definition: "P50 is the median forecast (50% likelihood). P95 is the upper bound of our confidence interval, meaning there is a 95% probability the actual value will fall below this line. P05 is the lower bound."
  },
  {
    term: "Severity Multiplier",
    definition: "A dynamic slider in the Stress Tester that amplifies the magnitude of a scenario. 1.0x represents the standard modeled severity. 2.0x means the impacts are doubled."
  },
  {
    term: "SHAP Values",
    definition: "SHapley Additive exPlanations. A game-theoretic approach used to explain the output of our machine learning models. It shows exactly how much each underlying business driver (e.g., Cedi depreciation) contributed to the final KPI drop."
  },
  {
    term: "Macro Overlays",
    definition: "Additional compounding factors (like severe Cedi depreciation or high inflation) that can be layered on top of any scenario to model complex 'perfect storm' crises."
  },
  {
    term: "Reverse Stress Testing",
    definition: "A modeling approach where we start from a known catastrophic outcome (e.g., 'EBITDA drops below 12,000') and work backward to determine exactly what severity of a given scenario would cause that failure."
  },
  {
    term: "EBITDA Margin",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization divided by Total Revenue. It is a critical measure of our operating profitability."
  },
  {
    term: "Worse-Of Logic",
    definition: "A feature in Scenario Compare that evaluates two scenarios and automatically highlights the one that results in the most severe degradation for a specific KPI."
  },
  {
    term: "Pillar",
    definition: "Our risk taxonomy classification. Scenarios are grouped into Pillars such as Macro & FX, Regulatory, Tech & Cyber, Competition, Operational & Climate, and Commercial."
  }
];

export const GUIDES: HelpGuide[] = [
  {
    id: "core-anchors",
    title: "Core Anchors & KRI Book",
    description: "Monitoring current operational health and historical trends.",
    iconName: "LayoutDashboard",
    content: [
      "The Dashboard (Core Anchors) provides a high-level summary of the top 6 most critical KPIs that determine MTN's immediate health.",
      "Navigate to the Full KRI Book to see a comprehensive tabular view of all Key Risk Indicators, their categories, units, and strict Lower/Upper thresholds.",
      "Any KPI breaching its threshold will be automatically flagged with a 'Warning' or 'Critical' badge."
    ]
  },
  {
    id: "predictive-forecasts",
    title: "Predictive Forecasts",
    description: "Looking forward with 90-day predictive bands.",
    iconName: "LineChart",
    content: [
      "Use the KPI strip at the top to select which indicator to forecast.",
      "The chart plots the last 24 months of historical data (solid grey line) and forecasts 90 days into the future (dashed yellow line).",
      "The shaded regions represent the P05 to P95 confidence intervals—the wider the band, the higher the mathematical uncertainty.",
      "Use the toggle in the top right of the chart to switch between visual graph mode and tabular data mode."
    ]
  },
  {
    id: "stress-tester",
    title: "Stress Tester",
    description: "Simulate specific crisis scenarios and see the projected impact.",
    iconName: "FlaskConical",
    content: [
      "Select a predefined scenario from the dropdown (e.g., Cedi Devaluation, Cyber Breach).",
      "Adjust the 'Severity Multiplier' slider. 1.0x is the historically calibrated baseline. Pushing it to 5.0x models severe tail-risk.",
      "The Waterfall Decomposition chart shows exactly which business drivers (SHAP values) are pulling the KPI down.",
      "You can toggle 'Macro Overlays' to simulate a compound crisis (e.g., adding a 30% Cedi drop to a Cyber Breach)."
    ]
  },
  {
    id: "scenario-compare",
    title: "Scenario Compare",
    description: "Side-by-side analysis of two distinct threats.",
    iconName: "GitCompare",
    content: [
      "Select 'Scenario A' and 'Scenario B' from the top dropdowns.",
      "The system automatically computes the delta (change) for each core KPI under both scenarios.",
      "The 'Worse Of' column highlights which scenario poses the greater threat to that specific metric.",
      "The Executive Summary on the right automatically synthesizes a narrative comparing the two threats."
    ]
  },
  {
    id: "reverse-stress",
    title: "Reverse Stress Testing",
    description: "Start from failure and work backwards to find the breaking point.",
    iconName: "ActivitySquare",
    content: [
      "Use the Target Builder at the top: 'Find what it takes for [KPI] to [drop below] [Value]'.",
      "You can run this against a Single Scenario. The engine will use a binary search trajectory to find the exact Severity Multiplier required to breach your target.",
      "Alternatively, use the 'Cross-Scenario Sweep'. The system will test your target against ALL scenarios simultaneously and rank them from most dangerous (easiest to breach) to least dangerous."
    ]
  }
];
