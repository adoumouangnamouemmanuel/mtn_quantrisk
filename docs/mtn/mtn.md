
bash

cat > /mnt/user-data/outputs/MTN-QuantRisk-Master-Plan-v4.md << 'ENDOFFILE'
# MTN QuantRisk Intelligence Platform
## Master Execution Plan - v4.0

**Project:** MTN QuantRisk - Scenario Modelling, Base vs Scenario Comparison & Reverse Stress Testing
**Team:** Foureira · Chidima · Emmanuel · Daasebre
**Start:** Sunday June 1, 2026 · **End:** Monday June 29, 2026 · **Duration:** 4 Weeks
**Scope:** Tabs 04, 05, and 06 of the existing KRI Dashboard, plus the data pipeline and ML intelligence layer that powers them.

> **How to read this plan.** Every task has a named owner, a set of inputs, specific tools to use, working code or data structures, and a concrete deliverable. Nothing here is aspirational prose. If a task does not end in a committed file, a running endpoint, or a tested function, it is not done.

---

## Context: What Already Exists

The existing `MTN-Ghana-KRI-Dashboard.html` is a single-file application that loads `MTN-Ghana-KRI-Framework.xlsx` client-side using the SheetJS library. It already has three functional tabs (KRI Register, Quarterly Trends, Monthly Trends) and three skeleton tabs that need to be completed and powered by live data.

**Tab 04 - Scenario Modeling** has a left panel with a scenario list (populated from the `Scenario Library` sheet), a severity slider, macro overlay sliders, and a right panel with four KPI tiles, two waterfall charts, and a heatmap. The `computeScenarioOutput()` function already applies `pct`, `delta`, and `abs` impact types. What's missing: the full 56-scenario library in the Excel file, a FastAPI backend to serve pre-computed results, XGBoost-powered impact prediction, and SHAP explanation cards.

**Tab 05 - Base vs Scenario Comparison** has `renderCompare()` which builds grouped bar charts from `state.scenarioOutput`. What's missing: an LLM board brief generator, a print-to-PDF button, and a populated comparison table.

**Tab 06 - Reverse Stress** has `recomputeReverse()` which back-solves a severity multiplier for a single scenario × KPI pair. What's missing: a cross-scenario sweep (all 56 scenarios ranked by breach severity), a breach heatmap, and narrative output cards.

The base case KPI IDs used throughout the codebase are: `FIN01` (Service Revenue GHSm), `FIN02` (EBITDA GHSm), `FIN03` (EBITDA Margin %), `FIN04` (PAT GHSm), `FIN05` (PAT Margin %), `OPS04` (ARPU GHS), `SEG03` (MoMo Revenue GHSm). These IDs must be consistent everywhere.

---

## Team Roles & Ownership

| Person | Title | Owns |
|--------|-------|------|
| **Foureira** | Scenario Architect | All 56 scenarios in Excel, `scenario_engine.py`, `reverse_stress.py`, scenario methodology documentation |
| **Chidima** | ML Engineer | XGBoost impact models, LSTM forecaster, SHAP explainability, Monte Carlo layer, `models/` directory |
| **Emmanuel** | Pipeline Engineer | PDF-to-CSV pipeline, FastAPI backend, Celery scheduler, Docker, deployment |
| **Daasebre** | Frontend Engineer | All dashboard JavaScript/HTML for Tabs 04–06, LLM board brief UI, print export, mobile responsiveness |

**Friday sync rule:** Every Friday at 5 PM, each person demos their week's deliverable live to the group. PRs require one reviewer from outside the owning role before merging to `main`.

---

## FY25 Base Case Reference Values

All scenario impacts are calculated against these anchors. Do not change these without updating the Excel `Base Case` sheet simultaneously.

| KPI ID | KPI Name | FY25 Value | Unit |
|--------|----------|-----------|------|
| FIN01 | Service Revenue | 24,400 | GHSm |
| FIN02 | EBITDA | 14,664 | GHSm |
| FIN03 | EBITDA Margin | 60.1 | % |
| FIN04 | PAT | 8,100 | GHSm |
| FIN05 | PAT Margin | 33.2 | % |
| FIN06 | Revenue Growth YoY | 36.2 | % |
| SEG01 | Data Revenue | 8,540 | GHSm |
| SEG03 | MoMo Revenue | 6,000 | GHSm |
| OPS01 | Total Subscribers | 30.2 | M |
| OPS04 | ARPU | 66.9 | GHS |
| OPS07 | 4G Coverage | 99.5 | % |
| EXT01 | Ghana Inflation | 5.4 | % |
| EXT02 | BoG Policy Rate | 28.0 | % |
| EXT03 | Cedi/USD Rate | 11.6 | GHS/USD |

**Historical calibration anchors:**
- **FY22 crisis:** Cedi −50% vs USD, inflation 54%, nominal revenue +44%, EBITDA margin compression only −0.2pp due to tariff repricing
- **FY25 tailwind:** Cedi +21.6%, inflation 5.4%, EBITDA margin +3pp to 60.1%, MoMo revenue −7.5% (regulatory headwinds dominate fintech regardless of macro)

---

## The 56-Scenario Library

### How to Derive Impact Values

For each scenario, find the closest FY22–FY25 analogue in the historical record and scale proportionally. The Cedi elasticity rule: S01 (Cedi −25%) → Revenue −8%, so elasticity ≈ 0.32 per 1% Cedi move. S15 (Cedi −40%) → Revenue ≈ −14% after compounding. Cross-check every Severity 5 scenario against the FY22 outturn - no scenario can claim worse margin compression than the −0.2pp actually observed in FY22 unless it is explicitly a compound tail event.

### Pillar A - Macroeconomic & FX · 13 scenarios · Owner: Foureira

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S01 | Stress | Cedi devaluation −25% | 4 | 3 | FIN01 −8%, FIN03 −2pp, OPS04 −15% |
| S02 | Stress | Inflation resurgence to 25% | 3 | 3 | FIN03 −3pp, opex +18% |
| S11 | Combined | Ghana macro reversal | 5 | 3 | FIN01 −10%, FIN03 −4pp, OPS01 −2.5% |
| S15 | Stress | Cedi devaluation −40% (severe) | 5 | 2 | FIN01 −14%, FIN02 −20%, OPS04 −25%, capex −25% |
| S16 | Stress | Hyperinflation return - 50%+ | 5 | 2 | Opex +35%, FIN03 −6pp, OPS01 −4% |
| S17 | Stress | BoG emergency rate hike to 35% | 4 | 2 | Capex financing +40%, working capital +20 days, dividend −60% |
| S18 | Stress | Ghana sovereign downgrade to junk | 4 | 2 | FX repatriation freeze, dividend blocked, risk premium +500bps |
| S19 | Upside | Cedi appreciation +30% | 3 | 3 | FIN01 +10%, FIN03 +3pp, USD opex relief |
| S20 | Stress | IMF conditionality tightening | 3 | 3 | Tariff freeze risk, consumer spending −5% |
| S21 | Stress | Cocoa/commodity crash - fiscal squeeze | 3 | 3 | GDP −2pp, MoMo volumes −8% |
| S22 | Stress | Oil price spike - pass-through inflation | 3 | 3 | Diesel cost +40%, generator opex +30% |
| S23 | Shock | BoG FX intervention failure - disorderly devaluation | 5 | 2 | Cedi −35% in 30 days, USD payables crisis |
| S24 | Combined | Stagflation trap - GDP 1%, inflation 30% | 4 | 2 | FIN01 −8%, FIN03 −4pp, OPS04 real −20%, churn +3% |

### Pillar B - Regulatory & Government · 10 scenarios · Owner: Foureira

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S03 | Stress | MoMo e-levy increase to 1.5% | 4 | 3 | SEG03 −25%, MoMo users −15% |
| S04 | Stress | Sovereign debt / repatriation freeze | 4 | 2 | Dividend −50%, working capital +15 days |
| S25 | Stress | NCA universal service levy increase | 3 | 3 | Opex +GHS 400m, FIN03 −1.5pp |
| S26 | Stress | Spectrum refarming forced at cost | 3 | 3 | Capex +GHS 800m, 4G coverage −2pp |
| S27 | Stress | Parliament social tariff floor | 4 | 3 | ARPU cap, FIN01 −6%, data repricing constrained |
| S28 | Stress | BoG MoMo interoperability mandate | 4 | 4 | SEG03 −15%, transaction fee yield −30% |
| S29 | Shock | NCA partial licence revocation | 5 | 1 | FIN01 −30%, subscriber exodus, Group write-down |
| S30 | Shock | SIM re-registration 2.0 - 6-month disruption | 4 | 3 | Active subs −8%, data subs −6%, MoMo users −10% |
| S31 | Stress | Data Protection Act fine - major enforcement | 3 | 3 | Fine GHS 500m, compliance opex +GHS 200m |
| S32 | Combined | Regulatory storm - spectrum + e-levy + tariff cap | 5 | 2 | FIN01 −15%, SEG03 −30%, FIN03 −5pp, capex +20% |

### Pillar C - Technology & Cybersecurity · 10 scenarios · Owners: Emmanuel + Chidima

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S06 | Shock | Major cyber breach - 5-day MoMo outage | 5 | 2 | SEG03 −12%, FIN02 −3% |
| S07 | Shock | Spectrum dispute - 4G degradation | 4 | 2 | OPS07 −2.5pp, data usage −15%, FIN01 −8% |
| S09 | Shock | Mass data privacy breach | 4 | 2 | MoMo users −5%, fine GHS 200m |
| S33 | Shock | Ransomware - core network 10-day outage | 5 | 1 | FIN01 −20% (quarter), OPS01 −5% |
| S34 | Shock | MoMo vendor insolvency - forced migration | 4 | 2 | Emergency capex +GHS 1.2bn, MoMo 15-day outage, users −12% |
| S35 | Stress | 5G auction - MTN underbids, competitor wins | 3 | 3 | Data share −3pp |
| S36 | Shock | Subsea cable cut - bandwidth crisis | 3 | 2 | Enterprise revenue at risk −8% |
| S37 | Stress | AI-driven MoMo fraud surge +500% | 4 | 3 | Fraud losses GHS 300m, MoMo users −8% |
| S38 | Shock | National grid + telecoms cyberattack | 5 | 1 | Sites offline 20%, FIN01 −15%, emergency opex +25% |
| S39 | Stress | Network sharing collapse - Telecel dispute | 3 | 3 | Capex +GHS 600m, coverage gaps |

### Pillar D - Competitive & Market Structure · 8 scenarios · Owner: Daasebre (UI), Foureira (calibration)

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S10 | Shock | Competitive intensification - broad ARPU pressure | 4 | 3 | OPS04 −12%, FIN01 −6%, OPS01 −2.5% |
| S40 | Stress | Telecel aggressive bundle reset | 3 | 4 | OPS04 −8%, data share −2pp, CAC +20% |
| S41 | Shock | New MVNO entry - tech giant | 4 | 2 | Data ARPU −15%, enterprise −10% |
| S42 | Stress | AT Ghana recapitalisation | 3 | 3 | Subs growth −3pp, churn +2% |
| S43 | Stress | Price war - all operators cut data 40% | 4 | 3 | FIN01 −12%, FIN03 −4pp |
| S44 | Shock | Bank-led mobile wallet captures MoMo share | 4 | 3 | MoMo users −15%, SEG03 −20% |
| S45 | Stress | OTT substitution accelerates - voice collapse | 3 | 4 | Voice Rev −20%, SMS Rev −30% |
| S46 | Stress | Starlink Ghana rural expansion | 3 | 3 | Rural data subs −5%, ARPU pressure |

### Pillar E - Operational & Climate · 7 scenarios · Owners: Emmanuel + Foureira

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S05 | Stress | ECG tariff +40% | 3 | 3 | Opex +12%, FIN03 −2pp |
| S08 | Shock | Major flood - 300+ sites down | 3 | 2 | Sites −300, capex +15%, FIN01 −2% |
| S47 | Stress | ECG load-shedding Stage 6 - 6 months | 4 | 3 | Diesel opex +GHS 800m, site availability −3pp, FIN03 −2.5pp |
| S48 | Shock | Accra earthquake - 500+ sites, HQ disruption | 5 | 1 | Sites −500, FIN01 −8% (quarter), emergency capex +25% |
| S49 | Stress | Tower equipment supply chain disruption | 3 | 3 | Capex efficiency −30%, rollout delay 2 quarters |
| S50 | Shock | CEO + CFO simultaneous departure | 3 | 2 | Share price −10%, strategy execution risk |
| S51 | Stress | Labour dispute - extended strike | 3 | 2 | Opex +GHS 150m, customer service degradation |

### Pillar F - Upside & Opportunity · 4 scenarios · Owners: Foureira + Daasebre

| ID | Type | Scenario Name | Upside | Plaus | Key KPI Impacts |
|----|------|--------------|:------:|:-----:|----------------|
| S52 | Upside | 5G early mover - enterprise revenue surge | +3 | 3 | Enterprise Rev +25%, data ARPU +15% |
| S53 | Upside | MoMo lending / micro-insurance breakthrough | +4 | 3 | SEG03 +35%, digital Rev +80% |
| S54 | Upside | Ghana GDP 8%+ super-cycle | +3 | 2 | OPS01 +5%, OPS04 +10%, MoMo volumes +20% |
| S55 | Upside | Cedi appreciation +40% | +4 | 2 | FIN03 +4pp, FX gain on net assets |

### Pillar G - Tail Risk & Existential · 4 scenarios · Owner: Foureira

