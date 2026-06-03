# MTN QuantRisk Intelligence Platform
## Master Execution Plan - v3.0

**Team:** Foureira · Chidima · Emmanuel · Daasebre
**Timeline:** 6 Weeks - May 18 to June 29, 2026
**Hard Milestones:** Platform v1.0 live → June 15 · Full delivery → June 29
**Scope:** Tabs 04, 05, and 06 of the KRI Dashboard - Scenario Modelling, Base vs Scenario Comparison, and Reverse Stress Testing - backed by a self-updating PDF pipeline, trained predictive models, and 56 calibrated scenarios purpose-built for MTN Ghana.

---

## What We're Building

The existing KRI dashboard already handles historical reporting (Tabs 01–03). Our work is everything that comes after: the analytical engine that stress-tests the business, forecasts where it's headed, and tells management exactly how bad things would need to get before a threshold is breached.

In concrete terms, that means three tabs and the entire infrastructure behind them:

**Tab 04 - Scenario Modelling** lets a user pick any of 56 scenarios, dial up the severity, overlay live macro assumptions, and instantly see how every key KPI responds. An AI explanation layer (powered by SHAP values) surfaces the dominant driver behind each outcome in plain English.

**Tab 05 - Base vs Scenario Comparison** sits alongside. Once a scenario is run, this tab renders the full before-and-after across every financial and operational KPI - grouped bar charts, a colour-coded delta table, and an LLM-generated board brief that turns the numbers into a paragraph a CFO can act on.

**Tab 06 - Reverse Stress Testing** inverts the logic entirely. Instead of asking "what happens if X occurs?", it asks "how bad does X need to get before we breach our floor?" The engine searches all 56 scenarios simultaneously, ranks them by how dangerous each one is to a chosen KPI, and renders the result as a breach-severity heatmap. This is the output that impresses a board.

Everything runs on a live data pipeline. When MTN or the Bank of Ghana publish new PDFs, the platform ingests them automatically, updates the base case, and recalculates all scenario impacts - no manual data entry, ever.

---

## Team Roles

| Person | Role | Primary Ownership |
|--------|------|-------------------|
| **Foureira** | Scenario Architect & Risk Modeller | All 56 scenarios, reverse stress engine, base case calibration, scenario methodology |
| **Chidima** | ML Engineer | XGBoost impact models, LSTM forecaster, SHAP explainability, Monte Carlo simulation |
| **Emmanuel** | Data & Pipeline Engineer | PDF-to-CSV pipeline, source downloaders, FastAPI data layer, Celery scheduler |
| **Daasebre** | Frontend & Visualisation | React dashboard (Tabs 04–06), scenario UI, charts, LLM narrative integration |

All four review each other's work every Friday. Every pull request requires one reviewer from outside the owning role. No one merges their own work.

---

## How Impact Values Are Derived

Every scenario in this library is anchored to two historical reference points from MTN Ghana's own record. These are not benchmarks borrowed from generic telecom indices - they are events that actually happened to this business.

**Reference A - FY22 Crisis.** The Cedi lost 50% against the USD. Inflation hit 54%. Despite this, MTN Ghana's service revenue grew 44% in nominal terms, and EBITDA margin compressed by only 0.2pp because aggressive tariff repricing offset most of the cost inflation. The lesson: the business is resilient, but not immune. Nominal revenue can grow while real performance deteriorates sharply.

**Reference B - FY25 Tailwind.** The Cedi appreciated 21.6%. Inflation collapsed from 23.8% to 5.4%. EBITDA margin expanded 3pp to 60.1%, and revenue grew 36.2%. Yet MoMo revenue fell 7.5% despite all of this - proving that regulatory headwinds can dominate fintech outcomes entirely independently of the macro environment.

Every impact multiplier in the scenarios below is cross-validated against these two anchors. A scenario cannot claim a worse margin outcome than what actually occurred in FY22 unless it is explicitly classified as Severity 5 or a compound tail event.

The base case used throughout is FY25: Service Revenue GHS 24,400m, EBITDA Margin 60.1%, MoMo Revenue GHS 6,000m, ARPU GHS 66.9.

---

## The 56-Scenario Library

The library spans seven thematic pillars. Scenarios S01–S14 existed in the original framework and are retained. S15–S56 are new, each fully calibrated to the FY25 base case.

---

### Pillar A - Macroeconomic & FX
*13 scenarios · Owner: Foureira*

Ghana's macro volatility is the single largest external driver of MTN Ghana's reported financials, both through Cedi/USD translation and through inflation's effect on consumer purchasing power and operational costs.

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S01 | Stress | Cedi devaluation -25% | 4 | 3 | Rev −8%, EBITDA −12%, ARPU -15% |
| S02 | Stress | Inflation resurgence to 25% | 3 | 3 | EBITDA margin -3pp, Opex +18% |
| S11 | Combined | Ghana macro reversal | 5 | 3 | Rev −10%, Margin -4pp, Subs −2.5% |
| S15 | Stress | Cedi devaluation −40% (severe) | 5 | 2 | Rev −14%, EBITDA −20%, ARPU −25%, Capex −25% |
| S16 | Stress | Hyperinflation return - 50%+ | 5 | 2 | Opex +35%, EBITDA margin −6pp, Subs −4%, real ARPU collapse |
| S17 | Stress | BoG emergency rate hike to 35% | 4 | 2 | Capex financing cost +40%, working capital days +20, dividend cut −60% |
| S18 | Stress | Ghana sovereign downgrade to junk | 4 | 2 | FX repatriation freeze, dividend blocked, country risk premium +500bps |
| S19 | Upside | Cedi appreciation +30% | 3 | 3 | Rev +10%, EBITDA margin +3pp, USD-denominated opex relief |
| S20 | Stress | IMF programme conditionality tightening | 3 | 3 | Fiscal consolidation, tariff freeze risk, consumer spending −5% |
| S21 | Stress | Cocoa/commodity crash - Ghana fiscal squeeze | 3 | 3 | GDP −2pp, govt spending cuts, MoMo volumes −8% |
| S22 | Stress | Oil price spike - pass-through inflation | 3 | 3 | Diesel cost +40%, generator opex +30%, energy capex +15% |
| S23 | Shock | BoG FX intervention failure - disorderly devaluation | 5 | 2 | Cedi −35% in 30 days, capital flight, USD payables crisis |
| S24 | Combined | Stagflation trap - low growth, high inflation | 4 | 2 | GDP 1%, inflation 30%, real ARPU decline −20%, churn +3% |

