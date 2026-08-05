# MTN QuantRisk — Comprehensive Project Audit Report

**Audit Date:** 2026-08-03
**Auditor:** Senior Software Architect / Security / ML / DevOps Review
**Repository:** `mtn_quantrisk` (commit `d694f05`)

---

# ⚠️ Audit Update — 2026-08-05

The following findings from this report have been **resolved** in the latest changes:

| Finding | Original Severity | Resolution |
|---|---|---|
| **TD-02 / 7.2:** Committed `.env.local` with Supabase key + `DEV_AUTH_BYPASS=true` | Critical | **Resolved.** Supabase was completely removed. `frontend/.env.local` now contains only JWT + API config. Supabase keys are gone from the codebase (0 references). `.gitignore` updated with `*.db` and `data/uploads/`. |
| **TD-03 / 7.3:** Backend API has zero authentication | Critical | **Resolved.** Implemented local JWT auth (HS256, stdlib-only, no PyJWT dependency). All `/api/*` endpoints now require `Authorization: Bearer <token>` and return 401 without a valid token. New endpoints: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. |
| **Auth (Supabase) feature row:** Partial with bypass enabled | High | **Resolved.** Supabase auth removed entirely and replaced with a local JWT system. Default account: `analyst@mtn.com` / `Pass.word.123`. Auth bypass (`DEV_AUTH_BYPASS`) deleted. |
| **Frontend dependency `@supabase/ssr` + `@supabase/supabase-js`** | Medium | **Resolved.** Both dependencies removed from `frontend/package.json`. `frontend/utils/supabase/` directory deleted. |
| **C10 / `DEV_AUTH_BYPASS` gate** | High | **Superseded.** The bypass mechanism no longer exists — it was deleted with the Supabase code. |
| **`SUPABASE_DB_URL` env reference** | Low | **Resolved.** Removed from `backend/app/models/database.py`; only `DATABASE_URL` (Postgres) or SQLite fallback remains. |

**Test verification:** All 31 API tests in `tests/test_api.py` pass, including new auth tests (login success/failure, `/me` requires auth, all endpoints return 401 without a token). TypeScript compilation passes cleanly.

**Still open from this audit:** C1 (revoke GitHub PAT — user action), C4 (random-walk forecast), C5 (MOCK_BRIEFS), C6 (heuristic SHAP), C7 (rate limiting), C8 (upload validation), C9 (Docker mount), C11 (missing deps). See `ACTION_PLAN.md` for the updated tracker.

---

# 1. Executive Summary

## Overall Scores (0–100)

| Dimension | Score | Rationale |
|---|---|---|
| **Overall Project Health** | **38/100** | Functional prototype with serious production blockers |
| **Production Readiness** | **12/100** | Not deployable; auth bypass, no CI, no monitoring, no secrets management |
| **Security** | **15/100** | Exposed GitHub PAT, committed `.env.local`, auth bypass, unauthenticated API |
| **Code Quality** | **45/100** | Reasonable structure but heavy duplication, dead code, magic numbers |
| **Architecture** | **40/100** | Monolithic backend, duplicated scenario engines, no service boundaries |
| **Maintainability** | **35/100** | Two parallel scenario engines, stale docs, abandoned directories |
| **ML / Risk Modelling** | **25/100** | Trained on 6 rows, synthetic augmentation is broken, no validation |

## Biggest Strengths
1. **Broad feature coverage** — 15+ dashboard pages, scenario engine, reverse stress, Monte Carlo, news scraper, NLP pipeline, alerts, board briefs, economics integration.
2. **Good test discipline** — 10 test files covering API, NLP, scraper, classifier, impact, history, economics, scheduler.
3. **Data provenance awareness** — `history_service.py` correctly labels Reported/Interpolated/Estimated and refuses to fabricate monthly data.
4. **Graceful degradation** — NLP, sentiment, economics, and scraper all have fallbacks when external APIs are unavailable.
5. **Documentation effort** — ADRs, architecture doc, user guide, roadmap, phase plan all exist.

## Biggest Weaknesses
1. **CRITICAL: Exposed GitHub Personal Access Token** in the git remote URL (`.git/config`).
2. **CRITICAL: Committed `.env.local`** with a Supabase publishable key and `DEV_AUTH_BYPASS=true`.
3. **CRITICAL: Backend API has zero authentication** — any endpoint is publicly accessible.
4. **CRITICAL: ML models trained on 6 real rows** — statistically meaningless; synthetic augmentation is broken.
5. **HIGH: Two divergent scenario engines** (`pipeline/scenario_engine.py` and `backend/app/services/scenario_service.py`) that can produce different results.
6. **HIGH: Random-walk forecast fallback** in `routes.py` produces fabricated data presented as forecasts.
7. **HIGH: No CI/CD pipeline** — `infrastructure/.github/workflows/blank.yml` is empty.
8. **HIGH: No monitoring, logging aggregation, or alerting** beyond Python `logging`.
9. **HIGH: Mobile app is a default Expo template** — no real functionality.
10. **MEDIUM: Dead code and abandoned directories** (`backend/app/tasks/`, `backend/app/ml/`, `backend/app/nlp/`, `backend/app/scrapers/` all contain only `test.txt`).

## Highest-Priority Risks
1. **Security breach** — exposed PAT grants full repo access; committed keys enable credential abuse.
2. **Incorrect risk decisions** — models trained on 6 rows produce unreliable risk scores that could mislead MTN leadership.
3. **Data integrity** — random-walk forecasts and synthetic trend data presented as real.
4. **Operational failure** — no CI, no rollback, no monitoring means any deploy is risky.

---

# 2. Project Inventory

## Directory Structure

| Directory | Purpose | Status | Quality |
|---|---|---|---|
| `backend/` | FastAPI application (routes, services, models, DB) | **Functional** | Medium — good separation but monolithic |
| `frontend/` | Next.js 15 dashboard (App Router) | **Functional** | Medium — heavy mock data, duplicate shell components |
| `mobile/` | Expo React Native app | **Stub** | Low — default template, no real features |
| `models/` | ML training, inference, SHAP, Monte Carlo | **Partial** | Low — 6-row training, broken augmentation |
| `pipeline/` | Scenario engine, PDF classifier, table extractor | **Partial** | Low — duplicated logic with backend |
| `data/` | Structured CSVs, extracted JSON, uploads | **Partial** | Medium — good provenance labels |
| `tests/` | Pytest suite | **Good** | Medium — 10 files, decent coverage |
| `docs/` | Architecture, ADRs, guides, plans | **Good** | Medium — some stale |
| `infrastructure/` | Docker, render.yaml, CI | **Stub** | Low — blank CI, no real deployment |
| `scripts/` | Excel→CSV, seed demo | **Partial** | Low — one-off scripts |
| `notebooks/` | EDA notebook | **Partial** | Low — single notebook |

## Important Files