| ID | Type | Scenario Name | Sev | Plaus | Key KPI Impacts |
|----|------|--------------|:---:|:-----:|----------------|
| S12 | Combined | Fintech disruption + regulatory pressure | 4 | 3 | SEG03 −30%, digital −25%, FIN02 −5.5% |
| S13 | Combined | Network crisis + climate compound | 5 | 2 | Sites −400, OPS07 −3pp, FIN03 −3.5pp |
| S14 | Combined | Reverse-FY25 - all tailwinds vanish | 5 | 3 | FIN01 −5%, FIN03 −5pp, opex +20% |
| S56 | Combined | Perfect storm - macro + cyber + regulatory + climate | 5 | 1 | FIN01 −25%, FIN03 −8pp, SEG03 −40%, dividend suspended |

**Total: 56 scenarios across 7 pillars. Type mix: 32 Stress · 14 Shock · 6 Combined · 4 Upside.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                          │
│     MTN-Ghana-KRI-Dashboard.html  (extended Tabs 04, 05, 06)        │
│     Chart.js · SheetJS · Vanilla JS · Manrope/Fraunces fonts        │
└─────────────────────────┬──────────────────────────────────────────┘
                           │ fetch()  REST API calls
┌─────────────────────────▼──────────────────────────────────────────┐
│                           FASTAPI LAYER                             │
│   api/main.py  - 10 endpoints, CORS, Swagger at /docs               │
│   Celery worker + Redis broker (background tasks)                   │
└──────────┬──────────────────────────┬──────────────────────────────┘
           │                          │
┌──────────▼──────────┐   ┌──────────▼──────────────────────────────┐
│   ML MODEL LAYER    │   │          PDF PIPELINE LAYER               │
│  models/artefacts/  │   │  pipeline/downloader.py                   │
│  XGBoost × 6 KPIs   │   │  pipeline/classifier.py                   │
│  LSTM forecaster    │   │  pipeline/extractor/tables.py             │
│  SHAP explainer     │   │  pipeline/extractor/narrative.py          │
│  Monte Carlo sim    │   │  pipeline/validator.py                    │
└─────────────────────┘   │  pipeline/run_pipeline.py                 │
                           └──────────────────────────────────────────┘
                                       │
                           ┌──────────▼──────────────────────────────┐
                           │         STRUCTURED DATA STORE            │
                           │  data/structured/                        │
                           │    annual.csv                            │
                           │    segments_annual.csv                   │
                           │    operational_annual.csv                │
                           │    macro_context.csv                     │
                           │    scenario_library.csv                  │
                           │    base_case.csv                         │
                           └──────────────────────────────────────────┘
```

---

## Repository Structure

```
mtn_quantrisk/
├── pipeline/
│   ├── __init__.py
│   ├── downloader.py           # PDF fetching + SHA-256 dedup
│   ├── classifier.py           # Document type detection
│   ├── mapper.py               # Schema definitions + column aliases
│   ├── validator.py            # Accounting identity checks
│   ├── exporter.py             # Writes to structured CSVs
│   ├── scenario_engine.py      # Core stress computation
│   ├── reverse_stress.py       # Binary search breach solver
│   ├── narrative_generator.py  # LLM board brief via Claude API
│   ├── run_pipeline.py         # Main orchestrator CLI
│   ├── scheduler.py            # Celery beat schedules
│   └── extractor/
│       ├── tables.py           # pdfplumber + camelot
│       ├── narrative.py        # LLM extraction fallback
│       └── ocr.py              # pytesseract for scanned PDFs
├── api/
│   └── main.py                 # FastAPI - all 10 endpoints
├── models/
│   ├── train_impact_model.py   # XGBoost training + LOO CV
│   ├── train_lstm.py           # LSTM revenue forecaster
│   ├── monte_carlo.py          # Monte Carlo VaR/CVaR layer
│   ├── explain.py              # SHAP explainability
│   └── artefacts/              # .joblib and .h5 saved models
├── data/
│   ├── raw_pdfs/               # Downloaded PDFs - git-ignored
│   ├── extracted/              # Raw JSON extractions - git-ignored
│   └── structured/             # Final CSVs - committed to repo
├── dashboard/
│   └── MTN-Ghana-KRI-Dashboard.html   # Extended from existing file
├── config/
│   └── sources.yaml            # All PDF source definitions
├── notebooks/
│   └── 01_eda_feature_engineering.ipynb
├── tests/
│   ├── test_scenario_engine.py
│   ├── test_validator.py
│   └── test_api.py
├── .env.example
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## Required Libraries

```bash
# Python
pip install fastapi uvicorn[standard] celery redis pdfplumber pymupdf \
            camelot-py[cv] pytesseract pandas numpy requests \
            beautifulsoup4 pydantic anthropic scikit-learn xgboost \
            shap joblib scipy statsmodels python-dotenv locust

# Optional - for LSTM (only if TensorFlow available in environment)
pip install tensorflow

# Node (for local development of dashboard enhancements)
npm install -g live-server
```

---

## Week 1 - June 1–7: Foundations

**Theme:** No one writes a single line of scenario computation or ML code until the ground truth is locked. This week produces the Excel scenario library, Docker infrastructure, source audit, and EDA notebook - the data every other week builds on.

---

### Foureira - Scenario Library in Excel

**Tools:** Microsoft Excel / Google Sheets, `scenario_calibration_notes.md` (text editor)
**Reference:** `MTN-Ghana-KRI-Framework.xlsx` → `Scenario Library` sheet, `Base Case` sheet

#### Task 1.1 - Calibrate all 56 scenarios

Open `MTN-Ghana-KRI-Framework.xlsx`. Navigate to the `Scenario Library` sheet. The sheet already contains S01–S14. Add S15–S56.

The required column structure for the `Scenario Library` sheet (row 1 is a header, row 2 is the column label row):

```
Col A: Scenario ID        (e.g. S15)
Col B: Type               (Stress | Shock | Combined | Upside)
Col C: Scenario Name      (plain English)
Col D: Description        (1–2 sentence explanation for dashboard tooltip)
Col E: KPI ID             (e.g. FIN01 - one row per impacted KPI)
Col F: Impact Type        (pct | delta | abs)
Col G: Impact Value       (numeric - pct means % change, delta means absolute additive)
Col H: Plausibility 1–5
Col I: Severity 1–5
Col J: Recovery Qtrs      (integer)
Col K: Mitigation Lever   (plain English action)
Col L: Calibration Source (e.g. "FY22 analogue, 0.32 elasticity")
```

**Worked example - S15 (Cedi −40%):**

Derivation: S01 uses Cedi −25% → FIN01 −8%. Elasticity = 8/25 = 0.32. S15 at −40% → 40 × 0.32 = 12.8%, rounded to −14% after compounding. EBITDA impact is larger because USD-denominated network costs (roaming interconnect, equipment maintenance contracts) compress margin by an additional 2pp beyond what revenue loss implies.

```
S15 | Stress | Cedi devaluation -40% (severe) | ... | FIN01 | pct | -14  | 2 | 5 | 4 | Emergency tariff repricing | FY22 analogue 0.32 elasticity compounded
S15 |        |                                 |     | FIN03 | delta | -4  |   |   |   |
S15 |        |                                 |     | FIN02 | pct | -20  |   |   |   |
S15 |        |                                 |     | OPS04 | pct | -25  |   |   |   |
```

Repeat this derivation process for every scenario. Document each derivation in `scenario_calibration_notes.md`.

#### Task 1.2 - Export scenario_library.csv

Once the Excel sheet is complete, export it as CSV:
- Excel → File → Save As → `data/structured/scenario_library.csv`
- Verify row count: should be approximately 400–500 rows (56 scenarios × average 8 KPI impacts each)

**Deliverable by Friday June 7:**
- `scenario_library.csv` committed to GitHub with ≥ 400 rows
- `scenario_calibration_notes.md` committed showing derivation for at least 10 scenarios
- Foureira presents 3 calibrations live (S15, S24, S56) in the Friday sync - 10 minutes

---

### Emmanuel - Docker Stack & Source Audit

**Tools:** Docker Desktop, `pdfinfo`, `pdffonts` (from `poppler-utils`), VS Code, Terminal

#### Task 1.3 - Docker stack

Create `docker-compose.yml`:

```yaml
version: "3.9"
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://mtn:mtn@db/quantrisk
      - REDIS_URL=redis://redis:6379/0
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATA_SOURCE=pipeline
    depends_on: [db, redis]
    volumes: ["./data:/app/data", "./models:/app/models"]

  worker:
    build: .
    command: celery -A pipeline.scheduler worker --loglevel=info --concurrency=2
    environment:
      - REDIS_URL=redis://redis:6379/0
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on: [redis]
    volumes: ["./data:/app/data"]

  beat:
    build: .
    command: celery -A pipeline.scheduler beat --loglevel=info
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quantrisk
      POSTGRES_USER: mtn
      POSTGRES_PASSWORD: mtn
    volumes: ["pgdata:/var/lib/postgresql/data"]
    ports: ["5432:5432"]

volumes:
  pgdata:
```

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    poppler-utils tesseract-ocr ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

Test: `docker compose up` - all five services should start clean in one command.

#### Task 1.4 - Download and audit 6 source PDFs

Manually download one PDF from each source listed in `config/sources.yaml`. For each PDF, run:

```bash
# Install poppler-utils if not present
sudo apt-get install poppler-utils   # Linux
brew install poppler                  # macOS

# Run audit
pdfinfo path/to/file.pdf
pdffonts path/to/file.pdf
```

Record results in `data/source_audit.md` with this structure:

```markdown
## MTN Group FY24 Annual Results
- URL: https://www.mtn.com/wp-content/uploads/...
- File: mtn_annual_fy2024.pdf
- Pages: 128
- Has text layer: YES (pdffonts returns 14+ font entries)
- Key table pages: 14 (income statement), 22 (revenue by segment), 36 (market data)
- Ghana segment: pages 74–78 (Selected market data table)
- Notes: Scanned pages: None. MTN Group presents Ghana as 1 of 16 markets.
```

Repeat for: MTN H1 2025, BoG Summary (most recent month), BoG Quarterly Q4 2025, NCA Quarterly Q4 2024, MTN Ghana Scancom GSE filing.

**Where to find the PDFs:**
- MTN annual/interim: https://www.mtn.com/investor-relations/financial-results/
- BoG monthly summary: https://www.bog.gov.gh/monetary-policy/summary-of-economic-and-financial-data/
- BoG quarterly: https://www.bog.gov.gh/economic-data/statistical-bulletin/
- NCA quarterly: https://nca.org.gh/industry-information/market-data/statistical-bulletin/
- Scancom (MTN Ghana) GSE filing: https://gse.com.gh/trading-and-data/company-reports/

**Deliverable by Friday June 7:**
- `docker compose up` runs cleanly, all 5 services green
- 6 PDFs saved in `data/raw_pdfs/`
- `data/source_audit.md` committed with audit data for all 6 PDFs

---

### Chidima - Data Preparation & EDA

**Tools:** Python 3.11, Jupyter Lab (`pip install jupyterlab`), pandas, matplotlib, seaborn, scipy

#### Task 1.5 - Export Excel to CSV

```python
# scripts/export_excel_to_csv.py
# Run: python scripts/export_excel_to_csv.py

import pandas as pd
from pathlib import Path

WB_PATH = "data/MTN-Ghana-KRI-Framework.xlsx"
OUT_DIR = Path("data/structured")
OUT_DIR.mkdir(parents=True, exist_ok=True)

SHEETS = [
    "Annual", "HalfYearly", "Quarterly",
    "Segments_Annual", "Segments_Quarterly",
    "Operational_Annual", "Operational_Quarterly",
    "Leading_Indicators", "Macro_Context",
    "Derived_Ratios", "Base Case", "KRI Register",
    "Scenario Library"   # Foureira adds this in Task 1.1
]

for sheet in SHEETS:
    try:
        df = pd.read_excel(WB_PATH, sheet_name=sheet, header=1)
        out_path = OUT_DIR / f"{sheet.lower().replace(' ', '_')}.csv"
        df.to_csv(out_path, index=False)
        print(f"✓ {sheet}: {len(df)} rows → {out_path}")
    except Exception as e:
        print(f"✗ {sheet}: {e}")
```

Expected output: 13 CSV files in `data/structured/`. Coordinate with Foureira - run this script again after Foureira commits the completed `Scenario Library` sheet.

#### Task 1.6 - EDA notebook

Create `notebooks/01_eda_feature_engineering.ipynb`. Required sections:

**Section 1 - Macro variable distributions (FY20–FY25)**

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

macro = pd.read_csv("data/structured/macro_context.csv")
annual = pd.read_csv("data/structured/annual.csv")

# 6 macro variables - distribution plots
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
macro_cols = ["Inflation_YoY_Pct", "Policy_Rate_Pct", "Cedi_USD_Avg",
              "GDP_Growth_Pct", "Mobile_Penetration_Pct", "Data_Penetration_Pct"]
