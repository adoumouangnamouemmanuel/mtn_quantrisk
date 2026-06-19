# MTN QuantRisk — Backend Guide

Complete reference for setting up, running, and extending the FastAPI backend.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Running the Server](#4-running-the-server)
5. [Environment Variables](#5-environment-variables)
6. [API Reference](#6-api-reference)
7. [Data Files](#7-data-files)
8. [ML Models](#8-ml-models)
9. [Monte Carlo Engine](#9-monte-carlo-engine)
10. [Pipeline Modules](#10-pipeline-modules)
11. [Services](#11-services)
12. [Testing](#12-testing)
13. [Common Errors & Fixes](#13-common-errors--fixes)

---

## 1. Project Structure

```
mtn_quantrisk/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── schemas.py               # Pydantic request/response models
│   │   ├── api/
│   │   │   └── routes.py            # All API routes
│   │   └── services/
│   │       ├── data_loader.py       # CSV readers, KPI metadata, LRU cache
│   │       ├── scenario_service.py  # Scenario CRUD + stress application
│   │       ├── reverse_service.py   # Reverse stress binary search solver
│   │       ├── history_service.py   # Quarterly / monthly time-series
│   │       ├── upload_service.py    # CSV & PDF upload processing
│   │       ├── feedback_service.py  # User feedback persistence
│   │       └── log_service.py       # Base-case change audit log
│   └── requirements.txt            # PDF pipeline extra deps
├── models/
│   ├── monte_carlo.py              # Stochastic simulation engine
│   ├── train_impact_model.py       # XGBoost training script
│   ├── train_lstm.py               # ARIMA/LSTM training script
│   ├── explain.py                  # SHAP explainability
│   └── artefacts/                  # Trained .joblib model files
│       ├── arima_revenue.joblib
│       ├── ebitda_margin.joblib
│       ├── revenue_growth.joblib
│       ├── arpu.joblib
│       ├── momo_revenue.joblib
│       ├── pat_margin.joblib
│       ├── data_revenue_growth.joblib
│       ├── feature_scaler.joblib
│       └── training_results.json
├── pipeline/
│   ├── scenario_engine.py          # Core scenario stress calculator
│   ├── classifier.py               # KPI risk classifier
│   ├── reverse_stress.py           # Reverse stress standalone runner
│   └── extractor/
│       └── tables.py               # PDF table extraction
├── data/
│   └── structured/                 # All CSV data files
│       ├── base_case.csv
│       ├── scenario_library.csv
│       ├── annual.csv
│       ├── macro_context.csv
│       └── ...
├── tests/
│   ├── test_classifier.py
│   └── test_extractor_tables.py
├── start_backend.sh                # Bash start script
└── requirements.txt                # Main Python dependencies
```

---

## 2. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.12+ | Must be the conda env — not system Python |
| Conda | any | Used to manage the `.conda` env |
| Node.js | 18+ | For the frontend only |
| Git Bash | any | Needed to run `start_backend.sh` |

> **Important:** The project uses a local conda environment at `.conda/` inside the `data mtn/` parent folder. Always use that Python, not the system one.
>
> Full path: `<repo-parent>/.conda/python.exe`

---

## 3. Installation

### 3.1 Create the Conda Environment (first time only)

```bash
# From the parent "data mtn/" directory
conda create --prefix .conda python=3.12 -y
conda activate ./.conda
```

### 3.2 Install Core Dependencies

```bash
pip install fastapi uvicorn[standard] pydantic python-multipart \
            pandas numpy scikit-learn xgboost joblib \
            statsmodels python-dateutil anthropic
```

### 3.3 Install PDF Pipeline Dependencies

```bash
pip install pdfplumber>=0.11.0 pymupdf>=1.24.0 \
            pytesseract>=0.3.10 camelot-py[cv]>=0.11.0
```

> `camelot-py[cv]` requires `ghostscript` and `opencv`. If it fails, install without `[cv]`:
> ```bash
> pip install camelot-py pandas
> ```

### 3.4 Full Requirements in One Command

```bash
pip install fastapi uvicorn[standard] pydantic python-multipart \
            pandas numpy scikit-learn xgboost joblib statsmodels \
            python-dateutil anthropic pdfplumber pymupdf \
            pytesseract camelot-py pytest
```

### 3.5 Verify Installation

```bash
python -c "import fastapi, uvicorn, pandas, xgboost, pdfplumber; print('All OK')"
```

---

## 4. Running the Server

### Using the Bash Script (recommended)

```bash
# From mtn_quantrisk/ directory
bash start_backend.sh
```

The script automatically resolves the conda Python path. The API starts at:

```
http://127.0.0.1:8001
```

### Manual Start

```bash
# From mtn_quantrisk/ directory — use the conda python explicitly
"<path-to>/.conda/python.exe" -m uvicorn backend.app.main:app \
    --host 127.0.0.1 --port 8001 --reload
```

### Swagger UI (interactive docs)

Open in browser: `http://127.0.0.1:8001/docs`

### Verify it's running

```bash
curl http://127.0.0.1:8001/
# Expected: {"status":"ok","service":"MTN QuantRisk API"}
```

---

## 5. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Enables LLM-assisted PDF KPI extraction. Falls back to raw table extraction if not set. |

Set it in your shell before starting:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
bash start_backend.sh
```

Or add it to a `.env` file (not committed to git):

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6. API Reference

Base URL: `http://127.0.0.1:8001/api`

All endpoints return JSON. Interactive docs at `/docs`.

---

### KPIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/kpis` | All 14 KPIs with current status, thresholds, and 24-month trend |

**Response shape:**
```json
[
  {
    "id": "FIN01",
    "name": "Service Revenue",
    "category": "Financial",
    "unit": "GHSm",
    "fy25Value": 24400.0,
    "lowerThreshold": 23000.0,
    "upperThreshold": 26000.0,
    "currentStatus": "Safe",
    "trend24m": [21000, 21800, ...]
  }
]
```

---

### Scenarios

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scenarios` | List all stress scenarios |
| GET | `/api/scenarios/{id}` | Get single scenario |
| POST | `/api/scenarios` | Create new scenario |
| PUT | `/api/scenarios/{id}` | Update scenario |
| DELETE | `/api/scenarios/{id}` | Delete scenario |
| POST | `/api/scenarios/{id}/run` | Apply scenario and get stressed KPI outputs |

**Run scenario request body:**
```json
{
  "severityMultiplier": 1.0,
  "macroOverlays": {
    "cediShockPct": 0,
    "inflationOverlayPp": 0,
    "policyRateOverlayPp": 0
  }
}
```

**Run scenario response:**
```json
{
  "scenarioId": "S01",
  "severityMultiplier": 1.0,
  "results": [
    {
      "kpiId": "FIN01",
      "baseValue": 24400.0,
      "scenarioValue": 22800.0,
      "deltaPct": -6.56,
      "status": "Warning"
    }
  ],
  "shapAttributions": [...],
  "generatedAt": "2026-06-19T..."
}
```

---

### Forecasts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/forecast/{kpi_id}?horizon=90` | 90-day forecast with confidence bands |

- `FIN01` (Service Revenue): uses trained **ARIMA model** from `models/artefacts/arima_revenue.joblib`
- All other KPIs: random-walk fallback until their models are trained

**Response:** Array of daily forecast points:
```json
[
  {
    "date": "2026-06-19",
    "median": 24400.0,
    "p50": 24400.0,
    "p05": 20840.0,
    "p95": 27960.0,
    "isHistorical": false
  }
]
```

---

### Historical Time-Series

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/quarterly/{kpi_id}` | Quarterly values for a KPI |
| GET | `/api/monthly/{kpi_id}?n_months=36` | Monthly values (trailing 36 months default) |

---

### Reverse Stress

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reverse-stress` | Find which scenario and severity multiplier would breach a KPI threshold |

**Request body:**
```json
{
  "kpiId": "FIN01",
  "operator": "dropsBy",
  "threshold": 10.0,
  "scenarioId": null
}
```

Operators: `lt` | `gt` | `dropsBy` | `risesAbove`

---

### Monte Carlo

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/monte-carlo` | Run stochastic simulation — returns percentile distributions per KPI |

**Request body:**
```json
{
  "scenarioId": "S01",
  "nSimulations": 1000,
  "severityMultiplier": 1.0,
  "uncertaintyPct": 0.20
}
```

**Response:**
```json
{
  "scenarioId": "S01",
  "nSimulations": 1000,
  "uncertaintyPct": 0.2,
  "results": [
    {
      "kpiId": "FIN01",
      "kpiName": "Service Revenue",
      "unit": "GHSm",
      "baseValue": 24400.0,
      "p05": 19250.0,
      "p25": 21900.0,
      "p50": 24400.0,
      "p75": 26900.0,
      "p95": 29550.0,
      "mean": 24400.0,
      "std": 3150.0,
      "worstCase": 17500.0,
      "bestCase": 32000.0
    }
  ]
}
```

---

### Upload

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/csv` | Upload a CSV to update base-case KPI values |
| POST | `/api/upload/pdf` | Upload an MTN annual report PDF — extracts KPI candidates |
| POST | `/api/upload/pdf/apply` | Apply selected PDF-extracted KPI candidates to base case |

**CSV format** — must include these columns:
```
KPI_ID, FY25_Base_Value
FIN01,  24400
FIN02,  14800
...
```

**PDF upload response:**
```json
{
  "filename": "annual_mtn_25.pdf",
  "candidates": [
    {
      "kpiId": "FIN01",
      "kpiName": "Service Revenue",
      "value": 24400,
      "unit": "GHSm",
      "confidence": "high"
    }
  ]
}
```

---

### Feedback

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit user feedback on a prediction or alert |
| GET | `/api/feedback?limit=50` | Retrieve feedback entries |

**Request body:**
```json
{
  "page": "forecasts",
  "feedbackType": "wrong_prediction",
  "rating": "negative",
  "message": "The forecast seems too optimistic.",
  "context": {}
}
```

`feedbackType` options: `wrong_prediction` | `false_alert` | `inaccurate` | `other`

Feedback is persisted to `data/logs/feedback.json`.

---

### Logs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/logs/base-case?limit=100` | Audit log of all base-case KPI changes |

Logs are persisted to `data/logs/base_case_changes.json`.

---

### Pipeline Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check status of all data sources and ML models |

```json
{
  "status": "Healthy",
  "lastBeatAt": "2026-06-19T10:00:00Z",
  "sources": [
    { "name": "Base Case CSV",      "status": "Healthy", "latencyMs": 3 },
    { "name": "Scenario Library CSV","status": "Healthy", "latencyMs": 2 },
    { "name": "ML Models (XGBoost)","status": "Healthy", "latencyMs": 0 }
  ]
}
```

---

### Board Briefs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/briefs` | List all board briefs |
| POST | `/api/briefs/generate` | Generate a new comparative brief |

---

### Retrain

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/retrain` | Re-run XGBoost training on current data files |

Triggers `models/train_impact_model.py` inline. Returns updated training metrics.

---

## 7. Data Files

All structured data lives in `data/structured/`. These are the source of truth for the API.

| File | Contents |
|---|---|
| `base_case.csv` | Current FY25 base-case values for all 14 KPIs |
| `scenario_library.csv` | Per-KPI impact rows for every stress scenario |
| `scenario_library_augmented.csv` | Augmented library used during XGBoost training |
| `annual.csv` | Annual financial statements (FY20–FY25) |
| `macro_context.csv` | Macro variables: inflation, FX, policy rate, GDP growth |
| `segments_annual.csv` | Annual segment breakdown (voice, data, MoMo) |
| `segments_quarterly.csv` | Quarterly segment data |
| `operational_annual.csv` | Subscribers, ARPU, coverage — annual |
| `operational_quarterly.csv` | Subscribers, ARPU, coverage — quarterly |
| `quarterly.csv` | Quarterly P&L |
| `halfyearly.csv` | Half-year P&L |
| `kri_register.csv` | Full KRI register with thresholds and owners |
| `macro_context.csv` | Macro time-series |
| `thresholds.csv` | KPI warning/critical thresholds |
| `leading_indicators.csv` | Leading indicator data |
| `derived_ratios.csv` | Derived financial ratios |

### KPI IDs

| ID | Name | Unit | Category |
|---|---|---|---|
| FIN01 | Service Revenue | GHSm | Financial |
| FIN02 | EBITDA | GHSm | Financial |
| FIN03 | EBITDA Margin | % | Financial |
| FIN04 | PAT | GHSm | Financial |
| FIN05 | PAT Margin | % | Financial |
| FIN06 | Revenue Growth YoY | % | Financial |
| SEG01 | Data Revenue | GHSm | Segment |
| SEG03 | MoMo Revenue | GHSm | Segment |
| OPS01 | Total Subscribers | M | Operational |
| OPS04 | ARPU | GHS | Operational |
| OPS07 | 4G Coverage | % | Operational |
| EXT01 | Inflation | % | External |
| EXT02 | BoG Policy Rate | % | External |
| EXT03 | Cedi/USD | GHS/USD | External |

---

## 8. ML Models

All trained models are saved as `.joblib` files in `models/artefacts/`.

| File | Target KPI | Algorithm |
|---|---|---|
| `revenue_growth.joblib` | FIN06 – Revenue Growth YoY | XGBoost |
| `ebitda_margin.joblib` | FIN03 – EBITDA Margin | XGBoost |
| `pat_margin.joblib` | FIN05 – PAT Margin | XGBoost |
| `momo_revenue.joblib` | SEG03 – MoMo Revenue | XGBoost |
| `arpu.joblib` | OPS04 – ARPU | XGBoost |
| `data_revenue_growth.joblib` | SEG01 – Data Revenue | XGBoost |
| `feature_scaler.joblib` | Input normalisation | StandardScaler |
| `arima_revenue.joblib` | FIN01 – Service Revenue | ARIMA |

### Training Features (macro inputs)

```
Inflation_YoY_Pct
Policy_Rate_Pct
Cedi_USD_Avg
GDP_Growth_Pct
Mobile_Penetration_Pct
Data_Penetration_Pct
```

### Retrain XGBoost Models

```bash
cd mtn_quantrisk/
python models/train_impact_model.py
```

This uses Leave-One-Out cross-validation (appropriate for the small dataset of ~6 real rows + synthetic augmentation from scenarios). Results are saved to `models/artefacts/training_results.json`.

### Retrain ARIMA Model

```bash
python models/train_lstm.py
```

### Retrain via API (no terminal needed)

```bash
curl -X POST http://127.0.0.1:8001/api/retrain
```

---

## 9. Monte Carlo Engine

**File:** `models/monte_carlo.py`

Runs N stochastic simulations by perturbing each scenario's KPI impact values with Gaussian noise, then returns percentile distributions.

### How it works

1. Load the base-case KPI values from `base_case.csv`
2. Load the scenario's per-KPI impact rows from `scenario_library.csv`
3. For each simulation:
   - Apply Gaussian noise to each impact value: `perturbed = impact × (1 + N(0, uncertaintyPct))`
   - Apply the stressed impact to the base value (pct / delta / abs mode)
4. Collect all simulated values per KPI
5. Return P05 / P25 / P50 / P75 / P95 percentiles, mean, std, worst case, best case

### Run directly

```bash
python models/monte_carlo.py
# Output: Scenario S01  N=200
#   FIN01: base=24400 p05=20710 p50=24382 p95=28490
```

### Parameters

| Parameter | Default | Description |
|---|---|---|
| `scenario_id` | required | Scenario ID (e.g. `"S01"`) |
| `n_simulations` | 1000 | Number of Monte Carlo iterations |
| `severity_multiplier` | 1.0 | Scales all impact values (1.0 = base severity) |
| `uncertainty_pct` | 0.20 | Gaussian noise band — 0.20 = ±20% |
| `seed` | None | Random seed for reproducibility |

---

## 10. Pipeline Modules

### `pipeline/scenario_engine.py`

Core stress calculator. Applies scenario impacts to base-case KPI values.

```python
from pipeline.scenario_engine import apply_scenario, load_scenario_library

result = apply_scenario("S01", severity_multiplier=1.5)
# result["stressed"] = {KPI_ID: stressed_value, ...}
# result["deltas"]   = {KPI_ID: pct_change, ...}
```

### `pipeline/classifier.py`

Classifies KPI risk level (Safe / Watch / Warning / Critical) given a value and thresholds.

### `pipeline/reverse_stress.py`

Standalone reverse stress runner — binary searches for the severity multiplier that causes a given KPI to breach its threshold.

### `pipeline/extractor/tables.py`

PDF table extraction using `pdfplumber`. Called by `upload_service.py` when a PDF is uploaded.

```python
from pipeline.extractor.tables import extract_tables_from_pdf
tables = extract_tables_from_pdf(pdf_bytes)
```

---

## 11. Services

### `data_loader.py`

Central data access layer. Uses `@lru_cache` so CSVs are read once per server process.

```python
from backend.app.services.data_loader import load_base_case, KPI_META, FRONTEND_KPIS

base = load_base_case()   # {"FIN01": 24400.0, ...}
meta = KPI_META["FIN01"]  # {"name": "Service Revenue", "unit": "GHSm", ...}
```

Call `clear_scenario_cache()` after writing to a CSV to invalidate the cache.

### `scenario_service.py`

CRUD for scenarios + `apply_scenario()` which computes stressed outputs and SHAP attributions.

### `reverse_service.py`

Binary search solver: finds the minimum severity multiplier that causes a KPI to breach a user-defined threshold. Searches all scenarios if no `scenarioId` is provided.

### `upload_service.py`

- **CSV upload:** validates column names, writes to `base_case.csv`, clears LRU cache, logs the change
- **PDF upload:** extracts tables with `pdfplumber`, optionally maps them to KPI IDs using Claude (`claude-haiku-4-5-20251001`) if `ANTHROPIC_API_KEY` is set
- **PDF apply:** applies selected KPI candidates to `base_case.csv`
- **Retrain:** calls `models/train_impact_model.py` to retrain XGBoost models

### `feedback_service.py`

Persists user feedback to `data/logs/feedback.json` with UUID, timestamp, page, rating, message.

### `log_service.py`

Persists base-case change events to `data/logs/base_case_changes.json` with KPI ID, old value, new value, delta %, source.

### `history_service.py`

Reads `quarterly.csv` and `operational_quarterly.csv` to serve time-series data.

---

## 12. Testing

```bash
# Run all tests from the project root
python -m pytest tests/ -v

# Run a specific test file
python -m pytest tests/test_classifier.py -v
python -m pytest tests/test_extractor_tables.py -v
```

### Smoke-test endpoints manually

```bash
# KPIs
curl http://127.0.0.1:8001/api/kpis | python -m json.tool | head -20

# Run scenario S01
curl -X POST http://127.0.0.1:8001/api/scenarios/S01/run \
  -H "Content-Type: application/json" \
  -d '{"severityMultiplier": 1.5, "macroOverlays": {}}'

# Monte Carlo
curl -X POST http://127.0.0.1:8001/api/monte-carlo \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "S01", "nSimulations": 200, "uncertaintyPct": 0.20}'

# Health check
curl http://127.0.0.1:8001/api/health
```

---

## 13. Common Errors & Fixes

### `ModuleNotFoundError: No module named 'fastapi'`

You're using the system Python, not the conda env.

```bash
# Use the full conda python path
"<repo-parent>/.conda/python.exe" -m uvicorn backend.app.main:app --reload
# or just run:
bash start_backend.sh
```

### `ModuleNotFoundError: No module named 'python_multipart'`

```bash
pip install python-multipart
```

### `ModuleNotFoundError: No module named 'dateutil'`

```bash
pip install python-dateutil
```

### `RuntimeError: ARIMA model not found`

Train the ARIMA model first:

```bash
python models/train_lstm.py
```

### `ValueError: Scenario S01 not found`

The `scenario_library.csv` either doesn't exist or doesn't contain the scenario. Check:

```bash
python -c "import pandas as pd; df = pd.read_csv('data/structured/scenario_library.csv'); print(df['Scenario_ID'].unique())"
```

### `start_backend.ps1: line 4: syntax error`

You're running the PowerShell script in Git Bash. Use the bash version:

```bash
bash start_backend.sh
```

### PDF upload returns empty candidates

Set `ANTHROPIC_API_KEY` for LLM-powered extraction, or check that `pdfplumber` can read the PDF:

```bash
python -c "import pdfplumber; pdf = pdfplumber.open('pipeline/annual_mtn_25.pdf'); print(len(pdf.pages), 'pages')"
```

### Port 8001 already in use

```bash
# Find and kill the process
lsof -i :8001 | grep LISTEN
kill <PID>
# or on Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### CORS error from frontend

The server only allows `localhost:3000` and `localhost:3001`. If your frontend runs on a different port or IP, edit `backend/app/main.py`:

```python
allow_origins=["http://localhost:3000", "http://localhost:YOUR_PORT"],
```

---

## Quick-Start Checklist

- [ ] Conda env created and Python path confirmed
- [ ] `pip install fastapi uvicorn[standard] pandas xgboost pdfplumber ...`
- [ ] `bash start_backend.sh` — server at `http://127.0.0.1:8001`
- [ ] `curl http://127.0.0.1:8001/` returns `{"status":"ok"}`
- [ ] Open `http://127.0.0.1:8001/docs` to explore all endpoints
- [ ] (Optional) Set `ANTHROPIC_API_KEY` for PDF LLM extraction
- [ ] Frontend running at `http://localhost:3000` with `npm run dev`
