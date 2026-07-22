export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'financial' | 'statistical' | 'platform' | 'risk' | 'ml';
}

export interface HelpGuide {
  id: string;
  title: string;
  description: string;
  iconName: string;
  steps: { heading: string; detail: string }[];
  tips?: string[];
  warnings?: string[];
}

export interface QnAItem {
  question: string;
  answer: string;
  example?: string;
}

export interface QnACategory {
  id: string;
  label: string;
  iconName: string;
  items: QnAItem[];
}

// ─── Glossary ────────────────────────────────────────────────────────────────

export const GLOSSARY: GlossaryTerm[] = [
  // Financial
  {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of MTN Ghana\'s core operating profitability, stripping out financing and accounting decisions. Tracked as both an absolute (GHSm) and a margin (%).',
    category: 'financial',
  },
  {
    term: 'ARPU',
    definition: 'Average Revenue Per User. Total service revenue divided by total active subscribers, expressed in GHS. A key efficiency metric — falling ARPU signals either pricing pressure, subscriber mix shift, or macroeconomic squeeze on consumer spending.',
    category: 'financial',
  },
  {
    term: 'PAT Margin',
    definition: 'Profit After Tax Margin. Net profit as a percentage of total revenue. Reflects the combined effect of revenue performance, cost discipline, interest charges, and corporate tax. Lower than EBITDA margin due to financing and tax costs.',
    category: 'financial',
  },
  {
    term: 'MoMo Revenue',
    definition: 'Mobile Money Revenue. Income generated from MTN\'s mobile financial services platform. Highly sensitive to e-levy policy changes, agent network health, transaction volumes, and consumer trust.',
    category: 'financial',
  },
  {
    term: 'Service Revenue',
    definition: 'Total operating revenue from all service lines: voice, data, MoMo, enterprise, and roaming. The top-line KPI for MTN Ghana and the primary target of most stress scenarios.',
    category: 'financial',
  },
  {
    term: 'Revenue Growth YoY',
    definition: 'Year-on-year percentage growth in service revenue. A declining growth rate does not mean revenue is falling — it means it is growing more slowly than the previous year.',
    category: 'financial',
  },
  {
    term: 'Cedi / USD',
    definition: 'The exchange rate between the Ghanaian Cedi (GHS) and the US Dollar. A weaker Cedi inflates USD-denominated costs (network capex, roaming settlements) and erodes USD-reported revenue. Tracked as GHS per 1 USD.',
    category: 'financial',
  },

  // Risk
  {
    term: 'KRI',
    definition: 'Key Risk Indicator. A forward-looking metric that signals rising exposure before a loss occurs. KRIs have defined warning and critical thresholds — breaches trigger escalation protocols.',
    category: 'risk',
  },
  {
    term: 'KPI',
    definition: 'Key Performance Indicator. A metric tracking current or historical business performance. Unlike KRIs, KPIs describe what has happened rather than what might happen.',
    category: 'risk',
  },
  {
    term: 'Stress Scenario',
    definition: 'A structured description of an adverse event (e.g., Cedi devaluation, MoMo e-levy increase) with calibrated KPI impact values. The scenario engine applies these impacts to the base case to compute stressed outcomes.',
    category: 'risk',
  },
  {
    term: 'Severity Multiplier',
    definition: 'A scalar that amplifies or reduces the magnitude of a scenario\'s KPI impacts. 1.0× = historically calibrated baseline severity. 2.0× = twice as severe. Use it to model escalating or improving versions of the same event.',
    category: 'risk',
  },
  {
    term: 'Macro Overlay',
    definition: 'An additional compounding macro shock layered on top of an existing stress scenario. For example, adding a 25% Cedi depreciation on top of a Cyber Breach scenario to model a "perfect storm" event.',
    category: 'risk',
  },
  {
    term: 'Pillar',
    definition: 'The risk taxonomy grouping for scenarios. Pillars are: A — Macro & FX, B — Regulatory, C — Tech & Cyber, D — Competitive, E — Operational & Climate, F — Upside, G — Tail Risk.',
    category: 'risk',
  },
  {
    term: 'Base Case',
    definition: 'The current FY25 reference values for all KPIs, loaded from the structured data pipeline. All scenario impacts, Monte Carlo simulations, and forecasts are measured as deviations from this baseline.',
    category: 'risk',
  },
  {
    term: 'Reverse Stress Testing',
    definition: 'A regulatory and risk management technique that starts from a defined catastrophic outcome and works backwards to determine what combination of events would cause it. The platform uses binary search to find the exact severity multiplier at which a threshold breach occurs.',
    category: 'risk',
  },
  {
    term: 'Threshold (Warning / Critical)',
    definition: 'Pre-defined boundary values for each KPI. Breaching the Warning threshold triggers a yellow alert. Breaching the Critical threshold triggers a red alert and typically requires executive escalation. Thresholds are calibrated by the risk team in the KRI Register.',
    category: 'risk',
  },
  {
    term: 'Impact Type',
    definition: 'How a scenario\'s effect is applied to a base KPI value. "pct" = percentage change (e.g., −15%); "delta" = absolute additive change (e.g., −3.5 percentage points); "abs" = the stressed KPI is forced to a specific absolute value.',
    category: 'risk',
  },

  // Statistical
  {
    term: 'Monte Carlo Simulation',
    definition: 'A computational technique that runs thousands of randomised simulations by perturbing input values with controlled noise. Instead of a single deterministic outcome, it produces a probability distribution — showing not just what might happen but how likely each outcome is.',
    category: 'statistical',
  },
  {
    term: 'P05 (5th Percentile)',
    definition: 'The value below which only 5% of Monte Carlo simulations fall. Interpreted as the "stress floor" — a pessimistic but statistically grounded downside estimate. Used as the primary risk metric in the simulation output.',
    category: 'statistical',
  },
  {
    term: 'P50 (Median)',
    definition: 'The midpoint of the simulation distribution. Half of all simulated outcomes fall above this, half below. Closest to the "most likely" central outcome under the given uncertainty assumptions.',
    category: 'statistical',
  },
  {
    term: 'P95 (95th Percentile)',
    definition: 'The value below which 95% of simulations fall. Represents the optimistic upper bound — only 5% of outcomes exceed it. Used to assess upside potential and best-case resilience.',
    category: 'statistical',
  },
  {
    term: 'IQR (Interquartile Range)',
    definition: 'The range between P25 and P75. Contains the central 50% of simulation outcomes. A narrow IQR indicates stability and low dispersion; a wide IQR indicates high volatility in the simulated KPI.',
    category: 'statistical',
  },
  {
    term: 'Standard Deviation (Std)',
    definition: 'Measures how spread out the simulation outcomes are around the mean. A high std deviation means the KPI outcome is highly sensitive to small changes in the scenario inputs — a red flag for volatile indicators.',
    category: 'statistical',
  },
  {
    term: 'Confidence Interval',
    definition: 'The P05–P95 band in forecast and Monte Carlo charts. It means 90% of statistically plausible outcomes fall within this range. The wider the band, the higher the underlying uncertainty.',
    category: 'statistical',
  },
  {
    term: 'ARIMA',
    definition: 'AutoRegressive Integrated Moving Average. A classical statistical time-series model used for forecasting FIN01 (Service Revenue). It captures trends, seasonality, and momentum from historical quarterly data to extrapolate future values.',
    category: 'statistical',
  },
  {
    term: 'Gaussian Noise',
    definition: 'Normally-distributed random perturbations applied to scenario impact values during Monte Carlo simulation. Each run samples from a bell curve centred at the base impact value — the uncertainty band controls the width of this curve.',
    category: 'statistical',
  },

  // ML
  {
    term: 'XGBoost',
    definition: 'Extreme Gradient Boosting. An ensemble machine learning algorithm that trains multiple decision trees sequentially. Used to model the relationship between macro features (inflation, FX, GDP) and KPI outcomes (EBITDA margin, ARPU, MoMo revenue).',
    category: 'ml',
  },
  {
    term: 'SHAP Values',
    definition: 'SHapley Additive exPlanations. A game-theoretic framework that decomposes a model\'s prediction to show exactly how much each input feature contributed to the output. In the Stress Tester waterfall chart, SHAP shows which business driver caused the most KPI movement.',
    category: 'ml',
  },
  {
    term: 'Leave-One-Out CV',
    definition: 'A cross-validation method used during XGBoost training. Given limited historical data (~6 real years), each training run leaves one year out as a test set. Produces unbiased MAE and R² estimates despite small sample sizes.',
    category: 'ml',
  },
  {
    term: 'Feature Scaler',
    definition: 'A StandardScaler applied to macro input features before they enter the XGBoost models. Normalises each feature to zero mean and unit variance so no single variable (e.g., raw Cedi/USD rate) dominates the model due to scale differences.',
    category: 'ml',
  },

  // Platform
  {
    term: 'Automatic News Scraper',
    definition: 'The background RSS ingestion job. It runs once when the backend starts and then every 15 minutes, deduplicates articles by URL, filters broad sources for MTN relevance, and sends new articles through the NLP risk-scoring pipeline.',
    category: 'platform',
  },
  {
    term: 'Ghana Macro Dashboard',
    definition: 'A World Bank-powered view of Ghana inflation, GDP growth, GHS/USD, unemployment, public and publicly guaranteed debt service, and FDI. These are latest annual observations rather than real-time market quotes.',
    category: 'platform',
  },
  {
    term: 'Supabase Authentication',
    definition: 'The platform login system. Credentials are verified by Supabase Auth, protected routes require an active server-side session, and signing out clears that session.',
    category: 'platform',
  },
  {
    term: 'Pipeline Health',
    definition: 'The status check for structured data, ML artefacts, and the automatic news scheduler. Settings shows whether the scraper is scheduled and its next run time. Healthy does not guarantee that every external RSS publisher is reachable.',
    category: 'platform',
  },
  {
    term: 'Board Brief',
    definition: 'An AI-generated executive narrative report summarising scenario findings, KPI impacts, recommended actions, and key risk entities. Designed for board-level communication. Exportable as PDF.',
    category: 'platform',
  },
  {
    term: 'Retrain',
    definition: 'The process of re-running XGBoost model training on the latest structured data files. Triggered via the Settings page or the /api/retrain endpoint. Should be run whenever new annual data is uploaded.',
    category: 'platform',
  },
  {
    term: 'Worse-Of Logic',
    definition: 'In Scenario Compare, the column that highlights — for each KPI — which of the two selected scenarios produces the more severe adverse outcome. Helps prioritise which risk to focus on first.',
    category: 'platform',
  },
];