for i, col in enumerate(macro_cols):
    ax = axes[i//3][i%3]
    if col in macro.columns:
        ax.bar(macro["Year"], macro[col], color="#002B5C", alpha=0.8)
        ax.set_title(col.replace("_", " "), fontsize=10)
        ax.set_xlabel("Year")
plt.tight_layout()
plt.savefig("notebooks/charts/macro_distributions.png", dpi=150)
```

**Section 2 - Correlation matrix: macro → financial KPIs**

```python
df = macro.merge(annual, on="Year")
feature_cols = ["Inflation_YoY_Pct", "Policy_Rate_Pct", "Cedi_USD_Avg", "GDP_Growth_Pct"]
target_cols  = ["Service_Revenue", "EBITDA_Margin_Pct", "PAT_Margin_Pct"]
corr_df = df[feature_cols + target_cols].corr()
sns.heatmap(corr_df.loc[feature_cols, target_cols], annot=True, cmap="RdYlGn",
            center=0, fmt=".2f", square=True)
plt.title("Macro-to-KPI Correlation Matrix")
```

**Section 3 - Lag analysis**

Test whether Q(t) inflation better predicts Q(t) or Q(t+1) EBITDA margin. Use rolling cross-correlation:

```python
quarterly = pd.read_csv("data/structured/quarterly.csv").sort_values(["Year", "Quarter"])
if "Inflation_YoY_Pct" in quarterly.columns and "EBITDA_Margin_Pct" in quarterly.columns:
    for lag in range(0, 4):
        shifted = quarterly["Inflation_YoY_Pct"].shift(lag)
        corr = shifted.corr(quarterly["EBITDA_Margin_Pct"])
        print(f"Lag {lag} quarters: inflation → EBITDA margin correlation = {corr:.3f}")
```

**Section 4 - Structural break identification**

Mark FY22 (hyperinflation crisis) and FY25 (Cedi appreciation tailwind) as annotated vertical lines on all time-series charts. Document in a markdown cell: "FY22 shows nominal revenue can grow +44% while real conditions are dire, because of tariff repricing. This means models must train on **real** (inflation-adjusted) revenue growth, not nominal."

**Deliverable by Friday June 7:**
- All CSVs exported and committed
- EDA notebook committed with ≥ 8 charts and a written interpretation for each section
- Key finding documented: models must use real revenue, not nominal

---

### Daasebre - Dashboard Audit & Environment Setup

**Tools:** Chrome DevTools, VS Code, `live-server`

#### Task 1.7 - Complete dashboard audit

Open `MTN-Ghana-KRI-Dashboard.html` in Chrome. Load `MTN-Ghana-KRI-Framework.xlsx`. Navigate to each of Tabs 04, 05, 06 and document the following in `dashboard_audit.md`:

```markdown
## Tab 04 - Scenario Modeling

### What works
- Scenario list populates from Excel `Scenario Library` sheet ✓
- selectScenario() fires and sets state.currentScenario ✓
- computeScenarioOutput() applies pct/delta/abs impacts correctly ✓
- Severity slider adjusts sevMult and calls recomputeScenario() ✓
- Two waterfall charts (chart-wf-fin, chart-wf-ops) render ✓
- KPI impact heatmap (chart-heatmap) renders ✓

### What is missing or broken
- Only 14 scenarios in library - needs 56 ✗
- No backend API - all computation is client-side JavaScript ✗
- No SHAP explanation card ✗
- Macro overlay sliders only appear if `Macro Overlays` config sheet is present ✗
- No LLM board brief button ✗
- No pillar filter - only type filter (All/Stress/Shock/Combined) ✗

### HTML element IDs used (needed for JS integration)
- #scenario-list - scenario picker container
- #scenario-info, #si-name, #si-desc, #si-meta - info card
- #sev-mult - severity slider input
- #kpi-rev-val, #kpi-marg-val, #kpi-lev-val, #kpi-arpu-val - KPI tiles
- #chart-wf-fin, #chart-wf-ops - waterfall canvases
- #chart-heatmap - heatmap canvas

## Tab 05 - Base vs Scenario Comparison

### What works
- renderCompare() builds grouped bar charts ✓
- Full comparison table with delta column ✓
- Combined waterfall chart ✓

### What is missing
- No LLM board brief generator ✗
- No "Export to PDF" button ✗
- No pillar breakdown in comparison table ✗

## Tab 06 - Reverse Stress Testing

### What works
- recomputeReverse() back-solves severity for one scenario × KPI pair ✓
- Sensitivity sweep chart (0× to 2×) renders ✓
- Result narrative card shows severity interpretation ✓

### What is missing
- No cross-scenario sweep (all 56 ranked by breach severity) ✗
- No breach heatmap across all KPIs ✗
- No "Run all scenarios" mode ✗
```

#### Task 1.8 - Local development environment

Set up a live-reload development environment:

```bash
# Clone/copy the dashboard HTML to the dashboard/ directory
cp MTN-Ghana-KRI-Dashboard.html dashboard/
cd dashboard/

# Start live server (auto-reloads on file save)
npx live-server --port=3000 --open=MTN-Ghana-KRI-Dashboard.html

# In a separate terminal - start the FastAPI backend
cd ..
uvicorn api.main:app --reload --port=8000
```

Create `dashboard/.env.js` with the API base URL:

```javascript
// dashboard/env.js - loaded before the main HTML script
const API_BASE = "http://localhost:8000";
```

**Deliverable by Friday June 7:**
- `dashboard_audit.md` committed with full gap analysis for all three tabs
- Local dev environment running - dashboard on :3000, API on :8000
- Live reload working for HTML file changes

---

### Week 1 Friday Sync - June 7, 5 PM

| Speaker | Item | Time |
|---------|------|------|
| Foureira | Walk through S15, S24, S56 calibrations live in Excel | 10 min |
| Emmanuel | `docker compose up` demo - all 5 services green | 5 min |
| Chidima | Show correlation matrix and lag analysis from EDA notebook | 10 min |
| Daasebre | Walk through `dashboard_audit.md` - what the 3 tabs need | 10 min |
| All | Blockers, Week 2 assignments | 10 min |

---

## Week 2 - June 8–14: Intelligence Layer

**Theme:** The platform starts thinking. The scenario engine computes. Models train. The pipeline classifies and extracts.

---

### Foureira - Scenario Engine & Reverse Stress

**Tools:** Python 3.11, VS Code, pandas, numpy, scipy

#### Task 2.1 - Core scenario engine

Create `pipeline/scenario_engine.py`:

```python
# pipeline/scenario_engine.py

import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache

BASE_CASE_PATH    = Path("data/structured/base_case.csv")
SCENARIO_LIB_PATH = Path("data/structured/scenario_library.csv")
THRESHOLDS_PATH   = Path("data/structured/kri_register.csv")


@lru_cache(maxsize=1)
def load_base_case() -> dict:
    """Returns {KPI_ID: float_value}. Cached - reload by clearing cache."""
    df = pd.read_csv(BASE_CASE_PATH)
    return dict(zip(df["KPI_ID"], df["FY25_Base_Value"].astype(float)))


@lru_cache(maxsize=1)
def load_scenario_library() -> pd.DataFrame:
    return pd.read_csv(SCENARIO_LIB_PATH)


def apply_scenario(
    scenario_id: str,
    severity_multiplier: float = 1.0,
    macro_overlays: dict = None
) -> dict:
    """
    Apply a scenario to the FY25 base case.

    Parameters
    ----------
    scenario_id        : e.g. "S24"
    severity_multiplier: 0.0 (no impact) to 2.0+ (extreme). Default 1.0.
    macro_overlays     : optional {KPI_ID: override_value} for dashboard sliders.
                         Applied AFTER scenario impacts.

    Returns
    -------
    {
        "scenario_id"         : str,
        "severity_multiplier" : float,
        "base_case"           : {KPI_ID: float},
        "stressed"            : {KPI_ID: float},
        "deltas"              : {KPI_ID: float},        # stressed - base
        "delta_pcts"          : {KPI_ID: float},        # (stressed - base) / base × 100
        "breached_thresholds" : list[dict],
        "scenario_meta"       : dict                    # name, type, sev, plaus, recov, lever
    }
    """
    base      = load_base_case()
    scenarios = load_scenario_library()
    sc_rows   = scenarios[scenarios["Scenario_ID"] == scenario_id]

    if sc_rows.empty:
        raise ValueError(f"Scenario '{scenario_id}' not found in scenario_library.csv")

    # Meta from first row (merged-cell fields)
    first     = sc_rows.iloc[0]
    meta      = {
        "name"    : first.get("Scenario_Name", ""),
        "type"    : first.get("Type", ""),
        "severity": int(first.get("Severity_1_5", 0)),
        "plaus"   : int(first.get("Plausibility_1_5", 0)),
        "recov"   : int(first.get("Recovery_Qtrs", 0)),
        "lever"   : first.get("Mitigation_Lever", "")
    }

    stressed = base.copy()

    # --- Apply scenario impacts ---
    for _, row in sc_rows.iterrows():
        kpi_id     = str(row.get("KPI_ID", "")).strip()
        impact_type = str(row.get("Impact_Type", "pct")).strip()
        impact_val = float(row.get("Impact_Value", 0))

        if kpi_id not in stressed:
            continue

        base_val   = base[kpi_id]
        scaled_val = impact_val * severity_multiplier

        if impact_type == "pct":
            stressed[kpi_id] = base_val * (1 + scaled_val / 100)
        elif impact_type == "delta":
            stressed[kpi_id] = base_val + scaled_val
        elif impact_type == "abs":
            stressed[kpi_id] = scaled_val
        else:
            raise ValueError(f"Unknown impact_type '{impact_type}' for {scenario_id}/{kpi_id}")

    # --- Apply macro overlays on top ---
    if macro_overlays:
        for kpi_id, value in macro_overlays.items():
            if kpi_id in stressed:
                stressed[kpi_id] = float(value)

    # --- Compute deltas ---
    deltas     = {k: stressed[k] - base[k] for k in base}
    delta_pcts = {}
    for k in base:
        delta_pcts[k] = (deltas[k] / base[k] * 100) if base[k] != 0 else 0.0

    breached = _check_thresholds(stressed)

    return {
        "scenario_id"         : scenario_id,
        "severity_multiplier" : severity_multiplier,
        "base_case"           : base,
        "stressed"            : stressed,
        "deltas"              : deltas,
        "delta_pcts"          : delta_pcts,
        "breached_thresholds" : breached,
        "scenario_meta"       : meta,
    }


def _check_thresholds(kpi_values: dict) -> list:
    """Compare stressed values against RED thresholds from KRI Register."""
    if not THRESHOLDS_PATH.exists():
        return []
    thresholds = pd.read_csv(THRESHOLDS_PATH)
    breaches   = []
    for _, row in thresholds.iterrows():
        kpi_id = str(row.get("KPI_ID", "")).strip()
        if kpi_id not in kpi_values:
            continue
        red_floor    = row.get("Red_Threshold")
        direction    = str(row.get("Direction", "higher")).lower()
        stressed_val = kpi_values[kpi_id]
        if pd.isna(red_floor):
            continue
        breached = (stressed_val < float(red_floor)) if direction == "higher" \
                   else (stressed_val > float(red_floor))
        if breached:
            breaches.append({
                "kpi_id"       : kpi_id,
                "kpi_name"     : row.get("KRI_Name", kpi_id),
                "stressed_val" : round(stressed_val, 3),
                "red_floor"    : float(red_floor),
                "direction"    : direction,
            })
    return breaches


def run_all_scenarios(severity: float = 1.0) -> pd.DataFrame:
    """
    Run all 56 scenarios and return a summary DataFrame.
    Used by the reverse stress endpoint and the sensitivity heatmap.
    """
    lib        = load_scenario_library()
    scenario_ids = lib["Scenario_ID"].unique()
    rows       = []
    for sc_id in scenario_ids:
        try:
            r = apply_scenario(sc_id, severity)
            rows.append({
                "Scenario_ID"   : sc_id,
                "Scenario_Name" : r["scenario_meta"]["name"],
                "Type"          : r["scenario_meta"]["type"],
                "Severity"      : r["scenario_meta"]["severity"],
                "FIN01_Stressed": r["stressed"].get("FIN01"),
                "FIN03_Stressed": r["stressed"].get("FIN03"),
                "SEG03_Stressed": r["stressed"].get("SEG03"),
                "OPS04_Stressed": r["stressed"].get("OPS04"),
                "FIN01_Delta_Pct": r["delta_pcts"].get("FIN01"),
                "FIN03_Delta_Pp" : r["deltas"].get("FIN03"),
                "N_Breaches"    : len(r["breached_thresholds"]),
            })
        except Exception as e:
            print(f"  [WARN] Skipping {sc_id}: {e}")
    return pd.DataFrame(rows)


if __name__ == "__main__":
    # Smoke test
    result = apply_scenario("S01", severity_multiplier=1.0)
    print(f"S01 FIN01: {result['base_case']['FIN01']:.0f} → {result['stressed']['FIN01']:.0f}")
    summary = run_all_scenarios()
    print(f"\nAll-scenario summary: {len(summary)} rows")
    print(summary[["Scenario_ID","FIN01_Delta_Pct","FIN03_Delta_Pp","N_Breaches"]].head(10))
```

#### Task 2.2 - Reverse stress engine

Create `pipeline/reverse_stress.py`:

```python
# pipeline/reverse_stress.py

import numpy as np
import pandas as pd
from pathlib import Path
from pipeline.scenario_engine import apply_scenario, load_scenario_library


def find_breach_severity(
    scenario_id   : str,
    target_kpi    : str,
    breach_floor  : float,
    direction     : str = "lower",    # "lower" = breach when value falls below floor
    max_severity  : float = 3.0,
    precision_iters: int = 50
) -> dict:
    """
    Binary search for the minimum severity multiplier at which
    target_kpi breaches breach_floor.

    Returns a result dict. If the scenario cannot breach the floor even at
    max_severity, returns {"result": "no_breach", ...}.
    """

    def kpi_at_sev(sev: float) -> float:
        r = apply_scenario(scenario_id, severity_multiplier=sev)
        return r["stressed"].get(target_kpi, 0.0)

    # Quick check: can this scenario breach the floor at all?
    max_val = kpi_at_sev(max_severity)
    breach_at_max = (max_val < breach_floor) if direction == "lower" \
                    else (max_val > breach_floor)
    if not breach_at_max:
        return {
            "result"     : "no_breach",
            "scenario_id": scenario_id,
            "target_kpi" : target_kpi,
            "note"       : f"Even at {max_severity}× severity, {target_kpi} = "
                           f"{max_val:.2f}, which does not breach floor {breach_floor:.2f}"
        }

    # Binary search
    lo, hi       = 0.0, max_severity
    breach_sev   = None
    for _ in range(precision_iters):
        mid = (lo + hi) / 2
        val = kpi_at_sev(mid)
        breached = (val < breach_floor) if direction == "lower" else (val > breach_floor)
        if breached:
            hi = mid
            breach_sev = mid
        else:
            lo = mid

    stressed_val = kpi_at_sev(breach_sev)

    # Narrative
    lib  = load_scenario_library()
    meta = lib[lib["Scenario_ID"] == scenario_id].iloc[0]
    sev_label = ("mild" if breach_sev < 0.5 else
                 "within base definition" if breach_sev < 1.0 else
                 "moderate amplification (1–1.5×)" if breach_sev < 1.5 else
                 "severe (1.5–2×)" if breach_sev < 2.0 else "extreme (>2×)")

    narrative = (
        f"Under '{meta['Scenario_Name']}' at {breach_sev:.3f}× severity, "
        f"{target_kpi} reaches {stressed_val:.2f} - breaching the "
        f"{breach_floor:.2f} floor. "
        f"This is a {sev_label} amplification. "
        f"Expected recovery: {meta.get('Recovery_Qtrs', '?')} quarters. "
        f"Recommended response: {meta.get('Mitigation_Lever', 'See scenario register.')}"
    )

    return {
        "result"         : "breach_found",
        "scenario_id"    : scenario_id,
        "scenario_name"  : meta["Scenario_Name"],
        "scenario_type"  : meta["Type"],
        "target_kpi"     : target_kpi,
        "breach_floor"   : breach_floor,
        "breach_severity": round(breach_sev, 4),
        "stressed_value" : round(stressed_val, 3),
        "sev_label"      : sev_label,
        "narrative"      : narrative,
    }


def rank_all_scenarios_by_breach(
    target_kpi  : str,
    breach_floor: float,
    direction   : str = "lower"
) -> list:
    """
    Run find_breach_severity across ALL 56 scenarios.
    Returns list sorted by breach_severity ascending -
    the most dangerous scenarios (lowest breach threshold) first.
    """
    lib          = load_scenario_library()
    scenario_ids = lib["Scenario_ID"].unique()
    results      = []

    for sc_id in scenario_ids:
        try:
            r = find_breach_severity(sc_id, target_kpi, breach_floor, direction)
            if r.get("result") == "breach_found":
                results.append(r)
        except Exception as e:
            print(f"  [WARN] {sc_id}: {e}")

    results.sort(key=lambda x: x["breach_severity"])
    return results


if __name__ == "__main__":
    # Smoke test - find scenarios that breach EBITDA margin floor of 50%
    print("Ranking all scenarios by how easily they breach FIN03 = 50%...")
    ranked = rank_all_scenarios_by_breach("FIN03", breach_floor=50.0, direction="lower")
    for r in ranked[:5]:
        print(f"  {r['scenario_id']:4s} | {r['scenario_name'][:40]:40s} | "
              f"breach @ {r['breach_severity']:.3f}× | {r['sev_label']}")
```

**Deliverable by Friday June 14:**
- `scenario_engine.py` - `apply_scenario("S01")` returns correct stressed values
- `reverse_stress.py` - `rank_all_scenarios_by_breach("FIN03", 50.0)` returns ranked list
- Both modules pass `tests/test_scenario_engine.py` (write at least 5 unit tests)
- Committed and reviewed

---

### Emmanuel - PDF Classifier & Extractor

**Tools:** Python, pdfplumber, camelot-py, pytesseract, VS Code

#### Task 2.3 - Document classifier

Create `pipeline/classifier.py`:

```python
# pipeline/classifier.py

import re
from dataclasses import dataclass
from enum import Enum


class DocType(Enum):
    MTN_ANNUAL       = "mtn_annual"
    MTN_INTERIM      = "mtn_interim"
    MTN_GHANA_OPCO   = "mtn_ghana_annual"
    BOG_SUMMARY      = "bog_summary"
    BOG_QUARTERLY    = "bog_quarterly"
    NCA_BULLETIN     = "nca_bulletin"
    UNKNOWN          = "unknown"


@dataclass
class ClassificationResult:
    doc_type  : DocType
    confidence: float   # 0.0 – 1.0
    period    : str     # e.g. "FY2024", "H1 2025", "Q4 2024"
    year      : int
    signals   : list    # Which keywords triggered this classification


SIGNATURES = {
    DocType.MTN_ANNUAL: {
        "required"  : ["annual financial results", "year ended 31 december"],
        "supporting": ["mtn group", "ebitda", "headline earnings", "service revenue"],
        "period_re" : r"year ended 31 december (\d{4})"
    },
    DocType.MTN_INTERIM: {
        "required"  : ["six months ended", "interim results"],
        "supporting": ["mtn group", "ebitda", "h1", "half year", "headline earnings"],
        "period_re" : r"six months ended (\d{1,2} \w+ \d{4})"
    },
    DocType.MTN_GHANA_OPCO: {
        "required"  : ["scancom plc", "ghana stock exchange"],
        "supporting": ["mtn ghana", "ebitda", "service revenue", "momo"],
        "period_re" : r"(year ended|31 december) (\d{4})"
    },
    DocType.BOG_SUMMARY: {
        "required"  : ["bank of ghana", "summary of economic and financial data"],
        "supporting": ["monetary policy rate", "inflation", "exchange rate", "mobile money"],
        "period_re" : r"(january|february|march|april|may|june|july|august|"
                      r"september|october|november|december)\s+(\d{4})"
    },
    DocType.BOG_QUARTERLY: {
        "required"  : ["bank of ghana", "quarterly statistical bulletin"],
        "supporting": ["deposit money banks", "monetary survey", "fiscal operations"],
        "period_re" : r"quarter (one|two|three|four)[,\s]+(\d{4})"
    },
    DocType.NCA_BULLETIN: {
        "required"  : ["national communications authority", "statistical bulletin"],
        "supporting": ["mobile voice", "mtn", "market share", "data penetration"],
        "period_re" : r"(q[1-4])\s+(\d{4})"
    }
}


def classify_pdf(text_sample: str) -> ClassificationResult:
    """
    Classify based on first ~3000 chars of extracted text.
    Required keywords must ALL be present. Supporting keywords add confidence.
    If confidence < 0.4, flag for manual review - don't proceed blindly.
    """
    text_lower = text_sample.lower()
    best_type, best_score, best_signals, best_period = DocType.UNKNOWN, 0, [], "unknown"

    for doc_type, sig in SIGNATURES.items():
        if not all(kw in text_lower for kw in sig["required"]):
            continue
        signals = list(sig["required"])
        score   = len(sig["required"]) * 2
        for kw in sig["supporting"]:
            if kw.lower() in text_lower:
                signals.append(kw); score += 1
        if score > best_score:
            best_score, best_type, best_signals = score, doc_type, signals
            m = re.search(sig["period_re"], text_lower)
            if m: best_period = m.group(0)

    confidence = min(best_score / 10.0, 1.0)
    year_m     = re.search(r"(20\d{2})", best_period)
    year       = int(year_m.group(1)) if year_m else 0

    return ClassificationResult(best_type, confidence, best_period, year, best_signals)
```

#### Task 2.4 - Table extractor

Create `pipeline/extractor/tables.py`:

```python
# pipeline/extractor/tables.py

import pdfplumber, subprocess, json, camelot
import pandas as pd
from pathlib import Path


def inspect_pdf(pdf_path: str) -> dict:
    """Quick pre-flight: page count + text layer detection."""
    info   = {}
    result = subprocess.run(["pdfinfo", pdf_path], capture_output=True, text=True)
    for line in result.stdout.split("\n"):
        if "Pages:" in line:
            info["pages"] = int(line.split(":")[1].strip())

    fonts = subprocess.run(["pdffonts", pdf_path], capture_output=True, text=True)
    font_lines         = [l for l in fonts.stdout.split("\n") if l.strip()]
    info["has_text_layer"] = len(font_lines) > 2    # header + at least one font
    info["likely_scanned"] = not info["has_text_layer"]
    return info


def extract_all_tables(pdf_path: str, min_rows: int = 3) -> list:
    """
    Primary extractor: pdfplumber.
    Returns list of dicts with "page", "rows", "cols", "headers", "dataframe".
    """
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            for t_idx, raw in enumerate(page.extract_tables() or []):
                if not raw or len(raw) < min_rows:
                    continue
                header = raw[0]
                df     = pd.DataFrame(raw[1:], columns=header).dropna(how="all")
                tables.append({
                    "page"       : page_num,
                    "table_index": t_idx,
                    "rows"       : len(df),
                    "cols"       : len(df.columns),
                    "headers"    : list(df.columns),
                    "dataframe"  : df,
                    "preview"    : df.head(3).to_dict()
                })
    return tables


def extract_tables_camelot(pdf_path: str, pages: str = "all") -> list:
    """
    Fallback: camelot - better for borderless tables.
    Try lattice first (ruled), then stream (borderless).
    Use when pdfplumber returns empty or malformed tables.
    """
    tables = []
    try:
        result = camelot.read_pdf(pdf_path, pages=pages, flavor="lattice")
        if result.n == 0:
            result = camelot.read_pdf(pdf_path, pages=pages, flavor="stream")
        for t in result:
            tables.append({
                "page"      : t.page,
                "accuracy"  : t.accuracy,
                "dataframe" : t.df,
                "headers"   : list(t.df.columns)
            })
    except Exception as e:
        print(f"[WARN] Camelot failed on {pdf_path}: {e}")
    return tables


def save_raw_extraction(tables: list, output_path: str):
    """Persist raw extraction as JSON for audit trail."""
    serialisable = []
    for t in tables:
        entry = {k: v for k, v in t.items() if k != "dataframe"}
        entry["data"] = t["dataframe"].to_dict(orient="records")
        serialisable.append(entry)
    with open(output_path, "w") as f:
        json.dump(serialisable, f, indent=2, default=str)
    print(f"  → Saved {len(serialisable)} tables to {output_path}")
```

**Deliverable by Friday June 14:**
- `classify_pdf()` correctly identifies document type for all 6 audited PDFs (confidence > 0.6)
- `extract_all_tables()` returns ≥ 5 tables from the MTN FY24 annual PDF
- Unit tests in `tests/test_classifier.py` covering all 6 document types

---

### Chidima - XGBoost Impact Models

**Tools:** Python, scikit-learn, XGBoost, SHAP, joblib, `notebooks/02_model_training.ipynb`

#### Task 2.5 - Train XGBoost models

Create `models/train_impact_model.py`:

```python
# models/train_impact_model.py

import pandas as pd
import numpy as np
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib, json

DATA_DIR  = Path("data/structured")
MODEL_DIR = Path("models/artefacts")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Six macro features - inputs
FEATURE_COLS = [
    "Inflation_YoY_Pct",
    "Policy_Rate_Pct",
    "Cedi_USD_Avg",
    "GDP_Growth_Pct",
    "Mobile_Penetration_Pct",
    "Data_Penetration_Pct",
]

# Six KPI targets - one model each
TARGETS = {
    "Service_Rev_Growth_Pct" : "revenue_growth",
    "EBITDA_Margin_Pct"      : "ebitda_margin",
    "PAT_Margin_Pct"         : "pat_margin",
    "MoMo_Revenue"           : "momo_revenue",
    "Avg_ARPU_GHS"           : "arpu",
    "Data_Rev_Growth_Pct"    : "data_revenue_growth",
}


def build_augmented_dataset(base_df: pd.DataFrame) -> pd.DataFrame:
    """
    Augment 6 years of historical data with scenario-derived synthetic rows.
    Expands effective training set from 6 → 62 data points.

    Each scenario creates a synthetic point:
      macro inputs  = base case + scenario macro impacts
      KPI outputs   = base case + scenario KPI impacts
    """
    from pipeline.scenario_engine import apply_scenario, load_scenario_library
    lib   = load_scenario_library()
    sc_ids = lib["Scenario_ID"].unique()
    rows  = []
    base  = None   # lazy load
    KPI_TO_FEATURE = {
        "EXT01": "Inflation_YoY_Pct",
        "EXT02": "Policy_Rate_Pct",
        "EXT03": "Cedi_USD_Avg",
        "EXT05": "GDP_Growth_Pct",
    }
    KPI_TO_TARGET = {
        "FIN06": "Service_Rev_Growth_Pct",
        "FIN03": "EBITDA_Margin_Pct",
        "FIN05": "PAT_Margin_Pct",
        "SEG03": "MoMo_Revenue",
        "OPS04": "Avg_ARPU_GHS",
    }
    for sc_id in sc_ids:
        try:
            r    = apply_scenario(sc_id, severity_multiplier=1.0)
            if base is None:
                base = r["base_case"]
            row  = {}
            for kpi, feat in KPI_TO_FEATURE.items():
                row[feat] = r["stressed"].get(kpi, base.get(kpi, 0))
            # Fill remaining feature cols with base values
            for feat in FEATURE_COLS:
                if feat not in row:
                    row[feat] = base.get(feat, 0)
            for kpi, tgt in KPI_TO_TARGET.items():
                row[tgt] = r["stressed"].get(kpi, 0)
            row["source"] = f"synthetic_{sc_id}"
            rows.append(row)
        except Exception as e:
            print(f"  [WARN] Skipping {sc_id}: {e}")
    synth_df = pd.DataFrame(rows)
    return pd.concat([base_df, synth_df], ignore_index=True)


def train_all_models(augment: bool = True) -> dict:
    annual = pd.read_csv(DATA_DIR / "annual.csv")
    macro  = pd.read_csv(DATA_DIR / "macro_context.csv")
    segs   = pd.read_csv(DATA_DIR / "segments_annual.csv")
    ops    = pd.read_csv(DATA_DIR / "operational_annual.csv")
    df     = annual.merge(macro, on="Year").merge(segs, on="Year", suffixes=("","_seg")) \
                   .merge(ops, on="Year", suffixes=("","_ops"))

    if augment:
        print("Augmenting dataset with synthetic scenario rows...")
        df = build_augmented_dataset(df)
        print(f"  Dataset size after augmentation: {len(df)} rows")

    scaler    = StandardScaler()
    X_raw     = df[FEATURE_COLS].dropna()
    df_clean  = df.loc[X_raw.index]
    X_scaled  = scaler.fit_transform(X_raw)
    joblib.dump(scaler, MODEL_DIR / "feature_scaler.joblib")

    log = {}
    for target_col, model_name in TARGETS.items():
        if target_col not in df_clean.columns:
            print(f"  [SKIP] {target_col} not in data")
            continue
        y     = df_clean[target_col].fillna(df_clean[target_col].median())
        valid = y.notna()
        Xv, yv = X_scaled[valid], y[valid]
        if len(Xv) < 5:
            print(f"  [SKIP] {target_col}: only {len(Xv)} rows")
            continue

        model = XGBRegressor(
            n_estimators   = 200,
            max_depth      = 3,       # Shallow = less overfitting on small dataset
            learning_rate  = 0.05,
            subsample      = 0.8,
            colsample_bytree= 0.8,
            reg_alpha      = 0.1,
            reg_lambda     = 1.0,
            random_state   = 42
        )
        # Leave-One-Out cross-validation - honest on small datasets
        loo    = LeaveOneOut()
        preds  = cross_val_predict(model, Xv, yv, cv=loo)
        mae    = mean_absolute_error(yv, preds)
        r2     = r2_score(yv, preds)

        # Retrain on full data for production
        model.fit(Xv, yv)
        joblib.dump(model, MODEL_DIR / f"{model_name}.joblib")

        log[target_col] = {
            "model_file"        : f"{model_name}.joblib",
            "train_rows"        : int(len(Xv)),
            "loo_mae"           : round(float(mae), 4),
            "loo_r2"            : round(float(r2), 4),
            "feature_importance": dict(zip(FEATURE_COLS,
                                           model.feature_importances_.tolist()))
        }
        print(f"  ✓ {target_col:30s}  MAE={mae:.3f}  R²={r2:.3f}  rows={len(Xv)}")

    with open(MODEL_DIR / "training_results.json", "w") as f:
        json.dump(log, f, indent=2)
    return log


if __name__ == "__main__":
    results = train_all_models(augment=True)
    print(f"\nTrained {len(results)} models.")
```

#### Task 2.6 - SHAP explainability

Create `models/explain.py`:

```python
# models/explain.py

import shap, joblib, pandas as pd, numpy as np
from pathlib import Path

MODEL_DIR   = Path("models/artefacts")
FEATURE_COLS = [
    "Inflation_YoY_Pct", "Policy_Rate_Pct", "Cedi_USD_Avg",
    "GDP_Growth_Pct", "Mobile_Penetration_Pct", "Data_Penetration_Pct"
]

MODEL_MAP = {
    "FIN03": "ebitda_margin",
    "FIN01": "revenue_growth",
    "SEG03": "momo_revenue",
    "OPS04": "arpu",
    "FIN05": "pat_margin",
}


def explain_kpi(kpi_id: str, macro_values: dict) -> dict:
    """
    Returns SHAP-based explanation for a single KPI prediction.
    Called by /api/scenarios/compute to power the SHAP card in Tab 04.

    Parameters
    ----------
    kpi_id      : e.g. "FIN03"
    macro_values: {"Inflation_YoY_Pct": 5.4, "Policy_Rate_Pct": 28.0, ...}

    Returns
    -------
    {
        "kpi_id"        : str,
        "model"         : str,
        "top_driver"    : str,      # feature name
        "ranked_drivers": [str],    # sorted by |shap|
        "explanation"   : {
            feature: {
                "shap_value"   : float,
                "feature_value": float,
                "direction"    : "increases_risk" | "decreases_risk"
            }
        }
    }
    """
    model_name = MODEL_MAP.get(kpi_id)
    if model_name is None:
        return {"error": f"No model registered for KPI {kpi_id}"}

    model_path  = MODEL_DIR / f"{model_name}.joblib"
    scaler_path = MODEL_DIR / "feature_scaler.joblib"
    if not model_path.exists() or not scaler_path.exists():
        return {"error": "Model artefacts not found - run train_all_models() first"}

    model   = joblib.load(model_path)
    scaler  = joblib.load(scaler_path)
    X_raw   = pd.DataFrame([macro_values])[FEATURE_COLS].fillna(0)
    X_scaled = scaler.transform(X_raw)

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)[0]   # first (only) row

    explanation = {}
    for i, feat in enumerate(FEATURE_COLS):
        sv = float(shap_values[i])
        explanation[feat] = {
            "shap_value"   : round(sv, 5),
            "feature_value": macro_values.get(feat),
            "direction"    : "increases_risk" if sv > 0 else "decreases_risk"
        }

    ranked = sorted(explanation.items(), key=lambda x: abs(x[1]["shap_value"]), reverse=True)

    return {
        "kpi_id"        : kpi_id,
        "model"         : model_name,
        "top_driver"    : ranked[0][0],
        "ranked_drivers": [r[0] for r in ranked],
        "explanation"   : explanation,
    }