---

### Pillar B - Regulatory & Government
*10 scenarios · Owner: Foureira*

Ghana's regulatory environment has been active and consequential. The NCA, BoG, and Parliament have each materially affected MTN Ghana's economics between 2020 and 2025 - through the e-levy, SIM re-registration, spectrum disputes, and the DDEP.

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S03 | Stress | MoMo regulatory tightening (e-levy to 1.5%) | 4 | 3 | MoMo Rev −25%, MoMo users −15% |
| S04 | Stress | Sovereign debt / repatriation freeze | 4 | 2 | Dividend −50%, working capital +15 days |
| S25 | Stress | NCA universal service levy increase | 3 | 3 | Opex +GHS 400m, margin −1.5pp |
| S26 | Stress | Spectrum refarming forced at cost | 3 | 3 | Capex +GHS 800m, 4G coverage disruption −2pp |
| S27 | Stress | Parliament introduces social tariff floor | 4 | 3 | ARPU cap enforced, revenue −6%, data repricing constrained |
| S28 | Stress | BoG mobile money interoperability mandate - fee compression | 4 | 4 | MoMo Rev −15%, transaction fee yield −30%, competitive moat eroded |
| S29 | Shock | NCA revokes or suspends operating licence (partial) | 5 | 1 | Revenue −30%, subscriber exodus, brand damage, Group write-down |
| S30 | Shock | Emergency SIM re-registration 2.0 - 6-month disruption | 4 | 3 | Active subscribers −8%, data subs -6%, MoMo users −10% |
| S31 | Stress | Data Protection Act fine - major enforcement action | 3 | 3 | Fine GHS 500m, compliance opex +GHS 200m, reputational damage |
| S32 | Combined | Regulatory storm - spectrum + e-levy + tariff cap simultaneously | 5 | 2 | Rev −15%, MoMo -30%, margin −5pp, capex +20% |

---

### Pillar C - Technology & Cybersecurity
*10 scenarios · Owners: Emmanuel (data feeds), Chidima (model integration)*

The CSA Ghana reported GHS 23.3m in cybercrime losses in 2024 and GHS 14.9m in just H1 2025. MTN MoMo is the primary attack surface. Network resilience is a concurrent risk given 8,650 sites and a 99.5% 4G coverage dependency.

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S06 | Shock | Major cyber breach - 5-day MoMo outage | 5 | 2 | MoMo Rev −12%, data failure +8pp NPS, EBITDA −3% |
| S07 | Shock | Spectrum licence dispute - 4G degradation | 4 | 2 | Coverage −2.5pp, data usage −15%, Rev −8% |
| S09 | Shock | Mass data privacy breach | 4 | 2 | MoMo users −5%, fine GHS 200m, opex +GHS 200m |
| S33 | Shock | Ransomware - core network 10-day outage | 5 | 1 | Rev −20% (quarter), subscribers −5%, cyber-insurance activation |
| S34 | Shock | MoMo platform vendor insolvency - migration forced | 4 | 2 | Capex +GHS 1.2bn emergency, MoMo outage 15 days, users −12% |
| S35 | Stress | 5G spectrum auction - MTN underbids, competitor wins | 3 | 3 | Competitive disadvantage, data share loss −3pp, capex reprieve |
| S36 | Shock | Subsea cable cut - international bandwidth crisis | 3 | 2 | Data quality degradation, enterprise revenue at risk −8%, roaming disruption |
| S37 | Stress | AI-driven fraud surge - MoMo fraud losses +500% | 4 | 3 | Fraud losses GHS 300m, MoMo trust erosion, users −8% |
| S38 | Shock | Critical infrastructure cyberattack - national grid + telecoms | 5 | 1 | Sites offline 20%, revenue −15%, emergency opex +25% |
| S39 | Stress | Network sharing agreement collapse - Telecel dispute | 3 | 3 | Capex +GHS 600m, coverage gaps in shared areas |

---

### Pillar D - Competitive & Market Structure
*8 scenarios · Owners: Daasebre (UI), Foureira (calibration)*