| File | Purpose | Quality | Issues | Action |
|---|---|---|---|---|
| `backend/app/main.py` | FastAPI entry, scheduler | Medium | CORS hardcoded; scheduler non-fatal | Refactor config to env |
| `backend/app/api/routes.py` | All API routes | Medium | Random-walk forecast; MOCK_BRIEFS hardcoded; `sys.path` hacks | Refactor |
| `backend/app/services/scenario_service.py` | Scenario engine (backend) | Medium | Duplicates `pipeline/scenario_engine.py`; heuristic SHAP fallback | Consolidate |
| `backend/app/services/data_loader.py` | CSV loading | Good | `lru_cache` not invalidated on upload for base case | Fix |
| `backend/app/services/scraper_service.py` | RSS scraper | Good | 18 sources; no retry/backoff | Add retry |
| `backend/app/services/nlp_service.py` | NLP classification | Medium | Keyword-only; HF optional | Improve |
| `backend/app/services/economic_service.py` | World Bank data | Good | 6h cache; good fallback | Keep |
| `backend/app/services/upload_service.py` | CSV/PDF upload | Medium | `subprocess.run` for retrain — command injection risk | Refactor |
| `models/train_impact_model.py` | XGBoost training | **Low** | 6 real rows; augmentation broken; `augment=False` default | Rewrite |
| `models/train_lstm.py` | ARIMA/LSTM | Low | Column guessing; no validation | Rewrite |
| `models/explain.py` | SHAP | Medium | Uses scaled features for SHAP — incorrect | Fix |
| `models/monte_carlo.py` | MC simulation | Medium | `sys.path` hack; imports backend | Refactor |
| `pipeline/scenario_engine.py` | Scenario engine (pipeline) | Medium | Duplicates backend; 387 lines with commented-out copy | Consolidate |
| `frontend/lib/api.ts` | API client | Good | `USE_MOCK_API=false` hardcoded | Make env-driven |
| `frontend/lib/mockData.ts` | Mock data | Medium | Large mock dataset — risk of being used in prod | Remove |
| `frontend/lib/mockGenerators.ts` | Mock generators | Medium | `.bak` file committed | Delete `.bak` |
| `frontend/utils/supabase/dev-auth.ts` | Auth bypass | **High risk** | `DEV_AUTH_BYPASS=true` in committed `.env.local` | Remove |
| `frontend/app/(app)/layout.tsx` | Auth guard | Medium | Bypass enabled by default in dev | Fix |
| `infrastructure/docker-compose.yml` | Docker | Medium | Mounts `../models/artefacts:ro` — models not writable | Fix |
| `infrastructure/.github/workflows/blank.yml` | CI | **Empty** | No CI at all | Create |
| `infrastructure/render.yaml` | Render deploy | Low | Likely incomplete | Verify |
| `tests/conftest.py` | Test setup | Good | Uses `tempfile.mktemp` (deprecated) | Fix |
| `data/structured/base_case.csv` | Base case | Good | — | Keep |
| `data/structured/scenario_library.csv` | Scenario impacts | Good | — | Keep |
| `data/structured/kri_register.csv` | KRI thresholds | Good | — | Keep |
| `data/structured/quarterly.csv` | Historical | Good | — | Keep |
| `data/structured/macro_context.csv` | Macro data | Good | — | Keep |
| `data/structured/dashboard_2026q1.csv` | Q1 snapshot | Good | — | Keep |
| `data/structured/segments_quarterly.csv` | Segment data | Good | — | Keep |
| `data/structured/operational_quarterly.csv` | Ops data | Good | — | Keep |
| `data/structured/segments_annual.csv` | Segment annual | Good | — | Keep |
| `data/structured/operational_annual.csv` | Ops annual | Good | — | Keep |
| `data/structured/annual.csv` | Annual | Good | — | Keep |
| `data/structured/halfyearly.csv` | Half-yearly | Good | — | Keep |
| `data/structured/leading_indicators.csv` | Leading indicators | Good | — | Keep |
| `data/structured/derived_ratios.csv` | Derived ratios | Good | — | Keep |
| `data/structured/scenario_library_augmented.csv` | Augmented scenarios | **Broken** | Generated by broken augmentation | Delete or regenerate |
| `data/structured/thresholds.csv` | Thresholds | Good | — | Keep |
| `data/extracted/annual_mtn_25.json` | Extracted PDF | Good | — | Keep |
| `mtn_scenario_library.csv` | Scenario metadata | Good | — | Keep |
| `package-lock.json` / `yarn.lock` | Root deps | **Unused** | No root package.json | Delete |
| `text.py` | Unknown | **Dead** | No purpose | Delete |
| `generate_mock_data.py` | Mock generator | **Dead** | One-off | Delete |
| `augment_scenarios.py` | Scenario augmentation | **Broken** | Broken logic | Delete or fix |
| `scenario_library_augmented.zip` | Archive | **Dead** | Committed zip | Delete |
| `frontend/build_output.txt` | Build log | **Dead** | Committed log | Delete |
| `frontend/depcheck_output.txt` | Dep check log | **Dead** | Committed log | Delete |
| `frontend/lint_output.txt` | Lint log | **Dead** | Committed log | Delete |
| `frontend/tsc_output.txt` | TSC log | **Dead** | Committed log | Delete |
| `frontend/tsconfig.tsbuildinfo` | Build cache | **Dead** | Committed cache | Delete |
| `frontend/lib/mockGenerators.ts.bak` | Backup | **Dead** | Committed backup | Delete |
| `backend/app/tasks/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/app/ml/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/app/nlp/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/app/scrapers/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/app/api/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/app/models/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `backend/tests/test.txt` | Placeholder | **Dead** | Empty dir | Delete |
| `pipeline/annual_mtn_25.pdf` | Source PDF | Good | — | Keep |
| `pipeline/test.py` | Smoke test | **Dead** | One-off | Delete |
| `docs/mtn/MTN-Ghana-KRI-Dashboard 1 (1).html` | Reference | Good | — | Keep |
| `docs/mtn/MTN-Ghana-KRI-Framework 1 (1).xlsx` | Reference | Good | — | Keep |
| `docs/mtn/mtn.html` | Reference | Good | — | Keep |
| `docs/mtn/MTN PLAN.md` | Plan | Good | — | Keep |
| `docs/mtn/mtn.md` | Notes | Good | — | Keep |
| `docs/MTN QuantRisk.pdf` | PDF doc | Good | — | Keep |
| `notebooks/01_eda_feature_engineering.ipynb` | EDA | Medium | Single notebook | Keep |
| `notebooks/charts/*.png` | Charts | Good | — | Keep |
| `mobile/` | Expo app | **Stub** | Default template | Rewrite or remove |
| `frontend/public/*.svg` | Icons | Good | — | Keep |
| `frontend/.env.local` | **SECRET** | **CRITICAL** | Committed with key + bypass | **Remove from git** |
| `frontend/.env.example` | Template | Good | — | Keep |
| `frontend/proxy.ts` | Dev proxy | Medium | — | Keep |
| `frontend/utils/supabase/proxy.ts` | Supabase proxy | Medium | — | Keep |
| `frontend/AGENTS.md` / `CLAUDE.md` | Agent docs | Good | — | Keep |
| `frontend/README.md` | Frontend docs | Good | — | Keep |
| `mobile/AGENTS.md` / `CLAUDE.md` | Agent docs | Good | — | Keep |
| `mobile/README.md` | Mobile docs | Good | — | Keep |
| `mobile/scripts/reset-project.js` | Expo script | **Dead** | Template | Delete |
| `mobile/assets/expo.icon/` | Template assets | **Dead** | Template | Delete |
| `mobile/assets/images/*` | Template assets | **Dead** | Template | Delete |
| `mobile/.claude/settings.json` | Agent settings | Good | — | Keep |
| `mobile/.vscode/` | Editor config | Good | — | Keep |
| `scripts/export_excel_to_csv.py` | Utility | Medium | One-off | Keep |
| `scripts/seed_demo.py` | Demo seed | Medium | One-off | Keep |
| `start_backend.sh` | Dev script | Good | — | Keep |
| `pytest.ini` | Test config | Good | — | Keep |
| `.gitignore` | Git ignore | **Incomplete** | Missing `.env.local`, `*.joblib`, `*.db`, `*.log` | Fix |
| `README.md` | Root docs | Medium | Outdated | Update |
| `BACKEND.md` | Backend docs | Medium | Outdated | Update |
| `CLEANUP_LOG.md` | Cleanup log | Good | — | Keep |
| `dashboard_audit.md` | Prior audit | Good | — | Keep |
| `USER_GUIDE.md` | User guide | Good | — | Keep |
| `MTN_QUANTRISK_FULL_GUIDE.txt` | Full guide | Good | — | Keep |
| `scenario_calibration_notes.md` | Calibration notes | Good | — | Keep |
| `docs/architecture.md` | Architecture | Medium | Outdated | Update |
| `docs/AUTH_SETUP.md` | Auth setup | Good | — | Keep |
| `docs/MTN_QuantRisk_Phase2_Plan.md` | Phase 2 plan | Good | — | Keep |
| `docs/MTN_QuantRisk_Roadmap.md` | Roadmap | Good | — | Keep |
| `docs/PAGE_DATA_GUIDE.md` | Page data guide | Good | — | Keep |
| `docs/risk-taxonomy.md` | Risk taxonomy | Good | — | Keep |
| `docs/RUNNING_THE_APP.md` | Run guide | Good | — | Keep |
| `docs/adr/ADR-001..005.md` | ADRs | Good | — | Keep |
| `infrastructure/DEPLOY.md` | Deploy guide | Medium | Outdated | Update |
| `LICENSE` | License | Good | — | Keep |
| `backend/app/contansts/risk_taxonomy.py` | Risk taxonomy | **Typo** | `contansts` misspelled | Rename to `constants` |
| `backend/app/contansts/__init__.py` | Package init | Good | — | Keep |
| `backend/app/__init__.py` | Package init | Good | — | Keep |
| `backend/app/api/__init__.py` | Package init | Good | — | Keep |
| `backend/app/models/__init__.py` | Package init | Good | — | Keep |
| `backend/app/services/__init__.py` | Package init | Good | — | Keep |
| `pipeline/__init__.py` | Package init | Good | — | Keep |
| `pipeline/extractor/__init__.py` | Package init | Good | — | Keep |
| `tests/__init__.py` | Package init | Good | — | Keep |
| `models/artefacts/*.joblib` | Trained models | **Low** | Trained on 6 rows | Retrain |
| `models/artefacts/training_results.json` | Training metrics | **Low** | 6-row metrics | Retrain |
| `data/uploads/` | Uploads | Good | — | Keep |
| `data/logs/` | Logs | Good | — | Keep |

---

# 3. Feature Audit

## Feature Completion Matrix

| Feature | Status | Dependencies | Risks | Improvements |
|---|---|---|---|---|
| KPI Dashboard | **Complete** | `data_loader.py` | Hardcoded thresholds | Make thresholds configurable |
| Scenario Library (list/detail) | **Complete** | `scenario_service.py` | Duplicate engine | Consolidate |
| Scenario Run (apply impacts) | **Complete** | `scenario_service.py` | Heuristic SHAP fallback | Use real SHAP |
| Scenario CRUD | **Complete** | CSV writes | No locking; concurrent writes corrupt | Add file lock |
| Reverse Stress (single) | **Complete** | `reverse_service.py` | Binary search on non-monotonic function | Validate monotonicity |
| Reverse Stress (cross-scenario) | **Complete** | `reverse_service.py` | 20 iterations × 56 scenarios = slow | Optimize |
| Forecast (ARIMA) | **Partial** | `arima_revenue.joblib` | Only FIN01; 2-quarter model | Expand |
| Forecast (fallback) | **Broken** | — | **Random-walk fabricated data** | Remove or label clearly |
| Monte Carlo | **Complete** | `monte_carlo.py` | `sys.path` hack | Refactor |
| Board Briefs | **Complete** | `brief_service.py` | Hardcoded MOCK_BRIEFS in routes | Remove mock |
| News Scraper | **Complete** | `scraper_service.py` | No retry/backoff | Add |
| NLP Classification | **Complete** | `nlp_service.py` | Keyword-only; HF optional | Improve |
| Sentiment Analysis | **Complete** | `sentiment_service.py` | Lexicon fallback weak | Improve |
| Alerts | **Complete** | `alert_service.py` | No dedup on repeated articles | Add |
| Economics (World Bank) | **Complete** | `economic_service.py` | 6h cache | Keep |
| Intelligence Summary | **Complete** | `intelligence_service.py` | HF API dependency | Keep |
| CSV Upload | **Complete** | `upload_service.py` | No validation of KPI IDs | Add |
| PDF Upload | **Partial** | `upload_service.py` | LLM extraction fragile | Improve |
| Retrain | **Partial** | `upload_service.py` | `subprocess.run` — injection risk | Refactor |
| Feedback | **Complete** | `feedback_service.py` | JSON file — no concurrency | Move to DB |
| Base-case Logs | **Complete** | `log_service.py` | JSON file — no concurrency | Move to DB |
| Auth (Supabase) | **Partial** | Supabase | **Bypass enabled** | Fix |
| Mobile App | **Stub** | — | Default template | Rewrite or remove |
| PDF Classifier | **Complete** | `classifier.py` | — | Keep |
| Table Extractor | **Complete** | `tables.py` | Camelot dependency heavy | Keep |
| XGBoost Models | **Broken** | `train_impact_model.py` | 6 rows; broken augmentation | Rewrite |
| SHAP Explainability | **Partial** | `explain.py` | Uses scaled features — incorrect | Fix |
| ARIMA Forecast | **Partial** | `train_lstm.py` | Column guessing | Fix |
| LSTM Forecast | **Stub** | `train_lstm.py` | TensorFlow optional | Remove or complete |

---

# 4. Risk Modelling Audit

## Critical Findings

### 4.1 Training Data is Statistically Insignificant
- **File:** `models/train_impact_model.py`
- **Evidence:** `train_all_models(augment=False)` — the default. Real data is **6 rows** (annual 2020–2025).
- **Impact:** Any model trained on 6 rows is meaningless. LOO CV on 6 rows produces wildly unstable metrics.
- **Fix:** Collect more data (quarterly = 24 rows), use proper time-series CV, or abandon ML and use expert-calibrated scenario impacts.

### 4.2 Synthetic Augmentation is Broken
- **File:** `models/train_impact_model.py`, `build_augmented_dataset()`
- **Evidence:** Lines 78–81: *"Stressed macro values are not directly in result... For now, we will use the base macro values (i.e., no macro shift) – this is a limitation."*
- **Impact:** Synthetic rows have **identical macro features** with different targets — the model learns noise, not signal.
- **Fix:** Either properly map scenario impacts to macro features, or remove augmentation.

### 4.3 SHAP Uses Scaled Features Incorrectly
- **File:** `models/explain.py`
- **Evidence:** Line 83: `shap_values = explainer.shap_values(X_scaled_df)[0]` — SHAP values are computed on scaled features, but the model was trained on scaled features. This is actually correct for XGBoost (scale-invariant), but the `feature_value` reported is the **raw** value while SHAP is on scaled — misleading.
- **Fix:** Report both raw and scaled values, or use `shap.Explainer` with the raw pipeline.

### 4.4 No Target Definition Documentation
- **Evidence:** `TARGETS` in `train_impact_model.py` maps to `Service_Rev_Growth_Pct`, `EBITDA_Margin_Pct`, etc. — but there is no documented definition of how these are computed or what "growth" means (YoY? QoQ?).
- **Fix:** Document target definitions in a model card.

### 4.5 No Leakage Controls
- **Evidence:** `build_augmented_dataset` uses `real_df[FEATURE_COLS].iloc[-1]` as base macro — the **last row** (2025) is used as the base for all synthetic rows. This means the model sees 2025 macro values in training, which is fine, but there's no temporal split.
- **Fix:** Use proper time-based train/test split.

### 4.6 No Calibration
- **Evidence:** No probability calibration anywhere. Alert tiers are hardcoded thresholds.
- **Fix:** Calibrate severity scores against historical outcomes.

### 4.7 No Monitoring / Retraining Readiness
- **Evidence:** No drift detection, no model versioning, no prediction logging.
- **Fix:** Add model registry, prediction logging, drift monitoring.

### 4.8 Random-Walk Forecast is Fabricated Data
- **File:** `backend/app/api/routes.py`, lines 145–166
- **Evidence:** `cur *= random.uniform(0.998, 1.004)` — generates random data presented as a forecast.
- **Impact:** **CRITICAL** — this could mislead MTN leadership into making decisions on fabricated numbers.
- **Fix:** Remove the fallback. Return a clear "model unavailable" error instead.

### 4.9 Heuristic SHAP Fallback
- **File:** `backend/app/services/scenario_service.py`, `_get_shap_attributions()`
- **Evidence:** Lines 236–244: hardcoded feature contributions.
- **Impact:** Users see "SHAP attributions" that are fabricated.
- **Fix:** Return `null` or a clear "unavailable" flag when real SHAP fails.

---

# 5. Architecture Review

## Anti-Patterns Identified

| Anti-Pattern | Location | Severity | Fix |
|---|---|---|---|
| **Duplicate scenario engines** | `pipeline/scenario_engine.py` vs `backend/app/services/scenario_service.py` | **High** | Consolidate into one module |
| **`sys.path` hacks** | `routes.py` (line 397), `monte_carlo.py` (line 29) | Medium | Use proper package imports |
| **Monolithic routes file** | `backend/app/api/routes.py` (575 lines) | Medium | Split into routers |
| **Hardcoded mock data in production code** | `routes.py` `MOCK_BRIEFS` (lines 189–239) | **High** | Remove |
| **Hardcoded CORS origins** | `main.py` (lines 82–89) | Medium | Env-driven |
| **Hardcoded thresholds** | `data_loader.py` `KPI_META` | Medium | Config file |
| **Commented-out code** | `pipeline/scenario_engine.py` (lines 205–387) | Low | Delete |
| **Misspelled directory** | `backend/app/contansts/` | Low | Rename to `constants` |
| **Duplicate shell components** | `frontend/components/layout/` vs `frontend/components/shell/` | Medium | Consolidate |
| **Mock data in production path** | `frontend/lib/mockData.ts`, `mockGenerators.ts` | **High** | Remove or gate behind env |
| **`USE_MOCK_API` hardcoded false** | `frontend/lib/api.ts` (line 9) | Medium | Env-driven |
| **No service layer for DB** | `routes.py` queries DB directly (lines 314–316, 497–525) | Medium | Move to services |
| **`subprocess.run` for retrain** | `upload_service.py` (line 226) | **High** | Use in-process training or task queue |
| **JSON file storage for feedback/logs** | `feedback_service.py`, `log_service.py` | Medium | Move to DB |
| **No file locking on CSV writes** | `scenario_service.py` CRUD | **High** | Add lock |
| **`tempfile.mktemp` deprecated** | `tests/conftest.py` (line 19) | Low | Use `tempfile.mkdtemp` |

## Target Architecture Proposal

```
mtn_quantrisk/
├── backend/
│   ├── app/
│   │   ├── api/            # Routers (kpis, scenarios, news, alerts, etc.)
│   │   ├── core/           # Config, security, logging
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── workers/        # Background tasks (scraper, retrain)
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── Dockerfile
├── models/
│   ├── training/
│   ├── inference/
│   ├── evaluation/
│   └── artefacts/
├── shared/
│   └── scenario_engine.py  # Single source of truth
├── infrastructure/
│   ├── docker-compose.yml
│   ├── ci/                 # GitHub Actions
│   └── monitoring/
├── data/
│   ├── raw/
│   ├── processed/
│   └── artefacts/
└── docs/
```

---

# 6. Code Quality Audit

| Issue | Severity | Location | Refactor |
|---|---|---|---|
| Random-walk forecast | **Critical** | `routes.py:145-166` | Remove; return error |
| Hardcoded MOCK_BRIEFS | **High** | `routes.py:189-239` | Remove |
| Duplicate scenario engine | **High** | `pipeline/scenario_engine.py` + `scenario_service.py` | Consolidate |
| `sys.path` hacks | Medium | `routes.py:397`, `monte_carlo.py:29` | Proper imports |
| Magic numbers (thresholds) | Medium | `data_loader.py:31-45` | Config |
| Hardcoded CORS | Medium | `main.py:82-89` | Env |
| `subprocess.run` | **High** | `upload_service.py:226` | Task queue |
| No file locking | **High** | `scenario_service.py` CRUD | Add lock |
| Commented-out code | Low | `scenario_engine.py:205-387` | Delete |
| Misspelled `contansts` | Low | `backend/app/contansts/` | Rename |
| Duplicate shell components | Medium | `frontend/components/layout/` + `shell/` | Consolidate |
| Mock data in prod path | **High** | `frontend/lib/mockData.ts` | Remove |
| `USE_MOCK_API` hardcoded | Medium | `frontend/lib/api.ts:9` | Env |
| Direct DB in routes | Medium | `routes.py:314-316,497-525` | Services |
| JSON file storage | Medium | `feedback_service.py`, `log_service.py` | DB |
| `tempfile.mktemp` | Low | `tests/conftest.py:19` | `mkdtemp` |
| `#END` comment | Low | `routes.py:41` | Remove |
| `# noqa: E712` | Low | `alert_service.py:43` | Use `is False` |

---

# 7. Security Audit

## CRITICAL Findings

### 7.1 Exposed GitHub Personal Access Token
- **Location:** `.git/config` (remote URL)
- **Evidence:** `https://adoumouangnamouemmanuel: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@github.com/...`
- **Risk:** **CRITICAL** — Anyone with repo access can read the token and gain full GitHub access.
- **Exploit:** Clone repo → read `.git/config` → use token to push to any repo the user can access.
- **Fix:** **Immediately** revoke the token on GitHub, remove it from `.git/config`, and use SSH or a credential manager.

### 7.2 Committed `.env.local` with Supabase Key + Auth Bypass
- **Location:** `frontend/.env.local`
- **Evidence:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_gWZ4wu_53i2VfWYrH8ob6Q_Yr0t7lAkanon`, `DEV_AUTH_BYPASS=true`
- **Risk:** **CRITICAL** — The publishable key is public by design, but `DEV_AUTH_BYPASS=true` means anyone can bypass auth in dev. If deployed with this, the entire dashboard is open.
- **Fix:** Remove from git, add to `.gitignore`, never set `DEV_AUTH_BYPASS` in production.

### 7.3 Backend API Has Zero Authentication
- **Location:** `backend/app/api/routes.py` — no auth middleware anywhere.
- **Risk:** **CRITICAL** — Any endpoint (`/api/kpis`, `/api/scenarios`, `/api/upload/csv`, `/api/retrain`, `/api/news/scrape`) is publicly accessible.
- **Exploit:** Attacker calls `POST /api/retrain` to trigger expensive training, or `POST /api/upload/csv` to corrupt base case data.
- **Fix:** Add API key / JWT auth middleware.

### 7.4 `subprocess.run` Command Injection Risk
- **Location:** `upload_service.py:226`
- **Evidence:** `subprocess.run([sys.executable, str(script)], ...)` — the script path is fixed, so injection is limited, but the `cwd` and environment are inherited. If `script` ever becomes user-controlled, this is RCE.
- **Fix:** Use in-process training or a task queue.

### 7.5 No Rate Limiting
- **Location:** All endpoints
- **Risk:** DoS via `/api/news/scrape` or `/api/retrain`.
- **Fix:** Add rate limiting middleware.

### 7.6 No Input Validation on Uploads
- **Location:** `upload_service.py`
- **Evidence:** CSV upload only checks for `KPI_ID` and `FY25_Base_Value` columns. No validation of KPI IDs, value ranges, or file size.
- **Fix:** Validate KPI IDs against known set, enforce file size limits, validate value ranges.

### 7.7 No SQL Injection Risk (Good)
- **Evidence:** All DB queries use SQLAlchemy ORM with parameterized queries. No raw SQL found.

### 7.8 No PII Exposure (Good)
- **Evidence:** No customer PII stored. Only news articles and risk scores.

### 7.9 Logging Leaks
- **Location:** `routes.py:53-57` (auth login logs error codes)
- **Risk:** Low — logs error codes, not credentials.

---

# 8. Data Engineering Audit

| Area | Status | Issues |
|---|---|---|
| Data ingestion | **Partial** | RSS scraper works; no retry/backoff; no dedup across sources beyond URL |
| ETL pipelines | **Partial** | PDF extractor works; LLM extraction fragile |
| Data validation | **Weak** | CSV upload only checks 2 columns; no schema enforcement |
| Data lineage | **Good** | `history_service.py` tracks source file, quality flags |
| Schema enforcement | **Weak** | CSVs read with `on_bad_lines="skip"` — silently drops bad rows |
| Data quality controls | **Partial** | Quality flags (R/I/E) exist; no automated checks |
| Error handling | **Medium** | Most services catch exceptions; some swallow silently |
| Retry handling | **Weak** | No retry logic on scraper or external API calls |

## Failure Points
1. **CSV corruption** — concurrent writes to `base_case.csv` / `scenario_library.csv` without locking.
2. **Silent data loss** — `on_bad_lines="skip"` drops rows without logging.
3. **No backup** — no backup strategy for CSVs or SQLite DB.

---

# 9. Testing Audit

## Test Coverage Matrix

| Area | Tests | Coverage | Missing |
|---|---|---|---|
| API endpoints | `test_api.py` | Good | No auth tests, no upload tests, no retrain tests |
| Impact service | `test_impact.py` | Good | — |
| NLP | `test_nlp.py` | Good | No HF integration tests |
| Scraper | `test_scraper.py` | Good | No GNews tests |
| Classifier | `test_classifier.py` | Good | — |
| Economics | `test_economic_service.py` | Good | — |
| History | `test_history_service.py` | Good | — |
| Scheduler | `test_scheduler.py` | Good | — |
| Alerts | `test_alerts.py` | Good | — |
| Extractor | `test_extractor_tables.py` | Partial | PDF tests skipped (no PDF) |
| **Scenario engine** | **None** | **0%** | **Critical missing** |
| **Reverse stress** | **None** | **0%** | **Critical missing** |
| **Monte Carlo** | **None** | **0%** | **Critical missing** |
| **Upload service** | **None** | **0%** | **Critical missing** |
| **Brief service** | **None** | **0%** | Missing |
| **Intelligence service** | **None** | **0%** | Missing |
| **News service** | **None** | **0%** | Missing |
| **ML training** | **None** | **0%** | **Critical missing** |
| **SHAP** | **None** | **0%** | Missing |
| **Frontend** | **None** | **0%** | **Critical missing** |
| **Mobile** | **None** | **0%** | Missing |

## Critical Missing Tests
1. Scenario engine correctness (impact math, thresholds, macro overlays)
2. Reverse stress binary search correctness
3. Monte Carlo statistical properties
4. Upload service (CSV validation, PDF extraction, retrain)
5. ML training reproducibility
6. Frontend component tests
7. Auth bypass security tests

---

# 10. Dependency Audit

## Backend (`backend/requirements.txt`)
| Dependency | Status | Notes |
|---|---|---|
| fastapi | Current | — |
| uvicorn | Current | — |
| sqlalchemy | Current | — |
| pandas | Current | — |
| numpy | Current | — |
| xgboost | Current | — |
| scikit-learn | Current | — |
| joblib | Current | — |
| shap | Current | — |
| statsmodels | Current | — |
| feedparser | Current | — |
| requests | Current | — |
| beautifulsoup4 | Current | — |
| pdfplumber | Current | — |
| anthropic | Current | — |
| apscheduler | Current | — |
| pydantic | Current | — |
| python-dateutil | Current | — |
| **camelot** | **Missing** | Referenced in `tables.py` but not in requirements |
| **spacy** | **Missing** | Referenced in `nlp_service.py` but not in requirements |
| **tensorflow** | **Missing** | Referenced in `train_lstm.py` but not in requirements |
| **psycopg2** | **Missing** | Referenced in `database.py` for Postgres |

## Frontend (`frontend/package.json`)
| Dependency | Status | Notes |
|---|---|---|
| next | Current | — |
| react | Current | — |
| @supabase/ssr | Current | — |
| chart.js | Current | — |
| react-chartjs-2 | Current | — |
| **Unused deps** | **Likely** | `depcheck_output.txt` exists — review |

## Root (`requirements.txt`)
- **Duplicate** of `backend/requirements.txt` — should be consolidated.

## Root `package-lock.json` / `yarn.lock`
- **Unused** — no root `package.json`. Delete.

---

# 11. DevOps & Deployment Audit

| Area | Status | Issues |
|---|---|---|
| Docker | **Partial** | `docker-compose.yml` exists; mounts `../models/artefacts:ro` (read-only — retrain will fail); no `.dockerignore` |
| CI/CD | **None** | `blank.yml` is empty |
| Infrastructure | **Partial** | `render.yaml` exists but unverified |
| Environment management | **Weak** | `.env.local` committed; no `.env.production` |
| Secrets management | **None** | No Vault, no GitHub Secrets usage |
| Monitoring | **None** | No Prometheus/Grafana/New Relic |
| Logging | **Weak** | Python `logging` only; no aggregation |
| Alerting | **None** | No alerting on failures |
| Rollback strategy | **None** | No versioned deploys |

## Production Risks
1. **No CI** — any commit can break the build undetected.
2. **No monitoring** — outages go unnoticed.
3. **No secrets management** — keys in git.
4. **Read-only model mount** — retrain endpoint will fail in Docker.
5. **No health check on frontend** — only backend has healthcheck.

---

# 12. Documentation Audit

| Doc | Status | Issues |
|---|---|---|
| `README.md` | **Outdated** | Doesn't mention auth, Docker, or current state |
| `BACKEND.md` | **Outdated** | Doesn't mention new services (intelligence, economics) |
| `docs/architecture.md` | **Outdated** | Doesn't reflect current structure |
| `docs/AUTH_SETUP.md` | **Good** | — |
| `docs/MTN_QuantRisk_Phase2_Plan.md` | **Good** | — |
| `docs/MTN_QuantRisk_Roadmap.md` | **Good** | — |
| `docs/PAGE_DATA_GUIDE.md` | **Good** | — |
| `docs/risk-taxonomy.md` | **Good** | — |
| `docs/RUNNING_THE_APP.md` | **Good** | — |
| `docs/adr/ADR-001..005.md` | **Good** | — |
| `infrastructure/DEPLOY.md` | **Outdated** | Doesn't match current docker-compose |
| `USER_GUIDE.md` | **Good** | — |
| `MTN_QUANTRISK_FULL_GUIDE.txt` | **Good** | — |
| `scenario_calibration_notes.md` | **Good** | — |
| **Model documentation** | **Missing** | No model card for XGBoost/ARIMA |
| **API documentation** | **Missing** | No OpenAPI spec committed |

---

# 13. Technical Debt Register

| ID | Description | Severity | Impact | Effort | Recommendation |
|---|---|---|---|---|---|
| TD-01 | Exposed GitHub PAT in `.git/config` | **Critical** | Full repo compromise | 30 min | Revoke token, remove from config |
| TD-02 | Committed `.env.local` with key + bypass | **Critical** | Auth bypass, key exposure | 30 min | Remove from git, add to `.gitignore` |
| TD-03 | Backend API no auth | **Critical** | Full data exposure | 1 day | Add JWT/API key middleware |
| TD-04 | Random-walk forecast | **Critical** | Fabricated data | 2 hrs | Remove fallback |
| TD-05 | ML trained on 6 rows | **Critical** | Unreliable risk scores | 2 weeks | Collect data, retrain |
| TD-06 | Broken synthetic augmentation | **High** | Model learns noise | 1 day | Fix or remove |
| TD-07 | Duplicate scenario engines | **High** | Inconsistent results | 2 days | Consolidate |
| TD-08 | No CI/CD | **High** | Broken deploys | 2 days | Add GitHub Actions |
| TD-09 | No monitoring/alerting | **High** | Outages unnoticed | 3 days | Add Prometheus/Grafana |
| TD-10 | `subprocess.run` retrain | **High** | Injection risk | 1 day | Task queue |
| TD-11 | No file locking on CSV writes | **High** | Data corruption | 1 day | Add lock |
| TD-12 | Mock data in prod path | **High** | Fake data shown | 1 day | Remove |
| TD-13 | Hardcoded MOCK_BRIEFS | **High** | Fake briefs | 2 hrs | Remove |
| TD-14 | No rate limiting | **High** | DoS | 1 day | Add middleware |
| TD-15 | Mobile app is stub | **Medium** | Wasted effort | 2 weeks | Rewrite or remove |
| TD-16 | JSON file storage | **Medium** | Concurrency issues | 1 day | Move to DB |
| TD-17 | `sys.path` hacks | **Medium** | Fragile imports | 1 day | Proper packages |
| TD-18 | Duplicate shell components | **Medium** | Maintenance burden | 1 day | Consolidate |
| TD-19 | Misspelled `contansts` | **Low** | Confusion | 30 min | Rename |
| TD-20 | Dead placeholder dirs | **Low** | Clutter | 30 min | Delete |
| TD-21 | Committed build logs | **Low** | Clutter | 30 min | Delete |
| TD-22 | `tempfile.mktemp` | **Low** | Deprecated | 30 min | Fix |
| TD-23 | Missing deps (camelot, spacy, psycopg2) | **Medium** | Runtime failures | 1 hr | Add to requirements |
| TD-24 | No model card | **Medium** | Unclear model behavior | 1 day | Write model card |

---

# 14. Useless Files & Cleanup Opportunities

| Path | Reason | Action |
|---|---|---|
| `frontend/.env.local` | **Secret** | **Delete from git** |
| `frontend/lib/mockGenerators.ts.bak` | Backup | Delete |
| `frontend/build_output.txt` | Build log | Delete |
| `frontend/depcheck_output.txt` | Dep log | Delete |
| `frontend/lint_output.txt` | Lint log | Delete |
| `frontend/tsc_output.txt` | TSC log | Delete |
| `frontend/tsconfig.tsbuildinfo` | Build cache | Delete |
| `backend/app/tasks/test.txt` | Placeholder | Delete |
| `backend/app/ml/test.txt` | Placeholder | Delete |
| `backend/app/nlp/test.txt` | Placeholder | Delete |
| `backend/app/scrapers/test.txt` | Placeholder | Delete |
| `backend/app/api/test.txt` | Placeholder | Delete |
| `backend/app/models/test.txt` | Placeholder | Delete |
| `backend/tests/test.txt` | Placeholder | Delete |
| `pipeline/test.py` | One-off smoke test | Delete |
| `text.py` | Unknown | Delete |
| `generate_mock_data.py` | One-off | Delete |
| `augment_scenarios.py` | Broken | Delete or fix |
| `scenario_library_augmented.zip` | Archive | Delete |
| `data/structured/scenario_library_augmented.csv` | Broken output | Delete |
| `package-lock.json` | No root package.json | Delete |
| `yarn.lock` | No root package.json | Delete |
| `mobile/scripts/reset-project.js` | Template | Delete |
| `mobile/assets/expo.icon/` | Template | Delete |
| `mobile/assets/images/*` | Template (keep icon.png) | Delete most |
| `pipeline/scenario_engine.py` (commented block) | Dead code | Delete lines 205–387 |
| `frontend/public/next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg` | Template | Delete |

---

# 15. Bug Hunt

| Bug | Severity | Location | Impact | Fix |
|---|---|---|---|---|
| Random-walk forecast | **Critical** | `routes.py:145-166` | Fabricated data | Remove |
| `lru_cache` not cleared on base case upload | **High** | `data_loader.py:51` + `upload_service.py:83` | Stale data after upload | Call `load_base_case.cache_clear()` |
| `subprocess.run` retrain | **High** | `upload_service.py:226` | Injection risk | Task queue |
| No file locking on CSV writes | **High** | `scenario_service.py` CRUD | Data corruption | Add lock |
| `on_bad_lines="skip"` | **Medium** | `data_loader.py:53,68,93` | Silent data loss | Log skipped rows |
| `tempfile.mktemp` | **Low** | `tests/conftest.py:19` | Deprecated | `mkdtemp` |
| `# noqa: E712` | **Low** | `alert_service.py:43` | Style | `is False` |
| `#END` comment | **Low** | `routes.py:41` | Clutter | Remove |
| `contansts` typo | **Low** | `backend/app/contansts/` | Confusion | Rename |
| `USE_MOCK_API` hardcoded | **Medium** | `frontend/lib/api.ts:9` | Can't toggle | Env |
| `DEV_AUTH_BYPASS` in committed env | **Critical** | `frontend/.env.local` | Auth bypass | Remove |
| `MOCK_BRIEFS` in routes | **High** | `routes.py:189-239` | Fake data | Remove |
| `get_quarterly` returns list not dict | **Medium** | `history_service.py:128-134` | Interface inconsistency | Fix |
| `_fetch_indicator` signature mismatch | **Medium** | `economic_service.py` vs `test_economic_service.py` | Tests pass `mrv=8` but function uses `history_years=8` | Fix signature |
| `model.forecast(steps=2)` always 2 quarters | **Medium** | `routes.py:113` | Horizon parameter ignored for ARIMA | Map horizon to steps |
| `p50` on historical points = 0 | **Medium** | `routes.py:160` | Historical median hidden in fallback | Fix |
| No `n_months` validation | **Low** | `routes.py:180` | Negative values possible | Validate |
| No pagination caps | **Medium** | `routes.py:434,441` | `limit=1000000` returns everything | Cap limits |
| SQLite `DateTime(timezone=True)` returns naive | **Medium** | `models/*.py` | Timezone bugs in comparisons | Normalize to UTC |
| `Article.url` UNIQUE only; no composite dedup | **Medium** | `scraper_service.py:345` | Same story from different URLs duplicates | Add title hash |
| `board_briefs` JSON columns not migrated | **Low** | `models/board_brief.py` | Schema changes require `create_all` only | Use Alembic migrations |
| No DB migrations | **High** | `models/database.py` | Schema drift in production | Add Alembic |
| `sessionmaker` not scoped per request | **Medium** | `models/database.py` | Thread-safety concerns with scheduler | Use scoped_session |

---

# 16. Roadmap

## Immediate (Critical) — Before Any Production Use

| Task | Effort | Description |
|---|---|---|
| Revoke exposed GitHub PAT | 30 min | Rotate the token, remove from `.git/config` |
| Remove `.env.local` from git | 30 min | Add to `.gitignore`; rotate Supabase keys |
| Add backend authentication | 1 day | JWT or API-key middleware on all `/api/*` routes |
| Remove random-walk forecast | 2 hrs | Return `503` with clear "model unavailable" message |
| Remove hardcoded `MOCK_BRIEFS` | 2 hrs | Use `brief_service.generate_board_brief` only |
| Add API rate limiting | 1 day | `slowapi` or middleware on `/api/retrain`, `/api/news/scrape`, `/api/upload/*` |
| Validate upload inputs | 1 day | Whitelist KPI IDs, file sizes, value ranges |
| Fix `Dockerfile` model mount | 2 hrs | Make `models/artefacts` writable for retrain |
| Add CI (GitHub Actions) | 1 day | `pytest`, ESLint, TypeScript, build frontend |
| Remove `DEV_AUTH_BYPASS` from prod path | 2 hrs | Gate strictly behind `NODE_ENV=development` |

## Short-Term (Next 2–4 Weeks)

| Task | Effort | Description |
|---|---|---|
| Consolidate scenario engines | 2 days | Single `shared/scenario_engine.py` |
| Fix `lru_cache` invalidation on upload | 2 hrs | Call `cache_clear()` in upload paths |
| Add file locking to CSV writes | 1 day | `filelock` on CRUD operations |
| Remove `subprocess.run` retrain | 1 day | In-process training or `Celery`/`ARQ` task queue |
| Fix `history_service` interface | 1 day | Consistent `get_quarterly`/`get_monthly` contracts |
| Move feedback/logs to SQLite | 1 day | Replace JSON files with DB tables |
| Add Alembic migrations | 1 day | Versioned schema |
| Expand test coverage (scenario, reverse, upload, MC) | 3 days | Critical missing tests |
| Add monitoring (Prometheus + Grafana) | 3 days | Metrics on API, scheduler, scraper |
| Remove mock data from prod path | 1 day | Gate `USE_MOCK_API` behind `NODE_ENV` |

## Medium-Term (Next 1–3 Months)

| Task | Effort | Description |
|---|---|---|
| Collect more training data (quarterly) | 2 weeks | 24+ rows minimum; proper CV |
| Fix synthetic augmentation or remove | 1 day | Or use expert-calibrated impacts |
| Write model cards | 1 day | Target definitions, features, validation, limitations |
| Add model registry & versioning | 3 days | MLflow or simple artefact repo |
| Add prediction logging & drift detection | 3 days | Log inputs/outputs; drift alerts |
| Calibrate severity scores | 3 days | Against historical outcomes |
| API documentation (OpenAPI) | 1 day | Commit spec; add Swagger UI |
| Frontend tests (Jest/RTL) | 5 days | Component and page tests |
| Update docs (README, BACKEND, architecture) | 1 day | Match current state |
| Mobile app decision | 1 day | Rewrite with real features or remove from repo |

## Long-Term (Strategic)

| Task | Effort | Description |
|---|---|---|
| Migrate to PostgreSQL + Alembic | 2 weeks | Production-grade persistence |
| Add Redis cache layer | 1 week | For economics, intelligence, forecast |
| Add event-driven pipelines | 2 weeks | Kafka/RabbitMQ for scraper→NLP→alerts |
| Add user roles/permissions | 1 week | RBAC on frontend + backend |
| Add audit trail for all state changes | 1 week | Scenario CRUD, uploads, retrains |
| Add data backup & recovery | 2 days | CSV + DB snapshots |
| Add multi-environment deployment | 1 week | Dev/Staging/Prod with secrets manager |
| Add feature flags | 3 days | Toggle forecast, ML, alerts |

---

# 17. Refactoring Plan

## Phase 1 — Critical Security & Integrity (Week 1)

| Step | Details | Effort |
|---|---|---|
| 1.1 | Revoke GitHub PAT; remove from remote URL; rotate Supabase keys | 30 min |
| 1.2 | Remove `.env.local`, `.env.development` from git; add to `.gitignore`; create `.env.example` | 30 min |
| 1.3 | Add auth middleware to backend (JWT bearer shared with Supabase) | 1 day |
| 1.4 | Remove random-walk forecast fallback; return 503 with clear error | 2 hrs |
| 1.5 | Remove hardcoded `MOCK_BRIEFS`; wire briefs to DB service | 2 hrs |
| 1.6 | Add rate limiting to `/api/retrain`, `/api/news/scrape`, `/api/upload/*` | 1 day |
| 1.7 | Validate upload file sizes (max 10 MB), KPI ID whitelist, value ranges | 1 day |

## Phase 2 — Data & Model Integrity (Weeks 2–3)

| Step | Details | Effort |
|---|---|---|
| 2.1 | Consolidate scenario engines into `shared/scenario_engine.py` | 2 days |
| 2.2 | Fix `lru_cache` invalidation on uploads | 2 hrs |
| 2.3 | Add `filelock` to scenario CSV CRUD | 1 day |
| 2.4 | Replace `subprocess.run` retrain with in-process `train_all_models()` | 1 day |
| 2.5 | Collect quarterly data (2020Q1–2025Q4); retrain with proper temporal CV | 2 weeks |
| 2.6 | Remove or fix broken synthetic augmentation | 1 day |
| 2.7 | Write model cards for XGBoost and ARIMA | 1 day |

## Phase 3 — Architecture & Reliability (Weeks 4–6)

| Step | Details | Effort |
|---|---|---|
| 3.1 | Split `routes.py` into feature routers (`kpis`, `scenarios`, `news`, `alerts`, `uploads`, `briefs`, `economics`) | 2 days |
| 3.2 | Move direct DB queries from routes into services | 1 day |
| 3.3 | Move feedback/logs from JSON files to SQLite tables | 1 day |
| 3.4 | Add Alembic migrations | 1 day |
| 3.5 | Clean `sys.path` hacks with proper package layout | 1 day |
| 3.6 | Consolidate `frontend/components/layout/` and `frontend/components/shell/` | 1 day |
| 3.7 | Gate mock data behind `process.env.NODE_ENV`; remove from prod build | 1 day |

## Phase 4 — DevOps & Observability (Weeks 6–8)

| Step | Details | Effort |
|---|---|---|
| 4.1 | Add GitHub Actions: pytest, ESLint, tsc, Next build | 1 day |
| 4.2 | Fix docker-compose: writable model mount, `.dockerignore`, frontend healthcheck | 1 day |
| 4.3 | Add Prometheus metrics endpoint + Grafana dashboards | 3 days |
| 4.4 | Add structured logging (JSON) + log aggregation | 2 days |
| 4.5 | Set up secrets management (GitHub Actions secrets / Vault) | 1 day |
| 4.6 | Add `docker-compose.prod.yml` with Postgres + Redis | 2 days |

## Phase 5 — Testing & Docs (Weeks 8–10)

| Step | Details | Effort |
|---|---|---|
| 5.1 | Add tests: scenario engine, reverse stress, Monte Carlo, upload, retrain | 3 days |
| 5.2 | Add frontend Jest/RTL tests for key pages | 5 days |
| 5.3 | Add security tests (auth bypass, injection, rate limit) | 2 days |
| 5.4 | Update README, BACKEND.md, architecture.md, DEPLOY.md | 1 day |
| 5.5 | Commit OpenAPI spec | 1 day |

---

# 18. Final Verdict

## Is This Project Production-Ready?

**NO.** This project is a **functional prototype / demo** at best. It has:
- Critical security vulnerabilities (exposed tokens, auth bypass, unauthenticated API)
- Statistically meaningless ML models (6 training rows)
- Fabricated data presented as real (random-walk forecasts, heuristic SHAP, mock briefs)
- Zero CI/CD, monitoring, or deployment safety
- A mobile app that is an untouched template

## What Percentage Complete Is It?

| Phase | Completion |
|---|---|
| Feature development (UI/API surface) | **70%** |
| Data layer & provenance | **60%** |
| ML / risk modelling | **20%** |
| Security | **10%** |
| Testing | **35%** |
| DevOps / deployment | **10%** |
| Documentation | **50%** |
| **Overall project completion** | **~40%** |

## Top 10 Issues

1. Exposed GitHub Personal Access Token in `.git/config`
2. Committed `.env.local` with Supabase key and `DEV_AUTH_BYPASS=true`
3. Backend API has zero authentication
4. ML models trained on 6 real rows are meaningless
5. Random-walk forecast fabricates data presented as real
6. Two divergent scenario engines can produce inconsistent results
7. No CI/CD pipeline at all (`blank.yml` is empty)
8. No monitoring, logging aggregation, or alerting
9. Mobile app is a default Expo template with no functionality
10. Hardcoded mock data (`MOCK_BRIEFS`, `mockData.ts`) risks leaking into production

## Top 10 Improvements

1. Revoke and rotate all exposed credentials; secure git remote
2. Add backend API authentication and authorization
3. Remove all fabricated data paths (random-walk forecast, heuristic SHAP, MOCK_BRIEFS)
4. Collect proper training data and retrain models with real validation
5. Consolidate the two scenario engines into one shared module
6. Build a real CI/CD pipeline with tests, lint, and build checks
7. Add production-grade monitoring (Prometheus/Grafana)
8. Add Alembic migrations and proper database versioning
9. Move mock data and auth bypass behind strict environment gates
10. Delete or fully rebuild the mobile app

## What Should Be Done Next?

1. **Immediately (today):** Revoke the GitHub PAT and rotate Supabase keys. Remove `.env.local` from git.
2. **This week:** Add backend authentication, remove fabricated data paths, add rate limiting.
3. **Next 2 weeks:** Collect more training data, fix model training, consolidate scenario engines.
4. **Next month:** Build CI/CD, add monitoring, expand testing.
5. **Ongoing:** Treat the current model outputs as **decision-support placeholders**, never as calibrated risk scores, until properly validated ML is in place.