```

**Deliverable by Friday June 14:**
- All 6 XGBoost models trained, saved in `models/artefacts/`
- `training_results.json` committed showing LOO MAE and R² for each model
- `explain_kpi("FIN03", {...})` returns a correctly structured SHAP dict
- Chidima presents MAE table at Friday sync

---

### Daasebre - FastAPI Skeleton + Tab 04 Enhancements

**Tools:** Python, FastAPI, VS Code, Chrome DevTools

#### Task 2.7 - FastAPI skeleton

Create `api/main.py` with all endpoints stubbed (full implementation in Week 3):

```python
# api/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
from pathlib import Path

app = FastAPI(title="MTN QuantRisk Data API", version="2.0",
              docs_url="/docs", redoc_url="/redoc")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

DATA_DIR = Path("data/structured")


# ---------- Request/Response Models ----------

class ScenarioComputeRequest(BaseModel):
    scenario_id         : str
    severity_multiplier : float = 1.0
    macro_overrides     : Optional[dict] = None

class ReverseStressRequest(BaseModel):
    target_kpi   : str
    breach_floor : float
    direction    : str = "lower"   # "lower" | "higher"

class BoardBriefRequest(BaseModel):
    scenario_id : str
    severity    : float = 1.0


# ---------- Data Endpoints ----------