Ghana's telecom market is a three-player oligopoly. MTN holds approximately 55% market share, meaning competitive risk is asymmetric - there is far more to lose than to gain from a price war or new entrant.

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S10 | Shock | Competitive intensification - broad ARPU pressure | 4 | 3 | ARPU −12%, Rev −6%, Subs −2.5% |
| S40 | Stress | Telecel aggressive bundle reset | 3 | 4 | ARPU −8%, data share −2pp, CAC +20% |
| S41 | Shock | New MVNO entry - tech giant (Google/Amazon) | 4 | 2 | Data ARPU −15%, enterprise segment −10%, brand dilution |
| S42 | Stress | AT Ghana recapitalised - renewed competitive threat | 3 | 3 | Subs growth −3pp, churn +2%, CAC +15% |
| S43 | Stress | Price war - all operators cut data tariffs 40% | 4 | 3 | Revenue −12%, margin −4pp, volume partially offsets |
| S44 | Shock | Bank-led mobile wallet (GCB/Absa) captures MoMo share | 4 | 3 | MoMo users −15%, MoMo Rev −20%, transaction value −25% |
| S45 | Stress | WhatsApp/OTT substitution accelerates - voice collapse | 3 | 4 | Voice Rev −20%, SMS Rev −30%, data partially substitutes |
| S46 | Stress | Starlink Ghana expansion - rural broadband disruption | 3 | 3 | Rural data subs at risk −5%, ARPU pressure in high-value rural areas |

---

### Pillar E - Operational & Climate
*7 scenarios · Owners: Emmanuel (data feeds), Foureira (calibration)*

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S05 | Stress | Energy cost shock - ECG tariff +40% | 3 | 3 | Opex +12%, margin −2pp, coverage −0.5pp |
| S08 | Shock | Major flood - 300+ sites disrupted | 3 | 2 | Sites −300, capex +15%, Rev −2% |
| S47 | Stress | Nationwide ECG load-shedding Stage 6 sustained 6 months | 4 | 3 | Diesel opex +GHS 800m, site availability −3pp, margin −2.5pp |
| S48 | Shock | Accra earthquake - 500+ sites and HQ disruption | 5 | 1 | Sites −500, Rev −8% (quarter), BCM activation, emergency capex +25% |
| S49 | Stress | Supply chain disruption - tower equipment shortages | 3 | 3 | Capex efficiency −30%, rollout delay 2 quarters, coverage expansion paused |
| S50 | Shock | Key executive departure - CEO and CFO simultaneously | 3 | 2 | Investor confidence, share price −10%, strategy execution risk |
| S51 | Stress | Labour dispute - extended strike action | 3 | 2 | Opex +GHS 150m (overtime/contractors), customer service degradation |

---

### Pillar F - Upside & Opportunity
*4 scenarios · Owners: Foureira + Daasebre*

Most risk platforms only model downside. Modelling upside scenarios gives management the full picture for capital allocation. These also serve as useful calibration checks - if the scenario engine handles negative impact correctly, it should handle positive impact correctly too.

| ID | Type | Scenario | Upside | Plausibility | Key KPI Impacts |
|----|------|----------|:------:|:------------:|-----------------|
| S52 | Upside | 5G early mover - enterprise revenue surge | +3 | 3 | Enterprise Rev +25%, data ARPU +15%, capex +30% (investment mode) |
| S53 | Upside | MoMo lending / micro-insurance breakthrough | +4 | 3 | MoMo Rev +35%, digital Rev +80%, new fintech margin stream |
| S54 | Upside | Ghana GDP 8%+ super-cycle - commodity boom | +3 | 2 | Subs +5%, ARPU +10%, MoMo volumes +20% |
| S55 | Upside | Cedi appreciation +40% - USD opex relief | +4 | 2 | Margin +4pp, dividend upstreaming maximised, FX gain on net assets |

---

### Pillar G - Tail Risk & Existential
*4 scenarios · Owner: Foureira - Board-level scenarios*

These are low-probability, high-severity events. Their purpose is not prediction - it is to stress-test whether MTN Ghana's balance sheet survives intact under conditions that have actually occurred in comparable African markets.

| ID | Type | Scenario | Severity | Plausibility | Key KPI Impacts |
|----|------|----------|:--------:|:------------:|-----------------|
| S12 | Combined | Fintech disruption + regulatory pressure | 4 | 3 | MoMo −30%, Digital −25%, EBITDA −5.5% |
| S13 | Combined | Network crisis + climate compound | 5 | 2 | Sites −400, coverage −3pp, margin −3.5pp |
| S14 | Combined | Reverse-FY25 - all tailwinds vanish simultaneously | 5 | 3 | Rev −5%, margin −5pp, opex +20% |
| S56 | Combined | Perfect storm - macro + cyber + regulatory + climate | 5 | 1 | Rev −25%, margin −8pp, MoMo −40%, capex crisis, dividend suspended |

---

### Library Summary

| Pillar | Scenario IDs | Count |
|--------|-------------|-------|
| A - Macro & FX | S01, S02, S11, S15–S24 | 13 |
| B - Regulatory | S03, S04, S25–S32 | 10 |
| C - Technology & Cyber | S06, S07, S09, S33–S39 | 10 |
| D - Competitive | S10, S40–S46 | 8 |
| E - Operational & Climate | S05, S08, S47–S51 | 7 |
| F - Upside | S52–S55 | 4 |
| G - Tail Risk | S12, S13, S14, S56 | 4 |
| **Total** | **S01–S56** | **56** |

Type breakdown: 32 Stress · 14 Shock · 6 Combined · 4 Upside. Of the 56, 43 carry Severity ≥ 3, and 10 are Severity 5 events that directly test capital adequacy and covenant compliance.

---

## Week-by-Week Execution Plan

---

### Week 1 - May 18–24: Foundation

*Get the ground truth right before building anything on top of it.*

---

#### Foureira - Scenario Library Build

**Task 1.1 - Calibrate all 56 scenarios to the FY25 base case**

For each new scenario (S15–S56), identify the closest historical analogue in the 2020–2025 data and scale impact proportionally. The method for S15 (Cedi −40%) illustrates the approach:

