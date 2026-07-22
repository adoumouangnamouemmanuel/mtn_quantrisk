# MTN QuantRisk Page and Data Guide

## Purpose

This guide explains what each MTN QuantRisk web page displays, where its data comes from, how the backend transforms that data, and which parts are live, modeled, generated, or static.

It reflects the implementation on branch `Foureiratou` as inspected and run on 22 July 2026. It is an implementation reference, not a description of the original roadmap.

## Running application

The verified local configuration was:

- Web application: `http://127.0.0.1:3001`
- Backend API: `http://127.0.0.1:8001`
- OpenAPI/Swagger documentation: `http://127.0.0.1:8001/docs`
- Frontend API environment variable: `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001`

Port 3001 was used because another program was already using port 3000 on the test machine. All user-facing routes returned HTTP 200. The root route, `/`, returned HTTP 307 and redirected to `/login` as designed.

> Important: if `NEXT_PUBLIC_API_BASE` is not set, `frontend/lib/api.ts` defaults to `http://127.0.0.1:8000`, while the documented backend command uses port 8001. Set the variable explicitly when running locally.

## End-to-end data flow

```text
MTN CSV files / scenario CSV files / model artifacts
                     |
World Bank API ------+------> FastAPI services ------> REST API ------> Next.js pages
                     |                |
RSS and GNews feeds -+                +------> SQLite news, scores and alerts
                                      |
Uploaded CSV/PDF files -------------->+------> updated base case / extracted data
```

The browser does not normally read project CSV files directly. Page components call functions in `frontend/lib/api.ts`; those functions call the FastAPI routes in `backend/app/api/routes.py`; backend services then read CSV files, model artifacts, SQLite records, or external APIs.

`frontend/lib/api.ts` has `USE_MOCK_API = false`, so its main data functions use the backend. However, individual pages still use some static frontend metadata, and the backend itself contains mock or generated responses for a few features. Those exceptions are identified below.

## Page summary

| Page | Route | Main source | Current data character |
|---|---|---|---|
| Login | `/login` | Supabase Auth | Real email/password authentication |
| Core Anchors | `/dashboard` | KPI CSV, SQLite, World Bank | Mixed live/local |
| News Feed | `/news` | SQLite populated from RSS/GNews | Live when scraping is available |
| Risk Alerts | `/alerts` | SQLite alerts | Derived from news NLP scores |
| Daily Briefing | `/intelligence` | SQLite news plus HF/extractive summarizer | Generated and cached |
| Ghana Macro | `/economics` | World Bank Open Data | External, six-hour cache |
| Full KRI Book | `/kri-register` | `base_case.csv` | Local structured data |
| Quarterly Trends | `/quarterly` | Base case plus deterministic generator | Synthetic history |
| Monthly Trends | `/monthly` | Base case plus deterministic generator | Synthetic history |
| Predictive Forecasts | `/forecasts` | ARIMA or random-walk fallback | Modeled/generated |
| Board Briefs | `/briefs` | Backend in-memory templates | Mock/generated |
| Stress Tester | `/scenarios` | Scenario CSVs, KPI CSV, XGBoost/SHAP | Local modeled data |
| Scenario Compare | `/compare` | Two scenario-engine runs | Local modeled data |
| Reverse Stress | `/reverse` | Scenario library and optimizer | Local modeled data |
| Monte Carlo | `/monte-carlo` | Scenario library and simulation engine | Simulated data |
| Settings | `/settings` | Health API, upload APIs and log store | Mixed operational/static |
| Help | `/help` | Static frontend help content | Documentation only |

## Pages in detail

### 1. Login

Route: `/login`

The page displays the MTN QuantRisk sign-in presentation, email and password fields, validation errors, and the entry action for the dashboard.

Data source and behavior:

- The screen is defined in `frontend/app/(auth)/login/page.tsx`.
- Email/password credentials are validated by Supabase Auth.
- `frontend/proxy.ts` refreshes session cookies and redirects unauthenticated requests to `/login`.
- The protected application layout verifies the user server-side before rendering pages.
- The profile panel displays the authenticated user's real email and metadata.
- When Supabase environment variables are missing, authentication fails closed and the login page reports that setup is incomplete.
- MTN SSO is visibly disabled and marked as coming soon; it does not simulate authentication.

### 2. Core Anchors

Route: `/dashboard`

The dashboard displays the current KPI anchor cards, news activity, active-alert counts, and a Ghana macroeconomic risk signal. KPI cards show the current value, unit, direction, trend, and risk/status presentation used as the platform's base case.

API calls:

- `GET /api/kpis`
- `GET /api/news/summary`
- `GET /api/alerts/summary`
- `GET /api/economics/risk-context`

Data sources:

- KPI values come from `data/structured/base_case.csv` through `scenario_service.get_all_kpis()`.
- News totals and category/source summaries are calculated from `backend/quantrisk_news.db`.
- Alert totals are calculated from active alert rows in the same SQLite database.
- Inflation and growth signals are derived from World Bank Ghana indicators by `economic_service.py`.

The page therefore combines internal baseline data, scraped intelligence, and external macroeconomic data.

### 3. News Feed

Route: `/news`

The page displays paginated article cards with source, publication time, title, risk category, sentiment, severity, MTN relevance, alert tier, estimated GHS impact, and expandable article details. It supports category/source filtering, load-more pagination, and a manual refresh/scrape action.

API calls:

- `GET /api/news`
- `GET /api/news/summary`
- `POST /api/news/scrape`

Data flow:

1. `scraper_service.py` reads configured RSS feeds and optional GNews results.
2. The pipeline deduplicates articles by URL.
3. NLP services perform relevance gating, category classification, entity extraction, sentiment analysis, severity calculation, and GHS impact estimation.
4. Articles and risk scores are stored in SQLite.
5. `news_service.py` queries and serializes those records for the page.

Without network access or newly scraped articles, the page shows the records already stored in `backend/quantrisk_news.db`.

### 4. Risk Alerts

Route: `/alerts`

The page displays active alert counts and tiered alert cards. Users can filter alerts by Critical, Warning, or Watch status and acknowledge an alert.

API calls:

- `GET /api/alerts`
- `GET /api/alerts/summary`
- `PATCH /api/alerts/{alert_id}/acknowledge`

Data source and transformation:

- Alerts are SQLite records created by `alert_service.py` from news-pipeline results.
- The default severity thresholds are Critical at 7.5 or above, Warning at 5.0 or above, and Watch at 3.0 or above.
- Acknowledgement changes the alert record's state and timestamp; it is not merely a frontend visual toggle.

### 5. Daily Briefing

Route: `/intelligence`

The page displays a 24-hour intelligence digest: overall risk level, tier counts, lead headline, category sections, summaries, top articles, estimated impact, source activity, and live risk events.

API calls:

- `GET /api/intelligence/summary`
- `GET /api/news` through the live-events component
- `GET /api/alerts/summary`

Data source and generation:

- Source articles come from the SQLite news database.
- Articles are grouped by the six risk categories.
- If `HF_TOKEN` is configured, the backend requests a summary from the Hugging Face BART-CNN model.
- Without `HF_TOKEN`, it uses extractive summarization, so the page still works offline from the model API.
- Generated intelligence is cached for 30 minutes.

This page is generated from stored articles; it is not a manually authored report.

### 6. Ghana Macro Dashboard

Route: `/economics`

The page displays Ghana inflation, GDP growth, USD/GHS exchange-rate context, unemployment, public debt, and foreign direct investment. It includes latest values, observation years, risk badges, descriptions, and eight-year trend charts.

API calls:

- `GET /api/economics`
- `GET /api/economics/risk-context`

Data source:

- `economic_service.py` calls the World Bank Open Data API for country code `GH`.
- Six indicators are retrieved and cached in memory for six hours.
- The backend converts inflation and GDP growth values into dashboard risk labels and a plain-language summary.

The year shown beside a value matters: World Bank indicators are not all updated at the same time.

### 7. Full KRI Book

Route: `/kri-register`

The page displays the KPI/KRI register in searchable and filterable form, including category, identifier, name, value, unit, direction, threshold/status information, and related metadata.

API call:

- `GET /api/kpis`

Primary data source:

- `data/structured/base_case.csv`

There is also a richer `data/structured/kri_register.csv` file in the repository, but the current page/API path is based on the normalized base-case KPI data rather than directly rendering every column from that richer register.

### 8. Quarterly Trends

Route: `/quarterly`

The page lets the user select a KPI and displays quarterly values, trends, and chart/table views across the historical period.

API call:

- `GET /api/quarterly/{kpi_id}`

Current data behavior:

- `history_service.get_quarterly()` creates 24 quarterly observations from FY20Q1 through FY25Q4.
- The series is generated from the selected KPI's current base-case value.
- A KPI-specific deterministic random seed makes the same KPI history repeat consistently between requests.

Although `data/structured/quarterly.csv` and operational/segment quarterly files exist, this endpoint currently generates its displayed series rather than reading those historical CSV rows directly.

### 9. Monthly Trends

Route: `/monthly`

The page displays a selectable KPI's monthly time series, with chart/table presentation over a configurable recent period.

API call:

- `GET /api/monthly/{kpi_id}?n_months=...`

Current data behavior:

- `history_service.get_monthly()` generates the requested number of monthly observations, normally 36, ending in December 2025.
- Values are anchored to the KPI base case and generated with a deterministic KPI-specific seed.

This is a synthetic demonstration history, not a direct rendering of monthly MTN actuals.

### 10. Predictive Forecasts