@app.get("/api/base-case")
def get_base_case():
    """Return current FY25 base case KPIs."""
    path = DATA_DIR / "base_case.csv"
    if not path.exists():
        raise HTTPException(404, "base_case.csv not generated yet")
    df = pd.read_csv(path)
    return df.to_dict(orient="records")

@app.get("/api/scenarios")
def get_scenarios():
    """Return all 56 scenarios (metadata only, no impact rows)."""
    path = DATA_DIR / "scenario_library.csv"
    if not path.exists():
        raise HTTPException(404, "scenario_library.csv not found")
    df = pd.read_csv(path)
    # De-duplicate to one row per scenario
    meta_cols = ["Scenario_ID","Type","Scenario_Name","Description",
                 "Severity_1_5","Plausibility_1_5","Recovery_Qtrs","Mitigation_Lever"]
    existing  = [c for c in meta_cols if c in df.columns]
    return df[existing].drop_duplicates(subset=["Scenario_ID"]).to_dict(orient="records")

@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    path = DATA_DIR / "scenario_library.csv"
    df   = pd.read_csv(path)
    rows = df[df["Scenario_ID"] == scenario_id]
    if rows.empty:
        raise HTTPException(404, f"Scenario {scenario_id} not found")
    return rows.to_dict(orient="records")

@app.post("/api/scenarios/compute")
def compute_scenario(req: ScenarioComputeRequest):
    """Run scenario engine + SHAP explanation. Core endpoint for Tab 04."""
    from pipeline.scenario_engine import apply_scenario
    from models.explain import explain_kpi, FEATURE_COLS
    try:
        result = apply_scenario(req.scenario_id, req.severity_multiplier,
                                req.macro_overrides)
        # Attach SHAP explanation for EBITDA margin
        macro_for_shap = {f: result["stressed"].get(f.replace("_Pct","_YoY_Pct"), 0)
                          for f in FEATURE_COLS}
        result["shap_explanation"] = explain_kpi("FIN03", macro_for_shap)
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/reverse-stress")
def reverse_stress(req: ReverseStressRequest):
    """Rank all 56 scenarios by how easily they breach the target KPI floor."""
    from pipeline.reverse_stress import rank_all_scenarios_by_breach
    results = rank_all_scenarios_by_breach(req.target_kpi, req.breach_floor,
                                           req.direction)
    return {"ranked": results, "count": len(results)}

@app.get("/api/annual")
def get_annual():
    df = pd.read_csv(DATA_DIR / "annual.csv")
    return df.to_dict(orient="records")

@app.get("/api/macro")
def get_macro():
    df = pd.read_csv(DATA_DIR / "macro_context.csv")
    return df.to_dict(orient="records")

@app.get("/api/pipeline/status")
def pipeline_status():
    status = {}
    for f in DATA_DIR.glob("*.csv"):
        df = pd.read_csv(f)
        status[f.stem] = {"rows": len(df), "last_updated": f.stat().st_mtime}
    return status

@app.post("/api/pipeline/trigger")
def trigger_pipeline(source: str = "all"):
    """Manually trigger a pipeline run (async via Celery)."""
    from pipeline.scheduler import run_source
    run_source.delay(source)
    return {"status": "queued", "source": source}

@app.get("/api/kri-register")
def get_kri_register():
    df = pd.read_csv(DATA_DIR / "kri_register.csv")
    return df.to_dict(orient="records")
```

#### Task 2.8 - Tab 04: Add pillar filter and SHAP card to existing HTML

Extend the existing `dashboard/MTN-Ghana-KRI-Dashboard.html`. Locate the `<div class="scenario-panel">` block (around line 613 in the original). Add the following HTML immediately below the type filter chips:

```html
<!-- PILLAR FILTER - add after type filter chips -->
<div class="panel-sub" style="margin-top: 12px;">Filter by pillar</div>
<select id="scen-pillar-filter" onchange="renderScenarioList()"
        style="width:100%; padding: 7px 10px; border: 1px solid rgba(11,18,32,0.18);
               background: #fff; font-family: 'Manrope', sans-serif; font-size: 12px;
               border-radius: 2px; margin-bottom: 12px;">
  <option value="all">All Pillars</option>
  <option value="Macro & FX">Macro & FX</option>
  <option value="Regulatory">Regulatory</option>
  <option value="Technology">Technology & Cyber</option>
  <option value="Competitive">Competitive</option>
  <option value="Operational">Operational & Climate</option>
  <option value="Upside">Upside</option>
  <option value="Tail Risk">Tail Risk</option>
</select>
```

Add the SHAP explanation card HTML after `#chart-heatmap`:

```html
<!-- SHAP Explanation Card - add after heatmap chart-card -->
<div class="chart-card" id="shap-card" style="display:none;">
  <div class="title">AI Explanation - Why This Outcome?</div>
  <div class="sub">SHAP values - each macro variable's contribution to this scenario result</div>
  <div id="shap-drivers" style="padding: 8px 0;"></div>
</div>
```

Add a "Generate Board Brief" button after the scenario info card:

```html
<button onclick="generateBoardBrief()"
        class="file-btn" style="width:100%; margin-top: 12px; justify-content: center;"
        id="brief-btn">
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 4h12v1H2V4zm0 3h12v1H2V7zm0 3h8v1H2v-1z"/>
  </svg>
  Generate Board Brief
</button>
```

And in the JavaScript section, add the `generateBoardBrief()` function and the updated `renderScenarioList()` that respects the pillar filter:

```javascript
// Updated renderScenarioList with pillar filter
function renderScenarioList() {
  const wrap = document.getElementById('scenario-list');
  if (!state.scenarios) return;
  const typeFilter   = state.scenarioFilter || 'all';
  const pillarFilter = document.getElementById('scen-pillar-filter')?.value || 'all';
  const items = state.scenarios.filter(s => {
    const typeOk   = typeFilter  === 'all' || s.type   === typeFilter;
    const pillarOk = pillarFilter === 'all' || s.pillar === pillarFilter;
    return typeOk && pillarOk;
  });
  wrap.innerHTML = items.map(s => `
    <div class="scenario-item ${state.currentScenario === s.id ? 'selected' : ''}"
         onclick="selectScenario('${s.id}')">
      <div class="sid">${s.id}</div>
      <div class="sname">${esc(s.name)}</div>
      <span class="stype ${s.type}">${s.type}</span>
      ${s.pillar ? `<span style="font-size:9px; color: var(--mute); display:block; margin-top:2px;">${s.pillar}</span>` : ''}
    </div>`).join('');
}

// Board brief generator
async function generateBoardBrief() {
  const btn = document.getElementById('brief-btn');
  if (!state.currentScenario) return;
  btn.textContent = 'Generating…';
  btn.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/board-brief`, {
      method : 'POST',
      headers: {'Content-Type': 'application/json'},
      body   : JSON.stringify({
        scenario_id: state.currentScenario,
        severity   : +document.getElementById('sev-mult').value / 100
      })
    });
    const data = await res.json();
    showBriefModal(data.brief, state.currentScenario);
  } catch (e) {
    alert('Brief generation failed: ' + e.message);
  } finally {
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1H2V4zm0 3h12v1H2V7zm0 3h8v1H2v-1z"/></svg> Generate Board Brief';
    btn.disabled = false;
  }
}