S01 (Cedi −25%) produces Revenue −8%, implying an elasticity of approximately 0.32 per 1% Cedi move. S15 therefore produces Revenue ≈ −40 × 0.32 = −12.8%, rounded up to −14% after compounding effects. Cross-check: FY22's Cedi −50% produced nominal revenue growth of +44% because inflation offset drove tariff repricing - confirming the non-linear relationship at extreme devaluations and validating that the base elasticity understates tail risk.

Document every derivation in `scenario_calibration_notes.md`. This is the intellectual honesty audit trail that separates a serious risk model from a set of plausible-sounding guesses.

**Task 1.2 - Build the scenario library CSV**

Output: `data/structured/scenario_library.csv`

```
Scenario_ID, Pillar, Type, Scenario_Name, Description, Severity_1_5,
Plausibility_1_5, Recovery_Qtrs, KPI_ID, Impact_Type, Impact_Value,
Mitigation_Lever, Calibration_Source, Added_By, Date_Added
```

One row per KPI impact line. S56 will have 15–20 rows. The full CSV should contain approximately 400–500 rows covering all 56 scenarios and their impact vectors.

**Deliverable by Friday May 24:** `scenario_library.csv` with all 56 scenarios fully populated, committed to GitHub. Foureira presents a 10-minute walkthrough showing how three scenarios were calibrated.

---

#### Emmanuel - Pipeline Infrastructure

**Task 1.3 - Repository structure and Docker stack**

Set up the project repository with the following structure and bring up all services via `docker-compose.yml`:

```
mtn_quantrisk/
├── pipeline/
│   ├── downloader.py
│   ├── classifier.py
│   ├── extractor/
│   │   ├── tables.py
│   │   ├── narrative.py
│   │   └── ocr.py
│   ├── validator.py
│   ├── mapper.py
│   └── run_pipeline.py
├── api/
│   └── data_api.py
├── models/
│   ├── train_impact_model.py
│   └── artefacts/
├── data/
│   ├── raw_pdfs/
│   ├── extracted/
│   └── structured/
├── config/
│   └── sources.yaml
├── docker-compose.yml
└── requirements.txt
```

The Docker stack brings up FastAPI (port 8000), Redis (port 6379), a Celery worker, and Postgres (port 5432). A single `docker compose up` command should start everything.

**Task 1.4 - Source audit**

Manually download one PDF from each of the six configured sources (MTN Group FY24 annual results, MTN Group H1 2025, BoG Summary of Economic and Financial Data, BoG Quarterly Statistical Bulletin Q4 2025, NCA Quarterly Statistical Bulletin Q4 2024, MTN Ghana Scancom Opco filing). Run `pdfinfo` and `pdffonts` on each. Record in `data/source_audit.md`: page count, whether a text layer exists, approximate table count, and the key table pages identified by visual scan.

**Deliverable by Friday May 24:** Docker stack running cleanly in one command. Source audit committed. Six PDFs in `data/raw_pdfs/`.

---

#### Chidima - ML Architecture

**Task 1.5 - Export Excel KRI Framework to CSV**

Load the KRI Framework Excel workbook into Python and export all sheets as individual CSVs into `data/structured/`. The sheets to export are: Annual, HalfYearly, Quarterly, Segments_Annual, Segments_Quarterly, Operational_Annual, Operational_Quarterly, Leading_Indicators, Macro_Context, Derived_Ratios, Base Case, and KRI Register. These CSVs become the reference dataset that all models train on.

**Task 1.6 - Exploratory data analysis notebook**

Produce `notebooks/01_eda_feature_engineering.ipynb` covering: distribution plots for all six macro variables across 2020–2025, a correlation matrix of macro inputs against financial KPI outputs, lag analysis (does Q(t) inflation better predict Q(t) or Q(t+1) margin?), and identification of structural breaks in FY22 and FY25.

The key finding to document explicitly: because MTN reprices tariffs aggressively during inflation, nominal revenue can grow even when real conditions are dire. This means a model trained on nominal revenue growth will systematically understate macro sensitivity. All models should be trained on inflation-adjusted (real) revenue growth, not nominal.

**Deliverable by Friday May 24:** All CSVs exported and committed. EDA notebook committed with at least eight charts and a written interpretation section.

---

#### Daasebre - Dashboard Architecture

**Task 1.7 - Audit the existing HTML dashboard**

Open `MTN-Ghana-KRI-Dashboard.html` in a browser and document every tab's current state: what works, what is hardcoded versus dynamic, and specifically where Tab 04 is incomplete or non-functional. Produce `dashboard_audit.md` with a gap analysis.

**Task 1.8 - React project scaffold**

The HTML prototype will be replaced by a production React 18 application. Scaffold it, install dependencies (recharts, d3, axios, @tanstack/react-query, tailwindcss, lucide-react), and create six placeholder tab components. MTN brand colours: Yellow `#FFCB00`, Dark `#1A1A1A`, Light grey `#F5F5F5`.

The six tabs: `Tab01_KRIOverview.tsx`, `Tab02_Financial.tsx`, `Tab03_Operational.tsx`, `Tab04_ScenarioModeling.tsx`, `Tab05_BaseVsScenario.tsx`, `Tab06_ReverseStress.tsx`.

**Deliverable by Friday May 24:** React app running on `localhost:3000` with six tabs navigable. `dashboard_audit.md` committed.

---

#### Week 1 Team Sync - Friday May 24

45 minutes. Foureira walks through three scenario calibrations (10 min). Emmanuel does a live Docker demo - `docker compose up`, all services green (5 min). Chidima presents the correlation matrix and key EDA findings (10 min). Daasebre demos the React scaffold and dashboard audit (10 min). Remaining time: blockers and Week 2 assignments.