Route: `/forecasts`

The page displays a KPI selector, forecast horizon controls, central forecast, uncertainty band, chart/table switching, and explanatory forecast information.

API call:

- `GET /api/forecast/{kpi_id}?horizon=7|30|90`

Model behavior:

- `FIN01` (Service Revenue) uses `models/artefacts/arima_revenue.joblib` when the artifact and quarterly input are available.
- The backend forecasts two quarterly points, interpolates them into daily values, and shows an approximate plus/minus 15% interval.
- Other KPIs use a random-walk fallback anchored to `base_case.csv`, with approximate plus/minus 12% bounds.
- If the ARIMA path fails, `FIN01` also falls back to the random walk.
- KPI selector labels and metadata are imported from frontend mock metadata, while the actual plotted forecast is requested from the backend.

Only the Service Revenue forecast should presently be described as ARIMA-based.

### 11. Board Briefs

Route: `/briefs`

The page displays briefing cards with title, status, generation time, severity, estimated impact, executive summary, KPI impacts, calibration notes, recommended actions, and key entities. It also supports generating a new brief.

API calls:

- `GET /api/briefs`
- `POST /api/briefs/generate`

Current data behavior:

- Existing briefs are the `MOCK_BRIEFS` list defined in `backend/app/api/routes.py`.
- Newly generated briefs use a backend response template with randomized severity and impact values.
- Generated briefs are not persisted to a database by this endpoint.
- The text is not currently produced by an LLM or a complete board-report engine.

This page is a functional demonstration and should not be presented as audited board output.

### 12. Stress Tester

Route: `/scenarios`

The page displays the scenario library and lets the user select, create, edit, or delete scenarios. For a selected scenario it shows description, type, severity, probability/plausibility, trigger/calibration information, mitigation levers, macro overlays, severity controls, KPI impacts, revenue and EBITDA waterfalls, and SHAP-style attribution.

API calls:

- `GET /api/scenarios`
- `GET /api/scenarios/{scenario_id}`
- `POST /api/scenarios/{scenario_id}/run`
- `POST /api/scenarios`
- `PUT /api/scenarios/{scenario_id}`
- `DELETE /api/scenarios/{scenario_id}`
- `POST /api/briefs/generate` when requesting a brief

Data sources and models:

- Detailed KPI impacts come from `data/structured/scenario_library.csv`.
- Scenario-level metadata comes from `mtn_scenario_library.csv`.
- Base KPI values come from `data/structured/base_case.csv`.
- Trained artifacts are loaded from `models/artefacts/*.joblib` where applicable.
- `scenario_service.py` applies severity and macro overlays, calculates scenario output, and provides attribution/calibration information.
- Some KPI display labels are frontend static metadata, but the scenario list and run result use backend data.

Creating, editing, or deleting a scenario writes back to the scenario CSV files, so those actions change project data.

### 13. Scenario Compare

Route: `/compare`

The page displays two selected scenarios side by side, including severity, financial impact, KPI-by-KPI results, comparison badges, and waterfall differences. It can generate a comparative brief.

API calls:

- `GET /api/kpis`
- Two calls to `POST /api/scenarios/{scenario_id}/run`
- Optional `POST /api/briefs/generate`

Data source:

- Both sides use the same scenario engine, base-case CSV, scenario CSVs, and artifacts described for the Stress Tester.
- The comparison is calculated from two independent scenario results; it is not stored as its own dataset.

### 14. Reverse Stress

Route: `/reverse`

The page starts with an unacceptable target outcome, such as an EBITDA or revenue floor. It then displays the minimum scenario severity needed to breach that target, a binary-search trajectory, dangerous scenarios, and cross-scenario sensitivity results.

API call:

- `POST /api/reverse-stress`

Supporting calls/components also load KPI and scenario choices from the backend.

Data source and calculation:

- Target KPI baselines come from `base_case.csv`.
- Candidate shocks come from the scenario library.
- `reverse_service.py` searches for the minimum severity/multiplier that crosses the requested threshold.
- The trajectory and sensitivity cards visualize the optimizer output; they are not historical observations.

### 15. Monte Carlo Simulation

Route: `/monte-carlo`

The page lets users choose a scenario, number of simulations, severity multiplier, and uncertainty percentage. It displays output distributions, percentiles, confidence ranges, downside probabilities, KPI statistics, and scenario assumptions.

API call:

- `POST /api/monte-carlo`

Data source and calculation:

- Scenario assumptions come from the scenario library CSVs.
- Base values come from `base_case.csv`.
- `models/monte_carlo.py` repeatedly samples uncertainty around the scenario impact.
- Results are generated for the request and are not historical data or persisted simulation runs.

### 16. Settings and Integrations

Route: `/settings`

The page displays pipeline health, account details, upload controls, model retraining controls, and base-case change history.

API calls:

- `GET /api/health`
- `POST /api/upload/csv`
- `POST /api/upload/pdf`
- `POST /api/upload/pdf/apply`
- `POST /api/retrain`
- `GET /api/logs/base-case`

Data source and behavior:

- Health checks attempt to read the base-case and scenario CSVs and check for model artifacts.
- Account details shown in the page are currently static/demo presentation data.
- CSV upload validates and updates `data/structured/base_case.csv`.
- PDF upload extracts candidate KPI values and requires applying selected candidates before changing the base case.
- Extracted PDF results are saved under `data/extracted/`; uploaded files use `data/uploads/`.
- Base-case changes are recorded by the logging service and displayed as history.
- Retraining calls the local model-training workflow and replaces/updates model artifacts if successful.

Uploading, applying PDF candidates, and retraining are write operations with lasting effects.

### 17. Help and Support

Route: `/help`

The page displays searchable guides, frequently asked questions, category navigation, glossary terms, and contextual explanations for the dashboard and models.

Data source:

- Help content is static TypeScript content in `frontend/lib/helpContent.ts`.
- Search and filtering happen in the browser.
- No backend data is required for the main help page.
- Feedback widgets elsewhere submit to `POST /api/feedback`; stored feedback can be retrieved from `GET /api/feedback`.

## Shared navigation and shell data

The application shell supplies the sidebar, top bar, profile panel, notifications panel, and feedback widget around the main pages.

- Sidebar destinations are static route definitions.
- Top-bar KPI/scenario search currently uses frontend mock metadata rather than a backend search endpoint.
- Profile identity comes from the authenticated Supabase user. Some account-detail fields on Settings remain presentation data.
- The feedback widget sends feedback to the backend feedback service.

## Primary data sources

### Structured internal files

- `data/structured/base_case.csv`: current KPI baseline used by KPI, scenario, forecast, history, and reverse-stress services.
- `data/structured/scenario_library.csv`: scenario-to-KPI impacts and calibration fields.
- `mtn_scenario_library.csv`: scenario-level names, probabilities, types, severity, and narrative metadata.
- `data/structured/annual.csv`: annual financial history available in the repository.
- `data/structured/quarterly.csv`: quarterly financial history available in the repository.
- `data/structured/operational_annual.csv` and `operational_quarterly.csv`: operational KPI series.
- `data/structured/segments_annual.csv` and `segments_quarterly.csv`: revenue segment series.
- `data/structured/macro_context.csv`: Ghana macro context available for analysis.
- `data/structured/kri_register.csv`: detailed KRI governance register.
- `data/structured/thresholds.csv`: green/amber/red threshold definitions.

Not every available CSV is currently wired directly to a page. The page descriptions above identify what is actually used.

### Model artifacts

Artifacts in `models/artefacts/` include KPI impact models, a feature scaler, training results, and the Service Revenue ARIMA model. Scenario and Monte Carlo features use these artifacts or scenario coefficients depending on the requested operation.

### SQLite database

`backend/quantrisk_news.db` stores scraped articles, NLP/risk results, and alerts. It is generated runtime data and is currently untracked by Git.

### External sources

- World Bank Open Data supplies Ghana macroeconomic indicators.
- Configured RSS feeds and optional GNews supply news articles.
- Hugging Face inference is optional for FinBERT sentiment and BART-CNN summarization when `HF_TOKEN` is configured.

## Interpretation and presentation cautions

1. Quarterly and monthly charts are generated demo histories, despite real historical CSVs being present in the repository.
2. Only `FIN01` has an implemented ARIMA forecast path; other forecast series are random-walk demonstrations.
3. Board briefs are backend templates with some randomized fields and are not persisted or audited.
4. Scenario, reverse-stress, and Monte Carlo results are model outputs, not actual financial outcomes.
5. World Bank observation years vary by indicator and may lag the current year.
6. News intelligence quality depends on feed availability, article text quality, optional API tokens, and fallback NLP behavior.
7. Login and session protection use Supabase Auth, but MTN SSO is not implemented and some Settings account fields remain static.
8. The health endpoint verifies readable input files and artifact presence; it does not prove forecast accuracy or external feed availability.

## Verification record

On 22 July 2026:

- `GET /api/health` returned `Healthy`.
- Base Case CSV, Scenario Library CSV, Scenario Meta CSV, XGBoost artifacts, and SHAP status were reported healthy.
- `/login` and all 16 application/help routes returned HTTP 200.
- `/` correctly redirected to `/login`.
- The frontend was run with webpack mode because the default development compiler hung in the Windows OneDrive workspace.
- Automated visual browser inspection could not be performed because the required browser CLI was not installed, and downloading an unverified third-party executable was rejected by the environment's safety policy. Route compilation, HTTP responses, API output, source tracing, backend tests, and TypeScript checks were used instead.