function showBriefModal(text, scenarioId) {
  const existing = document.getElementById('brief-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'brief-modal';
  modal.style.cssText = `position:fixed; inset:0; background:rgba(0,43,92,0.7);
    z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px;`;
  modal.innerHTML = `
    <div style="background:#fff; max-width:680px; width:100%; padding:32px;
                max-height:80vh; overflow-y:auto; position:relative;">
      <div style="font-family:'JetBrains Mono',monospace; font-size:10px;
                  color:var(--yellow-dim); letter-spacing:0.15em; text-transform:uppercase;
                  margin-bottom:6px;">Board Brief // ${scenarioId} // ${new Date().toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}</div>
      <div style="white-space:pre-wrap; font-size:13px; line-height:1.7;
                  color:var(--ink);">${esc(text)}</div>
      <div style="display:flex; gap:10px; margin-top:20px;">
        <button onclick="navigator.clipboard.writeText(${JSON.stringify(text)}).then(()=>this.textContent='Copied!')"
                class="file-btn" style="font-size:12px;">Copy to Clipboard</button>
        <button onclick="document.getElementById('brief-modal').remove()"
                class="file-btn ghost" style="font-size:12px;">Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
```

**Deliverable by Friday June 14:**
- FastAPI running at `http://localhost:8000` - `/docs` shows all 10 endpoints
- Tab 04 has pillar filter working in browser
- Tab 04 has SHAP card HTML in place (data not yet wired - that's Week 3)
- Board brief modal HTML working (API not yet connected)

---

### Week 2 Friday Sync - June 14, 5 PM

| Speaker | Item | Time |
|---------|------|------|
| Foureira | Live demo: `apply_scenario("S24")` in Python REPL, show stressed KPIs | 10 min |
| Chidima | Present `training_results.json` - MAE per model, top SHAP driver for FIN03 | 10 min |
| Emmanuel | Show `classify_pdf()` on 3 different PDFs in terminal | 10 min |
| Daasebre | Browser demo: pillar filter on Tab 04, SHAP card HTML, brief modal | 10 min |

---

## Week 3 - June 15–21: Integration

**Theme:** Every piece connects. API serves real data. Dashboard fetches it. Pipeline produces CSVs. LLM writes briefs.

---

### Foureira - Tab 06 Cross-Scenario Reverse Stress

**Tools:** The `reverse_stress.py` from Week 2, HTML/JS in `dashboard/MTN-Ghana-KRI-Dashboard.html`

#### Task 3.1 - Add cross-scenario sweep to Tab 06

The existing `recomputeReverse()` in the dashboard handles one scenario × one KPI. Add a new button and function that calls `/api/reverse-stress` and renders the full ranked result set.

Add this HTML inside `<div id="tab-reverse">` after the existing `.reverse-grid`:

```html
<!-- CROSS-SCENARIO SWEEP - full 56-scenario ranking -->
<div class="reverse-card" style="margin-top: 24px;">
  <h3>All-Scenario Breach Ranking</h3>
  <div style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; margin-bottom:16px;">
    <div class="control-group">
      <label>Target KPI</label>
      <select id="sweep-kpi" style="min-width:200px;"></select>
    </div>
    <div class="control-group">
      <label>Floor value</label>
      <input type="number" id="sweep-floor" value="50" step="0.5"
             style="width:90px; padding:7px 10px; border:1px solid rgba(11,18,32,0.18);
                    background:#fff; font-family:'JetBrains Mono',monospace; font-size:13px;">
    </div>
    <button class="file-btn" onclick="runSweep()" id="sweep-btn">
      Run All 56 Scenarios
    </button>
  </div>
  <div id="sweep-results" style="display:none;">
    <div class="chart-card" style="margin-bottom:16px;">
      <div class="title" id="sweep-chart-title">Breach Severity Ranking</div>
      <div class="sub">Lower breach severity = more dangerous scenario</div>
      <div class="chart-container tall"><canvas id="chart-sweep"></canvas></div>
    </div>
    <div id="sweep-narrative" style="margin-top:12px;"></div>
  </div>
</div>
```

Add the corresponding JavaScript:

```javascript
async function runSweep() {
  const kpiId = document.getElementById('sweep-kpi').value;
  const floor = parseFloat(document.getElementById('sweep-floor').value);
  const btn   = document.getElementById('sweep-btn');
  if (!kpiId || isNaN(floor)) return;

  btn.textContent = 'Running 56 scenarios…';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API_BASE}/api/reverse-stress`, {
      method : 'POST',
      headers: {'Content-Type': 'application/json'},
      body   : JSON.stringify({ target_kpi: kpiId, breach_floor: floor, direction: 'lower' })
    });
    const data = await res.json();
    renderSweepResults(data.ranked, kpiId, floor);
    document.getElementById('sweep-results').style.display = 'block';
  } catch (e) {
    alert('Sweep failed: ' + e.message);
  } finally {
    btn.textContent = 'Run All 56 Scenarios';
    btn.disabled = false;
  }
}

function renderSweepResults(ranked, kpiId, floor) {
  // Top 15 most dangerous scenarios
  const top = ranked.slice(0, 15);
  const labels = top.map(r => r.scenario_id + ' · ' + r.scenario_name.slice(0, 30));
  const data   = top.map(r => r.breach_severity);
  const colors = top.map(r => {
    if (r.breach_severity < 0.5) return '#C53030D0';         // RED - extremely dangerous
    if (r.breach_severity < 1.0) return '#D69E2ED0';         // AMBER - within base scenario
    return '#002B5CD0';                                        // NAVY - requires amplification
  });

  destroyChart('chart-sweep');
  const ctx = document.getElementById('chart-sweep');
  document.getElementById('sweep-chart-title').textContent =
    `Breach Severity Ranking - ${kpiId} floor: ${floor}`;
  charts['chart-sweep'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Severity multiplier at breach',
      data, backgroundColor: colors, borderWidth: 1 }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#001A3A', borderColor: '#FFC72C', borderWidth: 1, padding: 10,
          callbacks: { label: ctx => `${ctx.raw.toFixed(3)}× severity → ${
            top[ctx.dataIndex].sev_label}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(11,18,32,0.06)' }, min: 0, max: 3,
             title: { display: true, text: 'Severity multiplier at breach' },
             ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // Narrative cards for top 3
  const narrativeDiv = document.getElementById('sweep-narrative');
  narrativeDiv.innerHTML = ranked.slice(0, 3).map(r => `
    <div class="reverse-result" style="margin-bottom:12px;">
      <div class="rr-headline">${r.scenario_id} - ${r.scenario_name}</div>
      <div class="rr-detail">${r.narrative}</div>
    </div>`).join('');
}
```

**Deliverable by Friday June 21:**
- Tab 06 "Run All 56 Scenarios" button calls `/api/reverse-stress` and renders breach ranking chart
- Top 3 narrative cards display below the chart
- `sweep-kpi` dropdown populated from base case KPI list

---

### Emmanuel - LLM Extraction Fallback + Full Pipeline

**Tools:** Python, anthropic SDK, `pipeline/extractor/narrative.py`

#### Task 3.2 - LLM narrative extractor

Create `pipeline/extractor/narrative.py`:

```python
# pipeline/extractor/narrative.py
# Reference: https://docs.anthropic.com/en/api/getting-started

import anthropic, json, re
from pathlib import Path

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env


TARGET_SCHEMAS = {
    "ghana_segment": {
        "Service_Revenue"         : "MTN Ghana service revenue in GHS millions (not RBN)",
        "EBITDA_Margin_Pct"       : "MTN Ghana EBITDA margin as a percentage (e.g. 60.1)",
        "Subscribers_M"           : "MTN Ghana total subscribers in millions",
        "Active_MoMo_Users_M"     : "MTN Ghana active MoMo / mobile money users in millions",
        "Service_Rev_Growth_Pct"  : "MTN Ghana service revenue growth YoY as percentage",
        "Data_Rev_Growth_Pct"     : "MTN Ghana data revenue growth YoY as percentage",
    },
    "bog_macro": {
        "Inflation_YoY_Pct"       : "Ghana headline CPI inflation year-on-year percentage",
        "Policy_Rate_Pct"         : "Bank of Ghana monetary policy rate percentage",
        "Cedi_USD_Avg"            : "Ghana Cedi to USD exchange rate (GHS per USD)",
        "GDP_Growth_Pct"          : "Ghana real GDP growth rate percentage",
        "Mobile_Money_Vol_GHSb"   : "Total mobile money transaction value in GHS billions",
    }
}


def extract_figures_from_text(
    page_text   : str,
    schema_key  : str,
    period_hint : str = ""
) -> dict:
    """
    Use Claude claude-sonnet-4-20250514 to extract specific figures from narrative text.
    Only called when table extraction misses a required field.

    API docs: https://docs.anthropic.com/en/api/messages
    Model: claude-sonnet-4-20250514 (always use Sonnet 4 for pipeline tasks)
    """
    schema      = TARGET_SCHEMAS.get(schema_key, {})
    schema_desc = "\n".join(f"- {k}: {v}" for k, v in schema.items())

    prompt = f"""Extract specific financial figures from this text from an MTN Ghana / Bank of Ghana financial report.

Period context: {period_hint}

Fields to extract:
{schema_desc}

Rules:
1. ONLY extract figures explicitly stated - never calculate, infer, or estimate
2. Monetary values in GHS millions unless stated otherwise
3. Return null for any field not present in the text
4. Return ONLY valid JSON - no markdown fences, no preamble

Text:
{page_text[:4000]}

JSON:"""

    response = client.messages.create(
        model      = "claude-sonnet-4-20250514",
        max_tokens = 800,
        messages   = [{"role": "user", "content": prompt}]
    )
    raw = response.content[0].text.strip()
    raw = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print(f"  [WARN] LLM returned non-JSON: {raw[:200]}")
        return {}


def extract_ghana_from_group_pdf(pdf_text: str, target_year: int) -> dict:
    """Find Ghana-specific sections in a Group-level results PDF and extract figures."""
    import re
    ghana_re   = re.compile(r"ghana[^\n]{0,300}", re.IGNORECASE | re.DOTALL)
    sections   = ghana_re.findall(pdf_text)
    if not sections:
        return {}
    ghana_text = "\n".join(sections[:15])
    return extract_figures_from_text(ghana_text, "ghana_segment",
                                     period_hint=f"FY {target_year}")
```

#### Task 3.3 - LLM board brief endpoint

Add to `api/main.py`:

```python
# Add this import at top of api/main.py
from pipeline.narrative_generator import generate_board_brief

@app.post("/api/board-brief")
def board_brief(req: BoardBriefRequest):
    """Generate a plain-English board brief from scenario results."""
    try:
        brief = generate_board_brief(req.scenario_id, req.severity)
        return {"brief": brief, "scenario_id": req.scenario_id,
                "generated_at": pd.Timestamp.now().isoformat(),
                "model": "claude-sonnet-4-20250514"}
    except Exception as e:
        raise HTTPException(500, str(e))
```

Create `pipeline/narrative_generator.py`:

```python
# pipeline/narrative_generator.py
# Reference: https://docs.anthropic.com/en/api/messages

import anthropic
from pipeline.scenario_engine import apply_scenario

client = anthropic.Anthropic()


def generate_board_brief(scenario_id: str, severity: float = 1.0) -> str:
    """
    Generate a CRO-voice board brief from scenario computation results.
    Uses claude-sonnet-4-20250514. Target: < 250 words, < 5 seconds latency.
    API reference: https://docs.anthropic.com/en/api/messages
    """
    r = apply_scenario(scenario_id, severity_multiplier=severity)
    m = r["scenario_meta"]

    base_rev  = r["base_case"].get("FIN01", 0)
    str_rev   = r["stressed"].get("FIN01", 0)
    base_marg = r["base_case"].get("FIN03", 0)
    str_marg  = r["stressed"].get("FIN03", 0)
    base_momo = r["base_case"].get("SEG03", 0)
    str_momo  = r["stressed"].get("SEG03", 0)
    base_arpu = r["base_case"].get("OPS04", 0)
    str_arpu  = r["stressed"].get("OPS04", 0)
    n_breach  = len(r["breached_thresholds"])

    data_block = f"""
Scenario: {scenario_id} - {m['name']}
Type: {m['type']} | Severity: {m['severity']}/5 | Severity multiplier applied: {severity:.1f}×
Expected recovery: {m['recov']} quarters

Key KPI Movements (Base FY25 → Stressed):
• Service Revenue: GHS {base_rev:,.0f}m → GHS {str_rev:,.0f}m  ({r['delta_pcts'].get('FIN01',0):+.1f}%)
• EBITDA Margin:   {base_marg:.1f}% → {str_marg:.1f}%  ({r['deltas'].get('FIN03',0):+.1f}pp)
• MoMo Revenue:    GHS {base_momo:,.0f}m → GHS {str_momo:,.0f}m  ({r['delta_pcts'].get('SEG03',0):+.1f}%)
• ARPU:            GHS {base_arpu:.1f} → GHS {str_arpu:.1f}  ({r['delta_pcts'].get('OPS04',0):+.1f}%)
• KPIs in RED zone: {n_breach}

Recommended mitigation: {m['lever']}
"""

    response = client.messages.create(
        model      = "claude-sonnet-4-20250514",
        max_tokens = 600,
        system     = """You are MTN Ghana's Chief Risk Officer writing a board briefing.
Write in professional, plain English. Do not exceed 250 words.
Structure exactly as:
EXECUTIVE SUMMARY (2 sentences)
KEY IMPACTS (3 bullet points using the numbers provided)
PRIMARY RISK DRIVER (1 sentence)
RECOMMENDED ACTIONS (3 bullet points)
Be specific - use the exact numbers from the data provided.""",
        messages   = [{"role": "user", "content": f"Write a board brief:\n{data_block}"}]
    )
    return response.content[0].text
```

#### Task 3.4 - End-to-end pipeline test

Run the full pipeline on all 6 sources and validate output CSVs are within 0.5% of the KRI Framework reference values.

```bash
# Run full pipeline
python -m pipeline.run_pipeline --sources all --year 2025

# Validate against reference (Chidima writes this validator)
python scripts/validate_against_reference.py \
    --pipeline data/structured/annual.csv \
    --reference data/MTN-Ghana-KRI-Framework.xlsx \
    --tolerance 0.005
```

**Deliverable by Friday June 21:**
- `extract_figures_from_text()` pulls Ghana figures from MTN FY24 Group PDF with >85% field accuracy
- `/api/board-brief` returns a 200–250 word brief in < 6 seconds
- Pipeline end-to-end produces clean CSVs matching reference within 0.5%

---

### Chidima - LSTM Forecaster

**Tools:** Python, TensorFlow (or statsmodels ARIMA fallback), joblib

#### Task 3.5 - LSTM revenue forecaster

Create `models/train_lstm.py`. The LSTM targets two-quarter-ahead service revenue. Given the small dataset (24 quarters), use a shallow architecture with early stopping and an ARIMA fallback if TensorFlow is unavailable:

```python
# models/train_lstm.py

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
import joblib

DATA_DIR  = Path("data/structured")
MODEL_DIR = Path("models/artefacts")
LOOKBACK  = 4   # 4 quarters of history to predict next quarter


def build_sequences(data: np.ndarray, lookback: int = LOOKBACK):
    X, y = [], []
    for i in range(lookback, len(data)):
        X.append(data[i - lookback:i])
        y.append(data[i])
    return np.array(X), np.array(y)


def train_lstm_or_arima() -> dict:
    quarterly = pd.read_csv(DATA_DIR / "quarterly.csv").sort_values(["Year","Quarter"])
    features  = ["Service_Revenue", "EBITDA_Margin_Pct",
                 "Inflation_YoY_Pct", "Policy_Rate_Pct", "Cedi_USD_Rate_Avg"]
    df = quarterly[[c for c in features if c in quarterly.columns]].dropna()

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df)
    joblib.dump(scaler, MODEL_DIR / "lstm_scaler.joblib")

    X, y = build_sequences(scaled, LOOKBACK)
    y_rev = y[:, 0]   # Service_Revenue is column 0

    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from tensorflow.keras.callbacks import EarlyStopping

        if len(X) < 8:
            raise ValueError("Too few sequences for LSTM - using ARIMA")

        split = int(len(X) * 0.8)
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(16, activation="relu"),
            Dense(1)
        ])
        model.compile(optimizer="adam", loss="mse", metrics=["mae"])
        cb = EarlyStopping(patience=15, restore_best_weights=True)
        history = model.fit(X[:split], y_rev[:split], epochs=100, batch_size=4,
                            validation_data=(X[split:], y_rev[split:]),
                            callbacks=[cb], verbose=0)
        model.save(MODEL_DIR / "lstm_revenue.h5")
        val_mae = float(min(history.history.get("val_mae", [0])))
        print(f"  ✓ LSTM trained. Val MAE = {val_mae:.4f}")
        return {"model": "lstm", "val_mae": val_mae, "sequences": len(X)}

    except Exception as e:
        print(f"  [INFO] LSTM not available ({e}). Training ARIMA fallback.")
        from statsmodels.tsa.arima.model import ARIMA
        revenue = df["Service_Revenue"].values
        arima   = ARIMA(revenue, order=(2, 1, 1)).fit()
        joblib.dump(arima, MODEL_DIR / "arima_revenue.joblib")
        print(f"  ✓ ARIMA(2,1,1) trained. AIC = {arima.aic:.2f}")
        return {"model": "arima", "aic": arima.aic}


if __name__ == "__main__":
    result = train_lstm_or_arima()
    print(result)
```

Add forecast endpoint to `api/main.py`:

```python
@app.get("/api/forecast")
def get_forecast():
    """Return 2-quarter ahead revenue forecast with confidence interval."""
    from pathlib import Path
    import joblib, numpy as np, pandas as pd

    MODEL_DIR = Path("models/artefacts")
    DATA_DIR  = Path("data/structured")

    quarterly = pd.read_csv(DATA_DIR / "quarterly.csv").sort_values(["Year","Quarter"])
    last_4    = quarterly.tail(4)[["Service_Revenue","EBITDA_Margin_Pct",
                                   "Inflation_YoY_Pct","Policy_Rate_Pct","Cedi_USD_Rate_Avg"]]
    last_4    = last_4.fillna(method="ffill")

    # Try LSTM first, then ARIMA
    if (MODEL_DIR / "lstm_revenue.h5").exists():
        import tensorflow as tf
        model  = tf.keras.models.load_model(MODEL_DIR / "lstm_revenue.h5")
        scaler = joblib.load(MODEL_DIR / "lstm_scaler.joblib")
        scaled = scaler.transform(last_4)
        X      = scaled.reshape(1, 4, scaled.shape[1])
        pred1  = float(model.predict(X, verbose=0)[0][0])
        # Simple 95% interval via ±15% based on historical MAPE
        return {"model": "lstm", "q1_forecast": pred1,
                "q1_low": pred1 * 0.85, "q1_high": pred1 * 1.15}
    elif (MODEL_DIR / "arima_revenue.joblib").exists():
        arima  = joblib.load(MODEL_DIR / "arima_revenue.joblib")
        fc     = arima.forecast(steps=2)
        ci     = arima.get_forecast(steps=2).conf_int()
        return {"model": "arima",
                "q1_forecast": float(fc.iloc[0]), "q2_forecast": float(fc.iloc[1]),
                "q1_low": float(ci.iloc[0, 0]), "q1_high": float(ci.iloc[0, 1])}
    else:
        raise HTTPException(503, "No forecast model available - run train_lstm_or_arima()")
```

**Deliverable by Friday June 21:**
- LSTM or ARIMA trained and saved
- `/api/forecast` returns two-quarter-ahead projections
- Forecast chart added to Tab 02 in dashboard

---

### Daasebre - Tab 05 Print Export + SHAP Card Wiring

**Tools:** VS Code, Chrome DevTools, print CSS

#### Task 3.6 - Wire SHAP data into Tab 04

When `recomputeScenario()` fires and `API_BASE` is set, call `/api/scenarios/compute` and use the response to populate the SHAP card. If `API_BASE` is not set (offline mode), hide the SHAP card gracefully.

Update the `recomputeScenario()` function:

```javascript
async function recomputeScenario() {
  // ... existing synchronous computation still runs for offline mode ...
  if (!state.baseCase || !state.scenarios) return;
  const result = computeScenarioOutput();   // existing function - keep for offline
  if (!result) return;
  state.scenarioOutput = result;
  renderWaterfalls(result);
  renderHeatmap(result);

  // If API is available, fetch enriched result with SHAP
  if (typeof API_BASE !== 'undefined' && API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/compute`, {
        method : 'POST',
        headers: {'Content-Type': 'application/json'},
        body   : JSON.stringify({
          scenario_id        : state.currentScenario,
          severity_multiplier: +document.getElementById('sev-mult').value / 100,
          macro_overrides    : null
        })
      });
      if (res.ok) {
        const apiResult = await res.json();
        if (apiResult.shap_explanation) renderSHAPCard(apiResult.shap_explanation);
      }
    } catch (e) {
      // API unavailable - SHAP card stays hidden, no error shown to user
    }
  }
}