---

### Week 2 - May 25–31: Intelligence Layer

*The platform starts thinking. Models train. Scenarios compute.*

---

#### Foureira - Scenario Computation Engine

**Task 2.1 - Core scenario engine**

`pipeline/scenario_engine.py` is the mathematical heart of the platform. It takes a base case, a scenario ID, and an optional severity multiplier, then returns all stressed KPI values, deltas, percentage changes, and threshold breach flags.

Key design decisions:

The `apply_scenario()` function supports three impact types: `pct` (percentage change from base), `delta` (absolute additive change), and `abs` (override to a fixed value). This covers every scenario type in the library. The `macro_overlays` parameter allows the dashboard's live macro sliders to override specific KPI values on top of the scenario - this is what makes the interactive slider experience possible.

The `run_all_scenarios()` function runs all 56 scenarios in sequence and returns a summary DataFrame - the foundation for the breach-severity heatmap in Tab 06.

**Task 2.2 - Reverse stress engine**

`pipeline/reverse_stress.py` answers the question every board asks: "What minimum scenario severity causes KPI X to breach threshold Y?"

The approach is binary search over the severity multiplier (range 0.0 to 3.0, 50 iterations for precision of ~0.000000003). For each scenario, the engine finds the exact multiplier at which a chosen KPI breaches its floor, then generates a plain-English narrative explaining the result and the recommended response.

`find_worst_scenario_for_kpi()` runs this search across all 56 scenarios and sorts the results by breach severity ascending - scenarios with a low breach severity are the most dangerous ones, because they only need a small amplification to cause a breach.

**Deliverable by Friday May 31:** Both Python modules fully functional. Running `scenario_engine.py` produces a 56-row summary DataFrame. Running `reverse_stress.py` with an EBITDA margin floor of 50% returns a ranked list of scenarios ordered by breach severity.

---

#### Emmanuel - PDF Extraction Pipeline

**Task 2.3 - Classifier and table extractor**

`pipeline/classifier.py` uses keyword signature matching to determine document type (MTN Annual, MTN Interim, BoG Summary, BoG Quarterly, NCA Bulletin) with a confidence score. If confidence falls below 0.4, the pipeline flags the document for manual review rather than proceeding blindly.

`pipeline/extractor/tables.py` runs pdfplumber as the primary extraction engine, with Camelot as a fallback for tables without visible borders (stream mode). For scanned PDFs with no text layer, `extractor/ocr.py` runs pytesseract with a flag for manual review if OCR confidence is below 80%.

**Task 2.4 - Ghana segment extraction**

MTN Group PDFs present Ghana as one of 16+ markets. Ghana segment data typically appears in a "Selected market data" table (pages 20–35 in Group results), a market-by-market subscribers table, and the narrative commentary section.

`pipeline/extractor/ghana_segment.py` first attempts table-based extraction by scanning for rows where any of the first three columns contain "ghana" or "scancom". When table extraction misses required fields, it falls back to the LLM extraction layer.

The LLM layer (`pipeline/extractor/narrative.py`) prompts Claude to extract specific financial figures from narrative text, constrained to only return figures explicitly stated - never calculated or inferred. This handles the common case where MTN embeds figures like "Ghana service revenue grew 39.5% in Q1 2025, reaching GHS 5.4 billion" in prose rather than tables.

**Deliverable by Friday May 31:** Pipeline successfully extracts MTN Ghana segment data from the FY24 Group PDF with >85% field accuracy against the KRI Framework reference data. Output JSON committed to `data/extracted/`.

---

#### Chidima - XGBoost Financial Impact Model

**Task 2.5 - Model training**

One XGBoost regression model per financial KPI output (service revenue growth, EBITDA margin, PAT margin, MoMo revenue, ARPU, data revenue growth). Features are the six macro variables: Ghana inflation, BoG policy rate, Cedi/USD average rate, GDP growth rate, mobile penetration, and data penetration.

With only 6 years of annual history, the training dataset is small. Two mitigations: Leave-One-Out cross-validation (the honest evaluation approach for small datasets), and synthetic data augmentation via `build_augmented_dataset()` - which runs all 56 scenario engine outputs as additional training rows, expanding the effective dataset from 6 to 62 data points. Shallow trees (`max_depth=3`) prevent overfitting on the small base set.

**Task 2.6 - SHAP explainability**

Every model prediction must be explainable. The `models/explain.py` module uses SHAP TreeExplainer to decompose each prediction into per-feature contributions, ranked by absolute impact. When the dashboard shows "EBITDA margin falls to 55% under scenario S24", it must also show which macro variable drove that outcome and in which direction.

The SHAP output is consumed by the `SHAPExplanationCard` component in Tab 04, which renders a horizontal bar chart of driver contributions - red for risk-increasing, green for risk-decreasing.

**Deliverable by Friday May 31:** All six XGBoost models trained and saved as `.joblib` artefacts. `training_results.json` committed showing MAE and R² for each. SHAP explanation working for at least one model. Chidima presents MAE results at the Friday sync.

---

#### Daasebre - Scenario UI (Tab 04)

**Task 2.7 - Build Tab 04: Scenario Modelling**

The tab is divided into a left panel (Scenario Picker) and a right panel (Results).

The Scenario Picker contains: type filter pills (All / Stress / Shock / Combined / Upside), a pillar dropdown, a scrollable scenario card list with severity badges, a severity multiplier slider (0× to 2×), and three macro overlay sliders for live inflation, policy rate, and Cedi/USD overrides. These sliders are the interactive feature that makes this feel like a live risk tool rather than a static report.