// ─── Guides ──────────────────────────────────────────────────────────────────

export const GUIDES: HelpGuide[] = [
  {
    id: 'dashboard',
    title: 'Core Anchors Dashboard',
    description: 'Monitor MTN Ghana\'s most critical KPIs at a glance.',
    iconName: 'LayoutDashboard',
    steps: [
      {
        heading: 'Read the status chips',
        detail: 'Each KPI tile shows a colour-coded chip: Safe (green), Watch (orange), Warning (yellow), or Critical (red). These are computed by comparing the current FY25 value against the lower/upper thresholds in the KRI Register.',
      },
      {
        heading: 'Spot trends with sparklines',
        detail: 'The small 24-month sparkline in the bottom-right of each tile shows the historical trajectory. A downward slope in a financial KPI alongside a Warning status is a compounding concern.',
      },
      {
        heading: 'Click a tile to drill down',
        detail: 'Clicking any KPI tile opens the Full KRI Book filtered to that indicator, where you can inspect thresholds, historical values, and category.',
      },
      {
        heading: 'Understand the category icons',
        detail: 'KPIs are grouped into Financial (GHS icon), Segment (pie icon), Operational (CPU icon), and External (globe icon). External KPIs like Inflation follow reverse logic — higher values are worse.',
      },
    ],
    tips: [
      'Focus on Financial KPIs first — they are the lagging indicators that confirm what the leading (External/Operational) KPIs predicted.',
      'EXT01 (Inflation) and EXT03 (Cedi/USD) are early-warning signals; if either is in Warning, check FIN01 and FIN03 for downstream impact.',
    ],
  },
  {
    id: 'kri-register',
    title: 'Full KRI Register',
    description: 'Comprehensive tabular view of all 14 Key Risk Indicators.',
    iconName: 'List',
    steps: [
      {
        heading: 'Browse all KRIs',
        detail: 'The register lists all 14 KPIs with their ID, name, category, unit, FY25 base value, warning threshold, critical threshold, and current status.',
      },
      {
        heading: 'Filter by status',
        detail: 'Use the status filter buttons at the top to isolate KPIs that are currently in Warning or Critical. This helps prioritise which risks need immediate attention.',
      },
      {
        heading: 'Understand threshold direction',
        detail: 'For financial and operational KPIs (FIN01, OPS01, etc.), lower values than the threshold are worse. For external indicators (EXT01 Inflation, EXT02 Policy Rate, EXT03 Cedi/USD), higher values are worse — and the colour coding reflects this.',
      },
    ],
    tips: [
      'The KRI Register is your regulatory audit trail — it documents all threshold breaches with timestamps.',
      'Thresholds are calibrated quarterly by the risk team. If you believe a threshold is outdated, flag it via the feedback widget.',
    ],
  },
  {
    id: 'forecasts',
    title: 'Predictive Forecasts',
    description: 'ML-powered 90-day forward projections for each KPI.',
    iconName: 'LineChart',
    steps: [
      {
        heading: 'Select a KPI',
        detail: 'Use the KPI selector dropdown at the top of the page. FIN01 (Service Revenue) uses a trained ARIMA model. All other KPIs use a calibrated random-walk model until additional training data is available.',
      },
      {
        heading: 'Read the confidence band',
        detail: 'The shaded region between the dashed P05 and P95 lines is your 90% confidence interval — 90% of statistically plausible outcomes for that KPI fall within this band. The solid yellow line is the P50 median.',
      },
      {
        heading: 'Switch to table view',
        detail: 'Toggle the chart/table button to see exact numeric values for each forecast date, including P05, P50, P95, and whether the point is historical or forecast.',
      },
      {
        heading: 'Submit feedback',
        detail: 'Use the thumbs up/down widget at the bottom-right. If the forecast seems wrong or the confidence band too narrow/wide, flag it with a message — this feeds the model improvement pipeline.',
      },
    ],
    tips: [
      'A wide P05–P95 band is not a model flaw — it honestly reflects uncertainty. Narrow bands can be overconfident.',
      'Forecasts beyond 30 days should be treated as directional signals, not precise numbers.',
    ],
    warnings: [
      'ARIMA is a univariate model — it does not account for future macro shocks. Use the Stress Tester to model the impact of a known upcoming event.',
    ],
  },
  {
    id: 'stress-tester',
    title: 'Stress Tester',
    description: 'Apply calibrated crisis scenarios and see projected KPI impacts.',
    iconName: 'FlaskConical',
    steps: [
      {
        heading: 'Choose a scenario',
        detail: 'Select from the scenario library (e.g., S01 — Cedi Devaluation, S03 — MoMo E-Levy Increase, S06 — Major Cyber Breach). Each scenario has a Pillar classification, severity rating (1–5), and historical calibration anchor.',
      },
      {
        heading: 'Set severity',
        detail: 'The Severity Multiplier slider scales all impact values. At 1.0×, you see the historically calibrated scenario. At 2.0×, every KPI impact is doubled. Use higher values to explore tail-risk territory.',
      },
      {
        heading: 'Apply macro overlays',
        detail: 'Overlay additional macro shocks: Cedi depreciation (%), inflation surge (pp), or policy rate change (pp). These compound on top of the scenario impacts to model "perfect storm" conditions.',
      },
      {
        heading: 'Read the waterfall chart',
        detail: 'The SHAP waterfall chart decomposes the KPI change into its contributing business drivers — showing which factor is responsible for the most impact. Longer bars = higher contribution.',
      },
      {
        heading: 'Generate a Board Brief',
        detail: 'Once results are computed, click "Generate Board Brief" to produce an executive narrative report with recommended actions and key entity context.',
      },
    ],
    tips: [
      'Start at 1.0× severity to understand the baseline calibrated risk, then escalate to identify the tipping point.',
      'The "Plausibility" score (1–5) on each scenario reflects the risk team\'s view of how likely the event is over a 12-month horizon.',
    ],
    warnings: [
      'Very high severity multipliers (>3×) produce outputs that go beyond historical precedent — treat these as tail-risk exploration, not planning assumptions.',
    ],
  },
  {
    id: 'monte-carlo',
    title: 'Monte Carlo Simulation',
    description: 'Stochastic simulation producing probability distributions rather than single-point outcomes.',
    iconName: 'Dices',
    steps: [
      {
        heading: 'Select a scenario',
        detail: 'Choose the stress scenario to simulate. The engine will randomly perturb this scenario\'s KPI impact values across all simulation runs.',
      },
      {
        heading: 'Choose simulation count',
        detail: '200 runs is quick for exploration. 1,000 is the recommended balance of accuracy and speed. 2,000 produces the smoothest percentile distributions for final reporting.',
      },
      {
        heading: 'Set the uncertainty band',
        detail: 'Controls how wide the Gaussian noise distribution is. ±10% means each impact value can vary by up to ±10% from its calibrated level per simulation run. Use wider bands when scenario calibration confidence is low.',
      },
      {
        heading: 'Read the risk summary',
        detail: 'After running, the summary shows how many KPIs are Critical, Warning, Watch, or Resilient at the P05 level. The "Most Exposed" panel highlights the single highest-risk KPI.',
      },
      {
        heading: 'Expand KPI distributions',
        detail: 'Click any KPI row to expand its full distribution bar, percentile table (P05/P25/P50/P75/P95), and interpretive narrative explaining what the numbers mean in plain English.',
      },
    ],
    tips: [
      'Run the same scenario at ±10% and ±30% uncertainty to see how sensitive the conclusions are to your parameter assumptions.',
      'P05 is your primary planning metric. If P05 for a critical KPI crosses its warning threshold, the scenario is a material risk even in conservative simulations.',
    ],
  },
  {
    id: 'compare',
    title: 'Scenario Compare',
    description: 'Side-by-side analysis of two scenarios to identify the more dangerous threat.',
    iconName: 'GitCompare',
    steps: [
      {
        heading: 'Select Scenario A and B',
        detail: 'Click each dropdown panel to open the scenario picker. Choose one scenario per slot. The engine runs both at 1.0× severity automatically.',
      },
      {
        heading: 'Read the delta bars',
        detail: 'The horizontal comparison bars show the KPI delta (% change from base) for each scenario side-by-side. Longer red bars = more severe.',
      },
      {
        heading: 'Check the Worse-Of column',
        detail: 'The comparison table highlights in red which scenario is more damaging for each individual KPI. Use this to identify which risk takes priority in your capital buffer planning.',
      },
      {
        heading: 'Generate a Comparative Brief',
        detail: 'Click the Generate Comparative Brief button to produce an executive narrative that synthesises both scenarios, compares total impact, and recommends a prioritisation.',
      },
    ],
    tips: [
      'Compare scenarios from different pillars (e.g., Macro vs Regulatory) to see which risk category poses the greater structural threat.',
    ],
  },
  {
    id: 'reverse',
    title: 'Reverse Stress Testing',
    description: 'Start from a failure outcome and find what causes it.',
    iconName: 'ActivitySquare',
    steps: [
      {
        heading: 'Define the failure outcome',
        detail: 'In the Target Builder, choose: which KPI, the operator (drops by / rises above / less than / greater than), and the threshold value. Example: "Service Revenue drops by 15%".',
      },
      {
        heading: 'Run Single Scenario mode',
        detail: 'If you have a specific scenario in mind, the engine uses binary search to find the exact Severity Multiplier that would cause the breach. The trajectory chart shows each iteration of the search.',
      },
      {
        heading: 'Run Cross-Scenario Sweep',
        detail: 'Without specifying a scenario, the engine tests your failure target against every scenario in the library simultaneously. Results are ranked from most dangerous (lowest multiplier needed to breach) to least dangerous.',
      },
      {
        heading: 'Use results for capital planning',
        detail: 'The required severity multiplier tells you how far removed you are from failure. A multiplier < 1.5 means the scenario at base calibration is already close to breaching the threshold.',
      },
    ],
    warnings: [
      'If no scenario can reach the threshold even at 5× severity, the target may be set too conservatively or the scenario may not impact that KPI directly.',
    ],
  },
  {
    id: 'daily-intelligence',
    title: 'Daily Briefing & News Intelligence',
    description: 'Review automatically collected news and its relevance to MTN Ghana.',
    iconName: 'ActivitySquare',
    steps: [
      {
        heading: 'Confirm the automatic schedule',
        detail: 'Open Settings and locate Automatic News Scraper. Scheduled means the background job is active; Next run shows when the next 15-minute cycle will start.',
      },
      {
        heading: 'Read the Daily Briefing',
        detail: 'Daily Briefing groups recent risk-scored articles by category, highlights alert tiers and estimated impact, and provides links to the original publishers.',
      },
      {
        heading: 'Use the Ghana coverage card',
        detail: 'Select the Ghana card near the top of Daily Briefing to open the Ghana Macro Dashboard and compare news risk with the latest annual macro context.',
      },
      {
        heading: 'Trigger a manual scrape only when needed',
        detail: 'The News page can request a scrape immediately. A result of 0 new articles means either all fetched URLs already exist or no feed returned usable entries; check Settings and backend logs if the last scraped timestamp is stale.',
      },
    ],
    tips: [
      'Nairametrics is retained only when an article contains a concrete MTN, Ghana, telecom, mobile-money, fintech, spectrum, network, or cybersecurity signal.',
      'The published date belongs to the news source; the scraped date records when Quantrisk first stored the article.',
    ],
  },
  {
    id: 'ghana-macro',
    title: 'Ghana Macro Dashboard',
    description: 'Interpret Ghana annual macro indicators and their risk ratings.',
    iconName: 'Database',
    steps: [
      {
        heading: 'Check each observation year',
        detail: 'Each card displays its own latest year because World Bank indicators are released on different schedules. The values are annual observations, not intraday market data.',
      },
      {
        heading: 'Read the risk banner',
        detail: 'Inflation, Growth, and FX badges translate the latest observations and year-on-year FX movement into Normal, Watch, Warning, or Critical context.',
      },
      {
        heading: 'Use Refresh for a fresh upstream request',
        detail: 'Refresh bypasses the six-hour server cache and requests the World Bank API again. If the upstream request completely fails, Quantrisk preserves the last useful cached response.',
      },
      {
        heading: 'Interpret debt service correctly',
        detail: 'PPG Debt Service / GNI measures annual public and publicly guaranteed external-debt service relative to gross national income. It replaces the unavailable Ghana central-government-debt/GDP World Bank series.',
      },
    ],
  },
  {
    id: 'authentication',
    title: 'Login & Session Security',
    description: 'Sign in securely and troubleshoot authentication configuration.',
    iconName: 'Settings',
    steps: [
      {
        heading: 'Use an approved account',
        detail: 'Enter the email address and password of a user created in Supabase Authentication. Database connection credentials are not application login credentials.',
      },
      {
        heading: 'Confirm frontend configuration',
        detail: 'The frontend requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local. Restart or rebuild the frontend after changing them.',
      },
      {
        heading: 'Understand protected routes',
        detail: 'Pages such as Dashboard, Daily Briefing, Ghana Macro, and Settings require an active session. Unauthenticated requests are redirected to Login and return to the intended page after successful sign-in.',
      },
    ],
    warnings: [
      'Never place the Supabase database password or service-role key in a NEXT_PUBLIC environment variable.',
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Data Pipeline',
    description: 'Manage data uploads, pipeline health, and model retraining.',
    iconName: 'Settings',
    steps: [
      {
        heading: 'Check pipeline health',
        detail: 'The Pipeline Health panel shows structured-data and ML status with latency readings. Automatic News Scraper separately shows whether the 15-minute job is scheduled and its next run time.',
      },
      {
        heading: 'Upload a CSV',
        detail: 'Use the Upload Zone to upload a new base-case CSV file. The file must include KPI_ID and FY25_Base_Value columns. On success, the platform re-reads the base case and invalidates all caches.',
      },
      {
        heading: 'Upload a PDF annual report',
        detail: 'Upload an MTN Ghana annual report PDF. The engine extracts KPI candidates using pdfplumber. If an Anthropic API key is configured, Claude maps them to KPI IDs with confidence scores. Review and apply selected candidates.',
      },
      {
        heading: 'Retrain ML models',
        detail: 'After uploading new data, click Retrain XGBoost Models to refit all six models on the updated dataset. Training takes 30–120 seconds. Results (MAE, R²) are shown after completion.',
      },
    ],
    tips: [
      'Always check Pipeline Health before running a simulation or forecast — a "Failed" data source will produce stale or incorrect outputs.',
      'After retraining, validate model quality by checking the R² scores. Values above 0.7 are acceptable; below 0.5 means the model needs more training data.',
    ],
  },
];

// ─── Q&A ────────────────────────────────────────────────────────────────────

export const QNA_CATEGORIES: QnACategory[] = [
  {
    id: 'general',
    label: 'General Platform',
    iconName: 'HelpCircle',
    items: [
      {
        question: 'What is MTN QuantRisk Intelligence Platform?',
        answer: 'MTN QuantRisk is an AI-powered quantitative risk dashboard built specifically for MTN Ghana. It combines real financial data, calibrated stress scenarios, machine learning forecasts, and stochastic simulation to give the risk and finance team a single unified view of MTN\'s exposure to macro, regulatory, operational, and competitive risks.',
      },
      {
        question: 'Who is this platform designed for?',
        answer: 'The platform serves three main audiences: the Risk & Finance team (daily monitoring and scenario analysis), senior management (scenario briefings and forward projections), and board members (executive summary briefs and key risk narratives). The interface is designed so non-technical users can interpret results without statistical training.',
      },
      {
        question: 'How often is the data updated?',
        answer: 'News is scraped when the backend starts and every 15 minutes afterward. Base-case KPI values change when an authorised user uploads new CSV or PDF data. Forecasts use the latest loaded base case. Ghana Macro observations come from the World Bank, are cached for six hours, and are generally updated annually by the source.',
      },
      {
        question: 'Is the data real or simulated?',
        answer: 'The structural data (KPI definitions, thresholds, scenario library) is based on MTN Ghana\'s actual financial framework. The base-case KPI values are calibrated to FY2025 estimates. Monte Carlo and forecast outputs are computed by models — they are projections, not guaranteed outcomes.',
      },
      {
        question: 'How do I navigate between modules?',
        answer: 'Use the left sidebar. Core contains anchors and trend views; Intelligence contains Forecasts, Board Briefs, Ghana Macro, Daily Briefing, News and Alerts; Advanced Modeling contains Stress Tester, Scenario Compare, Reverse Stress and Monte Carlo. The Ghana card on Daily Briefing also links directly to Ghana Macro.',
      },
      {
        question: 'Can I export results as a PDF?',
        answer: 'Yes. On the Scenario Compare page, use the "Print to PDF" button in the top right. Board Briefs can be exported from the Briefs page. For other pages, use your browser\'s native print function (Ctrl+P / Cmd+P) and select "Save as PDF".',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data & KPIs',
    iconName: 'Database',
    items: [
      {
        question: 'What is the difference between a KPI and a KRI?',
        answer: 'A KPI (Key Performance Indicator) measures current or past business performance — e.g., "Service Revenue was GHS 24,400M in FY25." A KRI (Key Risk Indicator) is a forward-looking signal that warns of rising risk before it becomes a performance problem — e.g., "Cedi/USD above 13.0 is a warning that revenue in USD terms is deteriorating."',
      },
      {
        question: 'What does the Warning or Critical status mean?',
        answer: 'Each KPI has two thresholds set by the risk team. Warning means the KPI has crossed the first boundary — elevated risk, heightened monitoring required. Critical means the second boundary has been breached — immediate escalation, executive notification, and potentially a risk committee response. For External KPIs (Inflation, Policy Rate, Cedi/USD), the logic is inverted: higher values are worse.',
        example: 'FIN03 EBITDA Margin: Warning below 58%, Critical below 55%. EXT01 Inflation: Warning above 15%, Critical above 25%.',
      },
      {
        question: 'What is the "base case"?',
        answer: 'The base case is the set of current FY2025 reference values for all 14 KPIs, loaded from data/structured/base_case.csv. It represents the "starting point" before any stress is applied. Every stressed KPI output in the platform is expressed as a deviation from this baseline.',
      },
      {
        question: 'What are the 14 tracked KPIs?',
        answer: 'Financial: FIN01 Service Revenue (GHSm), FIN02 EBITDA (GHSm), FIN03 EBITDA Margin (%), FIN04 PAT (GHSm), FIN05 PAT Margin (%), FIN06 Revenue Growth YoY (%). Segment: SEG01 Data Revenue (GHSm), SEG03 MoMo Revenue (GHSm). Operational: OPS01 Total Subscribers (M), OPS04 ARPU (GHS), OPS07 4G Coverage (%). External: EXT01 Inflation (%), EXT02 BoG Policy Rate (%), EXT03 Cedi/USD.',
      },
      {
        question: 'Why do some KPIs show "Watch" and others show "Safe" even during the same stress scenario?',
        answer: 'Different KPIs have different sensitivities to different scenarios. For example, a Cedi Devaluation scenario strongly impacts FIN01 (Service Revenue in USD terms) and OPS04 (ARPU), but has minimal direct effect on OPS07 (4G Coverage). The Stress Tester shows you the exact impact on every KPI simultaneously so you can see which are most exposed.',
      },
      {
        question: 'How do I update the base-case KPI values?',
        answer: 'Go to Settings → Upload Zone. Upload a CSV with at minimum two columns: KPI_ID and FY25_Base_Value. Accepted KPI IDs are FIN01–FIN06, SEG01, SEG03, OPS01, OPS04, OPS07, EXT01, EXT02, EXT03. After upload, all caches are cleared and the new values take effect immediately.',
      },
    ],
  },
  {
    id: 'scenarios',
    label: 'Scenarios & Stress Testing',
    iconName: 'FlaskConical',
    items: [
      {
        question: 'What is a stress scenario?',
        answer: 'A stress scenario describes a specific adverse event — such as a 25% Cedi devaluation, a 1.5% MoMo e-levy increase, or a major cyber breach — with calibrated impact values for each affected KPI. The scenario engine applies these impacts to the base case to compute what MTN\'s financials would look like under that event.',
      },
      {
        question: 'What does the Severity Multiplier do exactly?',
        answer: 'It scales every KPI impact value in the scenario by the chosen multiplier. A 15% revenue impact at 1.0× becomes a 30% impact at 2.0×. Use it to explore how the risk changes as the event becomes more or less severe than its historical calibration.',
        example: 'S01 Cedi Devaluation at 1.0× models a 25% devaluation. At 2.0×, it models a 50% devaluation — closer to the 2022 crisis level.',
      },
      {
        question: 'What are the risk Pillars?',
        answer: 'Pillars classify scenarios by the type of risk driver. A = Macro & FX (exchange rate, inflation, policy rate), B = Regulatory (NCA penalties, e-levy, spectrum policy), C = Tech & Cyber (outages, data breaches, infrastructure failure), D = Competitive (subscriber loss, price war), E = Operational & Climate (natural disaster, supply chain), F = Upside (growth opportunities), G = Tail Risk (combined catastrophic events).',
      },
      {
        question: 'What is the difference between Stress, Shock, Combined, and Upside scenario types?',
        answer: '"Stress" scenarios model slow-building adverse trends (e.g., 12-month inflationary pressure). "Shock" scenarios model sudden, sharp events (e.g., an overnight 20% Cedi move). "Combined" scenarios stack multiple risk factors simultaneously. "Upside" scenarios model positive surprises — useful for capital allocation and opportunity planning.',
      },
      {
        question: 'What is a calibration anchor?',
        answer: 'The historical event or empirical study used to set the scenario\'s impact values. For example, the Cedi Devaluation scenario is calibrated against the 2022 Cedi crisis, where a 55% devaluation was observed. The calibration anchor gives the scenario statistical credibility.',
      },
      {
        question: 'What are Macro Overlays?',
        answer: 'Macro Overlays let you compound additional macroeconomic shocks on top of an existing scenario. The three overlays are: Cedi Shock Pct (additional % devaluation), Inflation Overlay (additional percentage points of inflation), and Policy Rate Overlay (additional pp rise in BoG rate). These interact multiplicatively with the scenario\'s base impacts.',
        example: 'Running a Cyber Breach scenario (Pillar C) + 20% Cedi Overlay models the realistic risk that a security incident triggers investor flight and FX depreciation simultaneously.',
      },
      {
        question: 'How do I create a new scenario?',
        answer: 'On the Stress Tester page, click "New Scenario" to open the Scenario Form Modal. Fill in the name, pillar, type, severity, plausibility, description, and add KPI impacts with their type (pct/delta/abs) and value. The new scenario is saved to the scenario library immediately.',
      },
      {
        question: 'What does SHAP show in the waterfall chart?',
        answer: 'The SHAP waterfall breaks down the KPI\'s movement from base to stressed value into individual contributor bars. Each bar represents one business driver — for example, "Inflation_YoY_Pct contributed −2.3% to EBITDA Margin." Positive bars push the KPI up; negative bars push it down. The total equals the overall KPI change.',
      },
    ],
  },
  {
    id: 'montecarlo',
    label: 'Monte Carlo',
    iconName: 'Dices',
    items: [
      {
        question: 'Why use Monte Carlo instead of the regular Stress Tester?',
        answer: 'The Stress Tester gives you a single deterministic outcome: "Under this scenario, Service Revenue falls 8.3%." Monte Carlo gives you a distribution: "In the worst 5% of possible outcomes, it falls more than 12%. In the best 5%, it actually rises 3%." The distribution tells you how confident you should be in any single estimate.',
      },
      {
        question: 'What is the uncertainty band?',
        answer: 'It controls the Gaussian noise added to each impact value per simulation. At ±10%, each impact is sampled from a normal distribution with standard deviation equal to 10% of the impact value. A wider band reflects more uncertainty in the scenario calibration itself — e.g., if you are not confident that the Cedi impact is exactly −15% and could be anywhere from −5% to −25%, set a wide band.',
      },
      {
        question: 'How should I choose how many simulations to run?',
        answer: '200 simulations: fast, good for quick exploration and directional insight. 500: reasonable accuracy for most decisions. 1,000: recommended for reporting and board presentations. 2,000: smoothest distributions, lowest statistical noise — use for final risk quantification reports.',
      },
      {
        question: 'What does P05 mean for planning purposes?',
        answer: 'P05 is your "stress floor" — the value that only 5% of simulated outcomes fall below. For capital planning, it answers the question: "What is the worst we should prudently plan for?" A P05 below a KPI\'s Critical threshold indicates that under this scenario, severe outcomes are statistically plausible and warrant capital buffer allocation.',
        example: 'If FIN03 EBITDA Margin has a P05 of 55.2% and its Critical threshold is 55%, the scenario has a ~5% simulated probability of breaching Critical status.',
      },
      {
        question: 'What does "Most Exposed KPI" mean in the summary?',
        answer: 'After running the simulation, the platform ranks all 14 KPIs by their P05 percentage deviation from base. The "Most Exposed" KPI is the one with the largest adverse P05 deviation — meaning it is most sensitive to this scenario under stochastic conditions. This is your top priority risk under the given stress event.',
      },
      {
        question: 'Can I reproduce the same simulation results?',
        answer: 'Monte Carlo uses a random number generator. Without a fixed seed, each run produces slightly different results. For reproducibility in formal risk reports, contact the development team to enable seed-based runs via the API (/api/monte-carlo with a seed parameter).',
      },
    ],
  },
  {
    id: 'forecasts',
    label: 'Forecasts',
    iconName: 'LineChart',
    items: [
      {
        question: 'How are the forecasts generated?',
        answer: 'FIN01 (Service Revenue) uses a trained ARIMA model fitted on quarterly historical data. The model captures revenue trend and momentum to project 90 days forward. All other KPIs currently use a calibrated random-walk model (which adds realistic drift and volatility around the base value) until additional model training data is available.',
      },
      {
        question: 'How accurate are the 90-day forecasts?',
        answer: 'The ARIMA model for FIN01 is evaluated using Leave-One-Out cross-validation — the published MAE and R² in Settings reflect true out-of-sample accuracy. For the random-walk models, treat the output as an uncertainty range rather than a precise prediction. Forecast accuracy degrades beyond 30 days for all KPIs.',
      },
      {
        question: 'Why is the confidence band very wide?',
        answer: 'A wide band is statistically honest — it reflects genuine uncertainty in the outlook. Factors like upcoming elections, commodity price moves, or NCA decisions are not observable in the model inputs but would significantly affect the actual outcome. The band says "we are 90% confident the true value will fall within this range."',
      },
      {
        question: 'Can I see forecasts for all 14 KPIs?',
        answer: 'Yes — use the KPI selector dropdown on the Forecasts page to switch between any of the 14 tracked KPIs. Note that non-FIN01 KPIs use the random-walk model until XGBoost-based forecast models are trained on additional historical quarterly data.',
      },
      {
        question: 'How does the forecast differ from the Stress Tester output?',
        answer: 'The forecast models the unconditional future trajectory based on historical patterns — "what happens if current trends continue." The Stress Tester models a conditional scenario — "what happens if this specific event occurs." Use forecasts for baseline planning, Stress Tester for event-driven risk assessment.',
      },
    ],
  },
  {
    id: 'reverse',
    label: 'Reverse Stress',
    iconName: 'ActivitySquare',
    items: [
      {
        question: 'What is reverse stress testing and why does it matter?',
        answer: 'Reverse stress testing is a regulatory best practice (required under Basel frameworks and increasingly under African central bank guidelines). Instead of asking "what happens if this scenario occurs?", it asks "what scenario would break us?" It forces identification of vulnerabilities that traditional forward-looking stress tests might miss.',
      },
      {
        question: 'What is the binary search trajectory?',
        answer: 'When you run a single-scenario reverse stress test, the engine finds the minimum severity multiplier that breaches your target using binary search. It starts at 1.0×, tests if the KPI breaches, then adjusts up or down iteratively until it converges on the exact multiplier — typically within 10–15 iterations. The trajectory chart shows each step.',
        example: 'Finding that it takes 2.3× severity to push EBITDA Margin below 58% tells you the scenario has a safety margin of 1.3× before reaching Warning — a quantified buffer.',
      },
      {
        question: 'What does the Cross-Scenario Sweep tell me?',
        answer: 'It runs the binary search across every scenario in the library against your chosen failure target, and ranks them from most dangerous (lowest multiplier needed) to least dangerous. The scenario at the top of the list is your most proximate risk — the one that could breach your threshold with the least severity amplification.',
      },
      {
        question: 'What if no scenario can reach the target threshold?',
        answer: 'If all scenarios require a severity multiplier above 5× to breach your target, it means your chosen KPI is resilient to the current scenario library under that threshold. Consider: (1) lowering the threshold, (2) looking at Combined-type scenarios, or (3) flagging the target as a robustly defended position in your risk report.',
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'News & Macro Intelligence',
    iconName: 'ActivitySquare',
    items: [
      {
        question: 'How often does Quantrisk scrape news?',
        answer: 'The backend schedules one scrape immediately after startup and another every 15 minutes. The job runs in the background, prevents overlapping executions, and coalesces missed runs. Settings shows whether it is scheduled and the next run time.',
      },
      {
        question: 'Why does a manual scrape say 0 new articles?',
        answer: 'The number counts newly stored URLs, not all fetched feed entries. Zero is normal when every fetched URL is already in the database. If the newest scraped timestamp is also stale, check Automatic News Scraper in Settings and backend logs for DNS, socket, timeout, or malformed-feed errors.',
      },
      {
        question: 'Does every Nairametrics article affect MTN Ghana?',
        answer: 'No. Quantrisk rejects Nairametrics articles before storage unless their title or body contains a concrete MTN, Ghana, telecom, mobile-network, mobile-money, fintech, 5G, spectrum, digital-payment, or cybersecurity signal.',
      },
      {
        question: 'What is the difference between published time and scraped time?',
        answer: 'Published time is supplied by the news publisher. Scraped time is when Quantrisk first stored that URL. Deduplication means an existing article is not stored again on every 15-minute cycle.',
      },
      {
        question: 'Is the Ghana Macro Dashboard real-time?',
        answer: 'No. It displays the latest annual World Bank observations and shows the observation year on every card. Refresh forces a new World Bank request but cannot create a newer observation than the source has published.',
      },
      {
        question: 'Why does the dashboard show PPG Debt Service instead of public debt to GDP?',
        answer: 'The World Bank central-government-debt/GDP series has no Ghana observations. Quantrisk therefore uses the available public and publicly guaranteed external-debt-service series, shown as a percentage of GNI.',
      },
      {
        question: 'How are the Inflation, Growth and FX risk badges calculated?',
        answer: 'Inflation and GDP growth use transparent threshold rules against their latest values. FX risk uses the percentage change between the two latest annual GHS/USD observations. These badges provide screening context rather than real-time market advice.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical & Troubleshooting',
    iconName: 'Settings',
    items: [
      {
        question: 'The page shows "Simulation failed" — what do I do?',
        answer: 'This usually means the backend API is not running. Open a terminal, navigate to the mtn_quantrisk/ directory, and run: bash start_backend.sh. Then refresh the page. If the error persists, check that the scenario ID exists in data/structured/scenario_library.csv.',
      },
      {
        question: 'The login page is not working — nothing happens when I click Submit.',
        answer: 'Confirm that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY exist in frontend/.env.local, then restart the frontend. Verify that the user exists in Supabase Authentication and is using an email/password login, not the PostgreSQL database password. Development WebSocket warnings concern hot reload and do not validate credentials.',
      },
      {
        question: 'How do I create or approve a user account?',
        answer: 'Create the user in Supabase Dashboard under Authentication → Users, or use an approved organisational invitation flow. The application intentionally has no public self-registration screen. The user then signs in with that email and password.',
      },
      {
        question: 'The scraper is scheduled but articles are stale. What should I check?',
        answer: 'Scheduled confirms the timer exists, not that publishers are reachable. Trigger one manual scrape and inspect backend logs. Socket or DNS errors mean the backend lacks outbound internet access; malformed-feed warnings affect only that publisher. Confirm the backend stays running between 15-minute intervals.',
      },
      {
        question: 'How do I start the backend server?',
        answer: 'Open Git Bash or any terminal, navigate to mtn_quantrisk/, and run: bash start_backend.sh. The server starts at http://127.0.0.1:8001. You can verify it is running by opening http://127.0.0.1:8001/docs in your browser to see the full API documentation.',
      },
      {
        question: 'How do I start the frontend?',
        answer: 'Open a second terminal window, navigate to mtn_quantrisk/frontend/, and run: npm run dev. The app starts at http://localhost:3000. Both the frontend and backend must be running simultaneously for the live API features to work.',
      },
      {
        question: 'The pipeline health shows "Failed" for ML Models — how do I fix it?',
        answer: 'The ML model artefacts are missing from models/artefacts/. Run the training script: python models/train_impact_model.py. This creates the .joblib files needed. If training data is missing, first run the data pipeline to generate data/structured/ CSV files, then retrain.',
      },
      {
        question: 'The PDF upload is not extracting KPI values — what is wrong?',
        answer: 'PDF extraction requires pdfplumber to be installed (pip install pdfplumber). For AI-enhanced extraction with confidence scoring, set the ANTHROPIC_API_KEY environment variable before starting the backend. Without the API key, the system falls back to raw table extraction which may produce lower confidence matches.',
      },
      {
        question: 'How do I retrain the ML models after uploading new data?',
        answer: 'Option 1 (UI): Go to Settings → click "Retrain XGBoost Models" button. The API runs the training script and returns MAE and R² scores. Option 2 (terminal): Run python models/train_impact_model.py from the project root. Option 3 (API): POST to http://127.0.0.1:8001/api/retrain.',
      },
      {
        question: 'The forecast for a KPI looks flat and unrealistic — is something broken?',
        answer: 'Only FIN01 (Service Revenue) has a trained ARIMA model. All other KPIs use a random-walk baseline which drifts from the current base value. This is expected behaviour — it is a placeholder until per-KPI forecast models are trained on additional historical data. The flat appearance means the model has very low drift variance.',
      },
    ],
  },
];