function renderSHAPCard(shap) {
  const card = document.getElementById('shap-card');
  if (!card || !shap.ranked_drivers) return;
  card.style.display = 'block';
  const drivers = shap.ranked_drivers.slice(0, 6);
  const maxAbs  = Math.max(...drivers.map(d => Math.abs(shap.explanation[d]?.shap_value || 0)));
  document.getElementById('shap-drivers').innerHTML = drivers.map(driver => {
    const d     = shap.explanation[driver];
    const width = maxAbs > 0 ? (Math.abs(d.shap_value) / maxAbs * 100).toFixed(1) : 0;
    const color = d.direction === 'increases_risk' ? 'var(--red)' : 'var(--green)';
    const sign  = d.shap_value > 0 ? '+' : '';
    return `<div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
      <span style="font-family:'JetBrains Mono',monospace; font-size:10px;
                   color:var(--mute); width:160px; overflow:hidden; text-overflow:ellipsis;
                   white-space:nowrap;">${driver.replace(/_/g,' ')}</span>
      <div style="flex:1; background:rgba(11,18,32,0.06); height:6px; border-radius:3px;">
        <div style="width:${width}%; height:6px; background:${color}; border-radius:3px;"></div>
      </div>
      <span style="font-family:'JetBrains Mono',monospace; font-size:10px; width:52px;
                   text-align:right; color:${color};">${sign}${d.shap_value.toFixed(4)}</span>
    </div>`;
  }).join('');
}
```

#### Task 3.7 - Tab 05 print export

Add print button to Tab 05 HTML and print CSS to the style block:

```html
<!-- Add to Tab 05 section header -->
<button onclick="window.print()" class="file-btn ghost"
        style="font-size:12px; padding:8px 16px;">
  <svg viewBox="0 0 16 16" fill="currentColor" style="width:12px;height:12px;">
    <path d="M5 1h6v3H5V1zM2 5h12v7H2V5zm2 2v3h8V7H4z"/>
  </svg>
  Export PDF
</button>
```

Add to `<style>` block:

```css
@media print {
  .masthead, .loader-bar, .tab-bar, .file-btn,
  #brief-btn, #sweep-btn, button { display: none !important; }
  .tab-content { display: block !important; }
  #tab-register, #tab-quarterly, #tab-monthly,
  #tab-scenarios, #tab-reverse { display: none !important; }
  #tab-compare { display: block !important; }
  .chart-card { break-inside: avoid; }
  body { background: white; color: black; }
  @page { margin: 20mm; }
}
```

**Deliverable by Friday June 21:**
- SHAP card renders correctly when API is reachable; hidden gracefully when offline
- Print button on Tab 05 produces clean PDF of comparison view
- Board brief modal fully wired to `/api/board-brief` endpoint

---

### Week 3 Friday Sync - June 21, 5 PM

Full end-to-end run-through, Daasebre drives the browser:
- Load dashboard → load Excel → Tab 04 → select S24 Stagflation → SHAP card loads via API → Generate Board Brief → show modal text
- Tab 05 → Export PDF → confirm print preview is clean
- Tab 06 → set FIN03 floor = 50% → Run All 56 Scenarios → breach ranking chart loads

The system should feel like a finished product. Remaining work is hardening and documentation.

---

## Week 4 - June 22–29: Hardening & Delivery

**Theme:** Production quality. Every edge case handled. Everything documented. Demo-ready.

---

### Foureira - Scenario Validation & Methodology

**Tools:** Python, pandas, Excel

#### Task 4.1 - Back-test original 14 scenarios

Run `apply_scenario()` for S01–S14 at severity 1.0. Compare results against the values in the original Excel framework. Tolerance is ±2%. Document any discrepancies in `scenario_validation_report.md`.

```python
# scripts/validate_scenarios.py

import pandas as pd
from pipeline.scenario_engine import apply_scenario

# Load reference values from original Excel
reference = pd.read_excel("data/MTN-Ghana-KRI-Framework.xlsx",
                           sheet_name="Scenario Library")

original_ids = [f"S{i:02d}" for i in range(1, 15)]
issues = []

for sc_id in original_ids:
    try:
        result = apply_scenario(sc_id, 1.0)
        # Compare FIN01 and FIN03 stressed values against reference rows
        ref_rows = reference[reference["Scenario_ID"] == sc_id]
        for _, row in ref_rows.iterrows():
            kpi_id    = row["KPI_ID"]
            ref_val   = row.get("Reference_Stressed_Value")
            if pd.isna(ref_val): continue
            computed  = result["stressed"].get(kpi_id)
            if computed is None: continue
            pct_diff  = abs(computed - ref_val) / abs(ref_val) * 100
            if pct_diff > 2.0:
                issues.append({
                    "scenario": sc_id, "kpi": kpi_id,
                    "reference": ref_val, "computed": computed, "diff_pct": pct_diff
                })
    except Exception as e:
        print(f"  [ERROR] {sc_id}: {e}")

if issues:
    print(f"\n{len(issues)} validation issues found:")
    for issue in issues:
        print(f"  {issue['scenario']} {issue['kpi']}: ref={issue['reference']:.2f}, "
              f"computed={issue['computed']:.2f}, diff={issue['diff_pct']:.1f}%")
else:
    print("\n✓ All 14 original scenarios validated within 2% tolerance")
```

#### Task 4.2 - Scenario methodology document

Write `scenario_methodology.md` covering:
- How impact elasticities were derived from FY22–FY25 history
- Why nominal vs real revenue matters for macro scenarios
- Why compound scenarios (S11, S32, S56) cannot simply be additive
- Back-test results for S01, S02, S11 against actual FY22 data
- Known limitations (6-year data window, no sub-annual granularity, qualitative overlay on tail scenarios)

**Deliverable by June 29:**
- `scenario_validation_report.md` committed - all 14 original scenarios within tolerance
- `scenario_methodology.md` committed - suitable for a technical reviewer at MTN Group

---

### Emmanuel - Deployment & CI/CD

**Tools:** GitHub Actions, AWS EC2 (or Railway), Let's Encrypt, Locust

#### Task 4.3 - GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD - Build, Test, Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt
      - run: python -m pytest tests/ -v --tb=short
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host    : ${{ secrets.EC2_HOST }}
          username: ubuntu
          key     : ${{ secrets.EC2_SSH_KEY }}
          script  : |
            cd /opt/mtn_quantrisk
            git pull origin main
            docker compose down
            docker compose build --no-cache
            docker compose up -d
            sleep 10
            curl -f http://localhost:8000/api/pipeline/status || exit 1
            echo "Deployment verified ✓"
```

#### Task 4.4 - Load test

Install and run Locust:

```bash
pip install locust

# locustfile.py
from locust import HttpUser, task, between

class DashboardUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def get_base_case(self):
        self.client.get("/api/base-case")

    @task(3)
    def compute_scenario(self):
        self.client.post("/api/scenarios/compute", json={
            "scenario_id": "S01", "severity_multiplier": 1.0
        })

    @task(1)
    def reverse_stress(self):
        self.client.post("/api/reverse-stress", json={
            "target_kpi": "FIN03", "breach_floor": 50.0
        })

# Run: locust -f locustfile.py --headless -u 100 -r 10 --run-time 60s --host http://localhost:8000
```

Target: p95 latency < 500ms for `/api/base-case` and `/api/scenarios/compute` at 100 concurrent users. `/api/reverse-stress` (which runs 56 scenarios) may be up to 3 seconds - acceptable.

**Deliverable by June 29:**
- Dashboard live at a public URL (share with team by June 27)
- CI/CD pipeline green - every push to `main` auto-deploys
- Locust test shows p95 < 500ms for compute endpoint at 100 concurrent users
- `deployment_runbook.md` committed

---

### Chidima - Monte Carlo & Model Card

**Tools:** Python, numpy, `models/monte_carlo.py`

#### Task 4.5 - Monte Carlo simulation

Create `models/monte_carlo.py`:

```python
# models/monte_carlo.py

import numpy as np
from pipeline.scenario_engine import apply_scenario

TARGET_KPIS = ["FIN01", "FIN02", "FIN03", "FIN04", "SEG03", "OPS04"]


def monte_carlo_scenario(
    scenario_id    : str,
    n_simulations  : int   = 10_000,
    severity_mean  : float = 1.0,
    severity_std   : float = 0.2
) -> dict:
    """
    Treat severity as a random variable ~ Normal(mean, std).
    Run n_simulations and return full distributional statistics per KPI.

    VaR_95 = 5th percentile of the distribution (worst 5% of outcomes)
    CVaR_95 = mean of all outcomes below VaR_95 (expected shortfall)
    """
    results = {kpi: [] for kpi in TARGET_KPIS}

    for _ in range(n_simulations):
        sev = max(0.0, float(np.random.normal(severity_mean, severity_std)))
        r   = apply_scenario(scenario_id, severity_multiplier=sev)
        for kpi in TARGET_KPIS:
            results[kpi].append(r["stressed"].get(kpi, 0.0))

    summary = {}
    for kpi, vals in results.items():
        arr = np.array(vals)
        var_95  = float(np.percentile(arr, 5))
        cvar_95 = float(np.mean(arr[arr <= var_95]))
        summary[kpi] = {
            "mean"   : round(float(np.mean(arr)), 2),
            "std"    : round(float(np.std(arr)), 2),
            "p5"     : round(float(np.percentile(arr, 5)), 2),
            "p25"    : round(float(np.percentile(arr, 25)), 2),
            "p50"    : round(float(np.percentile(arr, 50)), 2),
            "p75"    : round(float(np.percentile(arr, 75)), 2),
            "p95"    : round(float(np.percentile(arr, 95)), 2),
            "var_95" : round(var_95, 2),
            "cvar_95": round(cvar_95, 2),
        }

    return {"scenario_id": scenario_id, "n_simulations": n_simulations,
            "severity_mean": severity_mean, "kpi_distributions": summary}
```

Add Monte Carlo endpoint to `api/main.py`:

```python
class MonteCarloRequest(BaseModel):
    scenario_id   : str
    n_simulations : int   = 10000
    severity_mean : float = 1.0
    severity_std  : float = 0.2

@app.post("/api/monte-carlo")
def run_monte_carlo(req: MonteCarloRequest):
    from models.monte_carlo import monte_carlo_scenario
    return monte_carlo_scenario(req.scenario_id, req.n_simulations,
                                req.severity_mean, req.severity_std)
```

#### Task 4.6 - Model card

Write `models/MODEL_CARD.md`:

```markdown
# MTN QuantRisk - Model Card

## XGBoost Financial Impact Models (v1.0)

**Training data:** MTN Ghana annual data FY2020–FY2025 (6 observations)
augmented with 56 scenario-derived synthetic rows = 62 effective training points.
Real (inflation-adjusted) revenue growth used, not nominal.

**Feature set:** Ghana CPI inflation, BoG policy rate, Cedi/USD rate,
real GDP growth, mobile penetration, data penetration.

**Evaluation:** Leave-One-Out cross-validation (appropriate for n < 30).

| Target KPI | LOO MAE | LOO R² | Top SHAP Driver |
|-----------|---------|--------|----------------|
| EBITDA Margin % | [fill] | [fill] | [fill] |
| Revenue Growth % | [fill] | [fill] | [fill] |
| MoMo Revenue | [fill] | [fill] | [fill] |
| ARPU | [fill] | [fill] | [fill] |

**Known limitations:**
- 6-year training window does not capture a full economic cycle
- Nominal revenue repricing behaviour (FY22) is partially captured via scenario augmentation but not perfectly
- Models should be retrained when 2026 annual data is available

## LSTM / ARIMA Forecaster (v1.0)

**Target:** Service Revenue, 2-quarter ahead
**Training:** 24 quarters of MTN Ghana quarterly data (FY2020–FY2025)
**Architecture:** LSTM(64) → Dropout(0.2) → LSTM(32) → Dense(1), or ARIMA(2,1,1) fallback
**Confidence interval:** ±15% (approximate, based on historical MAPE)
```

**Deliverable by June 29:**
- `monte_carlo_scenario("S11", n_simulations=10000)` runs in < 30 seconds
- `/api/monte-carlo` endpoint live and documented in Swagger
- `MODEL_CARD.md` committed with actual MAE/R² values filled in from training run

---

### Daasebre - Final Polish & Demo Deck

**Tools:** VS Code, Chrome, mobile browser for responsiveness testing

#### Task 4.7 - Mobile responsiveness

Test all three tabs on a 375px viewport (iPhone SE) and 768px viewport (iPad). Required fixes:
- `.scenario-layout` collapses to single column below 768px
- `.reverse-grid` collapses below 768px
- KPI tiles wrap to 2×2 grid on mobile
- Breach ranking chart readable on mobile (labels truncated to 20 chars)
- Board brief modal scrollable on mobile

The existing responsive CSS already handles most of this - verify it works with the new elements added in Weeks 2–3.

#### Task 4.8 - Final demo script (25 minutes)

| # | What to show | Who drives | Duration |
|---|-------------|-----------|---------|
| 1 | Open dashboard, load Excel, all 56 scenarios appear in list | Daasebre | 2 min |
| 2 | Select S24 Stagflation @ 1.5×, show waterfall + KPI tiles | Daasebre | 2 min |
| 3 | SHAP card loads - show "Inflation_YoY_Pct is the top driver" | Daasebre | 2 min |
| 4 | Generate Board Brief - show 250-word CRO narrative live | Daasebre | 2 min |
| 5 | Switch to Tab 05, show grouped bar charts + print to PDF | Daasebre | 2 min |
| 6 | Switch to Tab 06, single scenario back-solver for S11 + FIN03 | Daasebre | 2 min |
| 7 | Click "Run All 56 Scenarios" - breach ranking chart loads | Daasebre | 3 min |
| 8 | Show top 3 narrative cards - S32, S56, S29 most dangerous | Daasebre | 2 min |
| 9 | Show FastAPI `/docs` - all 10 endpoints live | Emmanuel | 2 min |
| 10 | Show pipeline status - CSVs last updated timestamps | Emmanuel | 1 min |
| 11 | Show `training_results.json` - model MAE table | Chidima | 2 min |
| 12 | Show `scenario_methodology.md` - calibration logic | Foureira | 1 min |

**Deliverable by June 29:**
- Mobile responsiveness verified on 375px and 768px viewports
- Zero console errors in Chrome DevTools on all three tabs
- Demo runs cleanly end-to-end in ≤ 25 minutes

---

## Final Deliverables Summary

| # | Deliverable | Owner | Due Date |
|---|-------------|-------|---------|
| 1 | `scenario_library.csv` - 56 calibrated scenarios (≥400 rows) | Foureira | June 7 |
| 2 | `scenario_calibration_notes.md` - derivation audit trail | Foureira | June 7 |
| 3 | `pipeline/scenario_engine.py` - `apply_scenario()` + `run_all_scenarios()` | Foureira | June 14 |
| 4 | `pipeline/reverse_stress.py` - binary search + cross-scenario ranking | Foureira | June 14 |
| 5 | Tab 06 cross-scenario breach ranking chart + narrative cards | Foureira | June 21 |
| 6 | `scenario_validation_report.md` - 14 original scenarios ≤2% tolerance | Foureira | June 29 |
| 7 | `scenario_methodology.md` - calibration methodology for MTN Group audience | Foureira | June 29 |
| 8 | Docker stack - `docker compose up` runs all 5 services | Emmanuel | June 7 |
| 9 | `data/source_audit.md` + 6 PDFs in `data/raw_pdfs/` | Emmanuel | June 7 |
| 10 | `pipeline/classifier.py` + `pipeline/extractor/tables.py` | Emmanuel | June 14 |
| 11 | LLM extraction fallback - `pipeline/extractor/narrative.py` | Emmanuel | June 21 |
| 12 | `pipeline/narrative_generator.py` + `/api/board-brief` endpoint | Emmanuel | June 21 |
| 13 | Full pipeline end-to-end - CSVs match reference ≤0.5% | Emmanuel | June 21 |
| 14 | CI/CD via GitHub Actions + public URL deployment | Emmanuel | June 29 |
| 15 | `deployment_runbook.md` | Emmanuel | June 29 |
| 16 | All CSVs exported from Excel + `notebooks/01_eda_feature_engineering.ipynb` | Chidima | June 7 |
| 17 | 6 XGBoost models in `models/artefacts/` + `training_results.json` | Chidima | June 14 |
| 18 | `models/explain.py` - SHAP explainability working for FIN03 | Chidima | June 14 |
| 19 | LSTM/ARIMA forecaster + `/api/forecast` endpoint | Chidima | June 21 |
| 20 | `models/monte_carlo.py` + `/api/monte-carlo` endpoint | Chidima | June 29 |
| 21 | `models/MODEL_CARD.md` with actual MAE/R² values | Chidima | June 29 |
| 22 | `dashboard_audit.md` + local dev environment | Daasebre | June 7 |
| 23 | `api/main.py` skeleton - all 10 endpoints stubbed | Daasebre | June 14 |
| 24 | Tab 04: pillar filter + SHAP card HTML + board brief modal | Daasebre | June 14 |
| 25 | Tab 04: SHAP card wired to API + board brief live | Daasebre | June 21 |
| 26 | Tab 05: print export + comparison table fully populated | Daasebre | June 21 |
| 27 | Mobile responsiveness - 375px and 768px clean | Daasebre | June 29 |
| 28 | Zero console errors - all three tabs | Daasebre | June 29 |
| 29 | Final demo deck + live 25-minute demo | Daasebre | June 29 |

---

## Risk Register

| Risk | Likelihood | Impact | Owner | Mitigation |
|------|-----------|--------|-------|-----------|
| MTN changes PDF layout between FY24 and FY25 | High | Medium | Emmanuel | Column aliases in `mapper.py` absorb label changes; LLM fallback handles structural changes |
| PDF is scanned (no text layer) | Medium | High | Emmanuel | `pytesseract` OCR in `extractor/ocr.py`; flag for manual review if OCR confidence < 80% |
| BoG or NCA URL pattern changes | Low | Medium | Emmanuel | Monitor HTTP 404s in scheduler; update `sources.yaml`; alert Slack |
| Small training dataset (6 years → 62 rows with augmentation) | High | Medium | Chidima | Leave-One-Out CV; synthetic augmentation; shallow trees (max_depth=3); document in MODEL_CARD |
| TensorFlow unavailable in deployment | Medium | Low | Chidima | ARIMA(2,1,1) fallback pre-built; LSTM is enhancement not requirement |
| ANTHROPIC_API_KEY not set in production | Medium | High | Emmanuel | Add to GitHub Secrets; test in CI; dashboard falls back to offline mode gracefully |
| `/api/reverse-stress` too slow (56 scenarios × binary search) | Medium | Medium | Foureira | Pre-compute all breach severities nightly via Celery task; serve from cache |
| Scenario impact values miscalibrated (fail back-test) | Medium | High | Foureira | Script `scripts/validate_scenarios.py` runs against reference in CI |

---

## Key Reference Links

| Resource | URL | Used By |
|----------|-----|---------|
| Anthropic API docs | https://docs.anthropic.com/en/api/getting-started | Emmanuel, Daasebre |
| Claude Models list | https://docs.anthropic.com/en/docs/about-claude/models | Emmanuel |
| FastAPI documentation | https://fastapi.tiangolo.com | Emmanuel |
| pdfplumber GitHub | https://github.com/jsvine/pdfplumber | Emmanuel |
| Camelot docs | https://camelot-py.readthedocs.io | Emmanuel |
| XGBoost Python API | https://xgboost.readthedocs.io/en/stable/python/python_api.html | Chidima |
| SHAP docs | https://shap.readthedocs.io/en/latest/ | Chidima |
| Chart.js docs | https://www.chartjs.org/docs/latest/ | Daasebre |
| SheetJS (XLSX) | https://sheetjs.com/docs/ | Daasebre |
| MTN Investor Relations | https://www.mtn.com/investor-relations/financial-results/ | Emmanuel |
| Bank of Ghana data | https://www.bog.gov.gh/economic-data/ | Emmanuel |
| NCA market data | https://nca.org.gh/industry-information/market-data/ | Emmanuel |
| GSE company reports | https://gse.com.gh/trading-and-data/company-reports/ | Emmanuel |
| Celery docs | https://docs.celeryq.dev/en/stable/ | Emmanuel |
| Docker Compose reference | https://docs.docker.com/compose/compose-file/ | Emmanuel |

---

*MTN QuantRisk Intelligence Platform - Master Execution Plan v4.0*
*Foureira · Chidima · Emmanuel · Daasebre*
*June 1 – June 29, 2026*