The Results panel shows: four KPI impact tiles (Service Revenue, EBITDA Margin, MoMo Revenue, ARPU - each showing base value, stressed value, and coloured delta), a waterfall bar chart of the top 10 KPI movements, and the SHAP Explanation Card below it.

**Deliverable by Friday May 31:** Tab 04 renders in the browser with scenario list, severity slider, macro overlays, waterfall chart, and SHAP card. Data fetched from the live API endpoint.

---

#### Week 2 Team Sync - Friday May 31

Foureira demos the scenario engine: run S24 Stagflation, show the stressed KPI output DataFrame live (10 min). Chidima presents model training results: MAE per KPI, SHAP waterfall for EBITDA margin (10 min). Emmanuel demos extraction accuracy on FY24 Group PDF (10 min). Daasebre demos Tab 04 in the browser (10 min). Blockers (5 min).

---

### Week 3 - June 1–7: Integration & Tabs 05/06

*The system comes alive. All parts connect.*

---

#### Foureira - Tab 06: Reverse Stress Testing

Build Tab 06 - the most analytically sophisticated feature in the platform.

The user flow is: select a KPI from a dropdown (e.g. EBITDA Margin), set a floor value (e.g. 50%), and click "Find All Breach Points". The reverse stress engine runs across all 56 scenarios, and the results come back ranked by breach severity - the scenarios with the lowest severity multiplier at breach appear at the top because they require the least amplification to cause a KPI failure.

The tab renders: a ranked scenario list with breach severity bars, a full 56×1 breach heatmap (sortable by pillar or severity), narrative cards for the top five most dangerous scenarios, and a mitigation lever column for each. There is also a "Run for All KPIs" mode that produces a 56×6 full KPI matrix - showing which scenarios are simultaneously dangerous across multiple dimensions.

This is the output that changes how a board thinks about risk. It reframes the conversation from "what could happen?" to "how far away are we from a breach right now?"

**Deliverable by Friday June 7:** Tab 06 fully functional with real data. Reverse stress can find breach points for EBITDA margin, Service Revenue, and MoMo Revenue. Full 56-scenario ranking chart renders.

---

#### Emmanuel - FastAPI Full Data Layer

Implement all API endpoints required by the dashboard:

```
GET  /api/base-case              → current FY25 base case KPIs
GET  /api/scenarios              → full scenario library (56 scenarios)
POST /api/scenarios/compute      → run scenario engine, return stressed KPIs + SHAP
GET  /api/scenarios/{id}         → single scenario metadata
POST /api/reverse-stress         → run reverse stress for a target KPI + floor
GET  /api/annual                 → historical annual financials
GET  /api/macro                  → historical macro context
GET  /api/pipeline/status        → last run time + row counts for all data sources
POST /api/pipeline/trigger       → manually trigger pipeline run for a source
GET  /api/kri-register           → all 28 KRIs with current RAG status
```

Also: run the full PDF pipeline on all six sources and validate that output CSVs are within 0.5% tolerance of the KRI Framework reference data.

**Deliverable by Friday June 7:** All ten endpoints returning correct data. Swagger documentation at `/docs`. Pipeline log showing successful extraction from at least four of six sources.

---

#### Chidima - LSTM Revenue Forecaster

Train an LSTM forecaster on quarterly time series data (24 quarters of MTN Ghana revenue and macro data). The model forecasts service revenue for the next two quarters, with the output displayed as a forecast band on the revenue trend chart in Tab 02.

Given the small dataset (24 data points), a shallow architecture is appropriate: two LSTM layers (64 and 32 units), dropout at 0.2, early stopping with patience 15. If TensorFlow is unavailable in the deployment environment, an ARIMA(2,1,1) fallback is pre-built and produces comparable accuracy on this dataset size.

The `/api/forecast` endpoint returns two-quarter-ahead projections for service revenue and EBITDA margin, along with a confidence interval derived from bootstrap resampling.

**Deliverable by Friday June 7:** LSTM or ARIMA fallback trained and saved. `/api/forecast` endpoint returning two-quarter projections. Forecast chart visible in Tab 02.

---

#### Daasebre - Tab 05 & LLM Board Brief

**Tab 05 - Base vs Scenario Comparison** renders side-by-side for any active scenario: grouped bar charts for all financial KPIs and all operational KPIs, a full comparison table with a colour-coded delta column (green for improvement, red for deterioration), and an "Export to PDF" button using `window.print()` with print CSS.

**LLM Board Brief Generator:** The `pipeline/narrative_generator.py` module calls Claude's API with a structured data summary and a system prompt instructing it to write in the voice of MTN Ghana's CRO - professional, specific, under 250 words, structured as: Executive Summary (2 sentences), Key Impacts (3 bullets), Primary Risk Driver (1 sentence), Recommended Actions (3 bullets).

The brief appears in a modal triggered by a "Generate Board Brief" button on the scenario results. It generates in under five seconds and can be copied to clipboard or downloaded as a `.txt` file, timestamped with the model version used.

**Deliverable by Friday June 7:** Tab 05 fully functional with grouped bar charts and comparison table. LLM board brief generating in < 5 seconds for any selected scenario.

---

#### Week 3 Team Sync - Friday June 7

Full end-to-end demo: Daasebre drives the dashboard, everyone else in the room. Select S24 Stagflation → see Tab 04 update → switch to Tab 05 for comparison view → generate board brief live → switch to Tab 06, set EBITDA floor 50%, run reverse stress. The platform should feel like a working product at this point. Identify any remaining rough edges before the integration sprint.

---

### Week 4 - June 8–14: Polish & Milestone 1

*Production quality. The demo that impresses.*

---

#### All Team - Integration Sprint

**Foureira:** Add all 56 scenarios to the reverse stress engine and verify that breach severities are mathematically consistent (a more severe scenario should generally have a lower breach multiplier than a milder version of the same risk). Validate that the four upside scenarios (S52–S55) render correctly in Tab 04 with green waterfall bars. Write `scenario_methodology.md` - a two-page document explaining how every scenario was calibrated, suitable for a technical audience at MTN Group.

**Chidima:** Deploy models behind the `/api/predict` endpoint. Ensure SHAP explanations fire for every scenario computation call, including edge cases where the stressed value is very close to the base value. Add confidence intervals to all predictions using bootstrap resampling. Write `model_card.md` documenting training data, methodology, known limitations, and performance metrics per KPI.

**Emmanuel:** Full pipeline end-to-end test - trigger manually, watch new PDF → CSV → API update → dashboard refresh happen in under three minutes. Add `/api/pipeline/status` with last-updated timestamps per source. Deploy to AWS EC2 (or Railway for faster setup) - dashboard publicly accessible at a URL. Configure GitHub Actions CI: on every push to main, run test suite and redeploy.

**Daasebre:** Mobile responsiveness pass - all six tabs functional on a phone screen. Add loading states, error boundaries, and empty states to every chart component. Implement the "Export to PDF" button with print CSS. Final visual pass: MTN brand colours consistent throughout, typography clean, no orphaned labels or overlapping axis ticks.

**Deliverable by Friday June 14 - Milestone 1:**
Dashboard live at a public URL. All six tabs functional. All 56 scenarios computable. LSTM forecast running. LLM narratives generating. PDF pipeline extracting real data. Zero console errors in production.

---

### Week 5 - June 15–21: Advanced Analytics

---

#### Foureira - Scenario Sensitivity Heatmap

Build the 56×28 scenario-KRI heatmap: for each of the 56 scenarios, compute the impact on all 28 KRIs and colour-code the result on a diverging red-green scale. The rows are sorted by composite scenario severity (sum of absolute delta percentages across all KRIs), so the most dangerous scenarios rise to the top.

This gives management a single-view answer to "which scenarios affect which KRIs most?" - a capability typically reserved for enterprise risk platforms. Add this as Tab 07 (Beyond Brief) with CSV export.

---

#### Chidima - Monte Carlo Simulation Layer

Add Monte Carlo simulation to the scenario engine. Instead of a single stressed value per scenario, compute a full outcome distribution by treating severity as a random variable (Normal distribution, mean = selected severity, std = 0.2). With 10,000 simulations per scenario, the engine produces P5, P25, P50, P75, and P95 bands for every KPI, along with VaR (95%) and CVaR (expected shortfall).

This directly connects the scenario library to quantitative risk theory - the CVaR metric is exactly what Basel-framework risk managers and sophisticated boards expect to see. The dashboard renders min/mid/max bands on all scenario charts, and VaR/CVaR appear alongside the KPI tiles in Tab 04.

---

#### Emmanuel - Celery Scheduler

Schedule the pipeline to run automatically: BoG monthly summary checked daily at 07:00 UTC, MTN investor page checked weekly on Mondays, NCA bulletin checked quarterly on the first Monday of March, June, September, and December. New PDFs trigger a full pipeline run via Celery task. Existing PDFs (matched by SHA-256 hash) are skipped.

---

#### Daasebre - PWA + AI Narrative Widget

Wrap the React application as a Progressive Web App (service worker, offline cache of latest scenario results, add-to-home-screen manifest). This is the mobile-first delivery that makes the platform usable on-the-go.

Elevate the LLM board brief to a first-class UI feature: a persistent "Generate Board Brief" button on every scenario result page, with a generation timestamp and model version watermark. Add a brief history sidebar that retains the last five generated briefs within the session.

---

### Week 6 - June 22–29: Testing, Documentation & Delivery

---

#### Foureira - Scenario Validation Report

`scenario_validation_report.md` must cover three things. First: for each of the 14 original scenarios, verify that the new engine produces values within 2% of those in the original Excel framework - if not, explain and correct. Second: for each of the 42 new scenarios, document the calibration source and derivation method. Third: back-test S01 (Cedi −25%) and S02 (Inflation 25%) against the FY22 actual data - the engine should reproduce observed outcomes reasonably well, and any deviation should be explained.

Final scenario library statistics to present at the demo: 56 scenarios, 7 pillars, approximately 460 rows in `scenario_library.csv`, severity distribution of 6 × Severity-2, 18 × Severity-3, 22 × Severity-4, 10 × Severity-5, and 3 scenarios directly calibrated to Ghana historical crises (FY22, e-levy 2022, DDEP 2023).

---

#### Chidima - Model Performance Report

`model_performance_report.md` covering: XGBoost training data size, Leave-One-Out MAE per KPI, feature importance ranking with interpretation, and known limitations. LSTM validation loss curve, two-quarter-ahead MAE, comparison to naïve baseline. Monte Carlo simulation convergence (how MAE changes with n_simulations), VaR accuracy vs historical. SHAP: top three macro drivers per KPI with plain-English interpretation.

---

#### Emmanuel - Infrastructure

Load test with Locust: 1,000 concurrent simulated users. SSL certificate via Let's Encrypt. GitHub Actions CI/CD pipeline green. All API endpoints documented in Swagger. Write `deployment_runbook.md` - step-by-step instructions for deploying the full stack from scratch on a new machine, including all environment variables and service dependencies.

---

#### Daasebre - Final Presentation

The live demo runs 25 minutes:

1. Platform overview (2 min) - what it is, what it replaces
2. Live PDF ingestion demo (3 min) - upload BoG PDF, watch CSV update, watch dashboard refresh
3. Scenario library tour (5 min) - 56 scenarios, pillar organisation, calibration methodology
4. Scenario modelling demo (5 min) - select S24 Stagflation, drag severity to 1.5×, waterfall + SHAP explanation + LLM board brief generated live
5. Reverse stress demo (4 min) - set EBITDA margin floor 50%, click "Find All Breach Points", ranked heatmap
6. Monte Carlo demo (3 min) - run 10,000 simulations for S11, show VaR/CVaR bands
7. Sensitivity heatmap (1 min) - the 56×28 matrix, sorted by composite severity
8. What we built beyond the brief (2 min)

---

## Pipeline Architecture

```
PDF Sources (MTN IR · BoG · NCA)
        │
        ▼
Downloader & Scheduler  ←── Celery beat, checks every 6h
        │
        ▼
PDF Classifier          ←── Keyword signature matching, confidence scored
        │
        ▼
Extraction Engine       ←── pdfplumber (tables) + Camelot (fallback) + LLM (narrative)
        │
        ▼
Validator & Reconciler  ←── Accounting identity checks, YoY growth plausibility
        │
        ▼
Structured CSV Store    ←── annual.csv · segments.csv · operational.csv · macro.csv
        │
        ├──► FastAPI Data Layer  →  KRI Dashboard (Tabs 04–06)
        ├──► ML Training Pipeline  →  XGBoost + LSTM models
        └──► Scenario Engine  →  Live base case for all 56 scenarios
```

**Six configured sources:** MTN Group Annual Results, MTN Group Half-Year Results, MTN Ghana Scancom Opco Annual Report (GSE), Bank of Ghana Monthly Summary, Bank of Ghana Quarterly Statistical Bulletin, NCA Quarterly Statistical Bulletin.

**Validation rules enforced on every extracted row:** EBITDA margin must equal EBITDA ÷ Revenue × 100 within 1pp tolerance; PAT must be less than EBITDA; service revenue must fall within a plausible range for MTN Ghana's scale (GHS 1,000m–100,000m); EBITDA margin must fall between 35% and 80%; Opex + EBITDA must approximately equal Revenue within 5%.

**LLM extraction fallback:** When table extraction misses a required field, Claude is called with the page text and a schema of target fields. The prompt explicitly prohibits inference or calculation - only figures explicitly stated in the text are returned. This handles the common case where MTN embeds key figures in narrative commentary rather than structured tables.

---

## Final Deliverables

| # | Deliverable | Owner | Due |
|---|-------------|-------|-----|
| 1 | `scenario_library.csv` - 56 fully calibrated scenarios | Foureira | May 24 |
| 2 | `scenario_engine.py` + `reverse_stress.py` | Foureira | May 31 |
| 3 | Sensitivity heatmap (56×28 KRI matrix) | Foureira | June 21 |
| 4 | Scenario validation + methodology report | Foureira | June 27 |
| 5 | PDF pipeline - all 6 sources automated | Emmanuel | June 7 |
| 6 | FastAPI - 10 endpoints live | Emmanuel | June 7 |
| 7 | Celery scheduler running | Emmanuel | June 14 |
| 8 | AWS deployment + CI/CD | Emmanuel | June 14 |
| 9 | XGBoost models - 6 KPIs trained | Chidima | May 31 |
| 10 | SHAP explainability layer | Chidima | May 31 |
| 11 | LSTM revenue forecaster | Chidima | June 7 |
| 12 | Monte Carlo simulation (VaR + CVaR) | Chidima | June 21 |
| 13 | Model performance report | Chidima | June 27 |
| 14 | React dashboard - Tabs 04–06 | Daasebre | June 14 |
| 15 | PWA + mobile responsiveness | Daasebre | June 21 |
| 16 | LLM board brief generator | Daasebre | June 14 |
| 17 | Final presentation + live demo | Daasebre | June 29 |

---

## What Takes This Beyond the Brief

The original scope asked for three dashboard tabs backed by a scenario library. Here is what this plan delivers on top of that.

**Scenario depth.** 56 calibrated scenarios instead of 14. Every impact coefficient derived from and cross-validated against six years of actual MTN Ghana data. Seven thematic pillars. Upside scenarios that no standard risk platform bothers to model. Three scenarios directly back-tested against Ghana historical crises.

**Trained AI models.** XGBoost learns the statistical relationship between Ghana macro variables and MTN financial KPIs from data - replacing static coefficient tables with a back-tested model. SHAP makes every prediction auditable: the dashboard shows not just the outcome but the dominant causal driver.

**Monte Carlo.** Every scenario now produces a full outcome distribution, not a point estimate. VaR and CVaR connect the scenario library directly to quantitative risk theory. This is the language that sophisticated risk managers and boards speak.

**Automated data pipeline.** The platform self-updates when MTN or the BoG publish new documents. No human enters a number into a spreadsheet ever again. The `InternalDataLoader` interface is pre-built so the platform can switch to direct internal data access with a single environment variable change.

**LLM narrative layer.** The platform generates board-ready briefings automatically. The output is not charts and tables - it is a paragraph a CFO can read, make a decision from, and forward to the board on the same day.

**Reverse stress at scale.** The reverse stress engine runs across all 56 scenarios simultaneously, producing a ranked heatmap of which scenarios most threaten each KPI floor. Commercial risk platforms charge six figures for this capability.

---

*MTN QuantRisk Intelligence Platform - Master Execution Plan v3.0*
*Foureira · Chidima · Emmanuel · Daasebre - May 2026*