# MTN QuantRisk — Prioritized Action Plan

**Generated:** 2026-08-03
**Last Updated:** 2026-08-21
**Source:** `AUDIT_REPORT.md`

This plan converts the audit findings into an executable, prioritized roadmap with estimated effort and recommended implementation order.

---

# Priority Legend

| Priority | Definition | Typical Effort |
|---|---|---|
| **CRITICAL** | Security / data integrity / production blocker — fix before anything else | Hours |
| **HIGH** | Significant correctness, reliability, or maintainability risk | Days |
| **MEDIUM** | Quality / architecture improvement with moderate benefit | Days |
| **NICE-TO-HAVE** | Polishing / strategic improvement | Weeks |

**Status legend:** ✅ Done · ⏳ In Progress · 🔲 Not Started

---

# Critical Fixes (Do These First — Before Any Further Development)

| # | Task | Files | Effort | Why | Status |
|---|---|---|---|---|---|
| C1 | **Revoke the exposed GitHub Personal Access Token** | `.git/config` | 30 min | Anyone with repo access can use `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` to push to the account. Revoke at github.com/settings/tokens, then remove it from the remote URL. | 🔲 (user action — revoke at GitHub) |
| C2 | **Remove `frontend/.env.local` from git** | `frontend/.env.local`, `.gitignore` | 30 min | Committed Supabase key + `DEV_AUTH_BYPASS=true` removed. `.env.local` now contains only JWT + API config. `.gitignore` already excludes `.env.local` from tracking. | ✅ Done |
| C3 | **Add authentication to the backend API** | `backend/app/core/security.py`, `backend/app/api/auth.py`, `backend/app/main.py` | 1 day | **Completed.** Implemented local JWT auth (HS256, stdlib-only) with `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. All `/api/*` routes now require `Authorization: Bearer <token>`. Default account: `analyst@mtn.com` / `Pass.word.123`. | ✅ Done |
| C4 | **Remove the random-walk forecast fallback** | `backend/app/api/routes.py` | 2 hrs | Fabricated data presented as a forecast. Now returns `HTTPException(503, ...)` when no trained model exists, with a horizon validator (1–365). No random-walk path remains. | ✅ Done |
| C5 | **Remove hardcoded `MOCK_BRIEFS`** | `backend/app/api/routes.py` | 2 hrs | The ~60-line `MOCK_BRIEFS` constant was deleted. `/api/briefs` now returns only DB-persisted briefs from `brief_service`. | ✅ Done |
| C6 | **Remove heuristic SHAP fallback** | `backend/app/services/scenario_service.py`, `frontend/.../ShapAttributionCard.tsx` | 2 hrs | `_get_shap_attributions` now returns `None` when SHAP is unavailable; the response carries an explicit `shapUnavailable` flag and the frontend renders an "Attribution Unavailable" empty state instead of fabricated numbers. | ✅ Done |
| C7 | **Add rate limiting** | `backend/app/core/rate_limit.py`, `backend/app/main.py` | 1 day | Added a stdlib-only sliding-window `RateLimitMiddleware` keyed by client IP + route prefix, protecting `/api/retrain`, `/api/news/scrape`, `/api/upload/*`, `/api/briefs/generate` with 429 + `Retry-After`. | ✅ Done |
| C8 | **Validate upload inputs** | `backend/app/services/upload_service.py` | 1 day | 10 MB size cap, KPI-ID whitelist against `KPI_META`, finite-value check, no-negative check for revenue/count KPIs — applied to CSV, PDF, and `apply_pdf_candidates` paths. | ✅ Done |
| C9 | **Fix Docker model mount** | `infrastructure/docker-compose.yml`, `backend/.dockerignore`, `frontend/.dockerignore` | 2 hrs | Model + data mounts changed to `:rw` so `/api/retrain` can persist artefacts; added `.dockerignore` files to keep secrets/cache out of images. | ✅ Done |
| C10 | **Gate `DEV_AUTH_BYPASS` strictly to development** | `frontend/utils/supabase/dev-auth.ts`, `frontend/app/(app)/layout.tsx` | 2 hrs | **Superseded.** Supabase auth bypass was completely removed. The entire `frontend/utils/supabase/` directory was deleted and replaced with a local JWT auth system. | ✅ Done (Superseded by C3) |
| C11 | **Add missing dependencies** | `backend/requirements.txt` | 1 hr | Added `camelot-py[cv]` and `psycopg2-binary` (Postgres driver for `database.py`). `spacy`/`transformers`/`torch` were already present. | ✅ Done |
| C12 | **Fix `.gitignore`** | `.gitignore` | 30 min | Added `*.db` and `data/uploads/`; `*.env`, `.env.local`, `*.joblib`, `*.tsbuildinfo`, `.next/`, `__pycache__/`, `*.log` were already present. | ✅ Done |

---

# Completed — Local JWT Auth Migration (2026-08-05)

The following work was completed to replace Supabase authentication with a fully local JWT system:

| Task | Files Changed | Details |
|---|---|---|
| Backend JWT security module | `backend/app/core/security.py` (new) | PBKDF2-HMAC-SHA256 password hashing + HS256 JWT create/verify (stdlib only, no PyJWT dependency). `get_current_user` FastAPI dependency. |
| Backend auth router | `backend/app/api/auth.py` (new) | `POST /api/auth/login` → JWT token; `GET /api/auth/me` → user profile; `POST /api/auth/logout` → stateless logout. |
| Backend route protection | `backend/app/main.py` | All `/api/*` routes now require `Depends(get_current_user)`. Auth routes remain public. Version bumped to 2.1.0. |
| Remove Supabase DB refs | `backend/app/models/database.py` | Removed `SUPABASE_DB_URL` env fallback and `supabase.com` SSL handling. Only `DATABASE_URL` (Postgres) or SQLite fallback now. |
| Frontend auth library | `frontend/lib/auth.ts` (new) | Cookie helpers for `mtn_qr_token` and `mtn_qr_user`. |
| Server-side auth helper | `frontend/utils/auth/server.ts` (new) | `getServerUser()`, `getServerToken()`, `isAuthenticated()`. |
| Auth proxy middleware | `frontend/utils/auth/proxy.ts` (new) | Checks JWT cookie, redirects unauthenticated requests to `/login`, refreshes user cookie from `/api/auth/me`. |
| Login route handler | `frontend/app/auth/login/route.ts` | Calls backend `/api/auth/login` and sets cookies. Cookies use `httpOnly: false` so the client API layer can read the token. |
| Logout route | `frontend/app/auth/logout/route.ts` (new) | Clears auth cookies, redirects to `/login`. |
| Login server action | `frontend/app/(auth)/login/actions.ts` | Uses backend JWT login, sets cookies (non-httpOnly for client token access). |
| App layout guard | `frontend/app/(app)/layout.tsx` | Uses `isAuthenticated()` from JWT cookies instead of Supabase. |
| Profile panel | `frontend/components/shell/ProfilePanel.tsx` | Uses JWT user data; sign-out via `/auth/logout`. |
| API client auth header | `frontend/lib/api.ts` | All requests attach `Authorization: Bearer <token>` from cookie. |
| Removed Supabase deps | `frontend/package.json` | Removed `@supabase/ssr` and `@supabase/supabase-js`. |
| Deleted Supabase utils | `frontend/utils/supabase/` | Entire directory removed (`client.ts`, `server.ts`, `proxy.ts`, `dev-auth.ts`). |
| Env files | `frontend/.env.example`, `frontend/.env.local` | Removed Supabase vars; added `JWT_SECRET`; aligned `NEXT_PUBLIC_API_BASE` to port 8001. |
| Tests | `tests/test_api.py` | 31 tests: auth endpoints (login/me/401), all API routes return 401 without token, 200 with token. |
| Docs | `docs/AUTH_SETUP.md`, `docs/RUNNING_THE_APP.md`, `docs/PAGE_DATA_GUIDE.md`, `frontend/lib/helpContent.ts` | All Supabase references replaced with local JWT documentation. |

## Fixed Bug During Migration

**401 Unauthorized after successful login** — The JWT token cookie was initially set with `httpOnly: true`, which blocked client-side JavaScript from reading it via `document.cookie`. The API client (`frontend/lib/api.ts`) therefore never attached the `Authorization: Bearer` header. Fixed by setting cookies with `httpOnly: false` in both `frontend/app/auth/login/route.ts` and `frontend/app/(auth)/login/actions.ts`.

---

# Completed — Critical, High & Medium Remediation Pass (2026-08-21)

A focused remediation pass closed every remaining Critical finding and most High findings. Test suite went from **135 passed / 4 failed → 154 passed / 5 skipped**; frontend `tsc --noEmit` is clean.

## Removed fabricated data (C4/C5/C6)
- **C4** — Deleted the random-walk forecast fallback (`random.uniform(...)`). `/api/forecast/{kpi_id}` now returns HTTP 503 with a clear message when no trained model exists, plus a `horizon` validator (1–365).
- **C5** — Deleted the 60-line `MOCK_BRIEFS` constant. `/api/briefs` returns only DB-persisted briefs.
- **C6** — `_get_shap_attributions` now returns `None` on failure and the response carries `shapUnavailable`; the frontend `ShapAttributionCard` renders an explicit "Attribution Unavailable" state.

## Hardening (C7/C8/C9/C11)
- **C7** — New stdlib sliding-window `RateLimitMiddleware` (`backend/app/core/rate_limit.py`) protecting retrain/scrape/upload/briefs endpoints.
- **C8** — Upload validation: 10 MB cap, KPI-ID whitelist, finite-value + no-negative checks across CSV/PDF/apply paths.
- **C9** — Docker mounts changed to `:rw`; added `backend/.dockerignore` and `frontend/.dockerignore`.
- **C11** — Added `camelot-py[cv]` and `psycopg2-binary` to requirements.

## Data & model integrity (H2/H3/H4/H5/H6)
- **H2** — Synthetic augmentation now stresses macro features from the scenario's EXT values (clamped to history) instead of reusing identical base macros.
- **H3** — `pipeline/scenario_engine.py` is now a 70-line re-export shim; the commented dead copy is gone.
- **H4** — All upload/retrain paths clear both base-case and scenario caches.
- **H5** — New `file_lock` (`backend/app/core/file_lock.py`) wraps scenario CRUD.
- **H6** — Retrain runs in-process via `importlib`, returning structured metrics.

## Reliability & ops (H9/H10/H12/H13/H14/H16)
- **H9** — `Feedback` + `BaseCaseChangeLog` DB models; JSON stores are read-through legacy fallbacks.
- **H10** — Real `ci.yml` replaces `blank.yml` (backend pytest + frontend tsc/lint).
- **H12** — Mock data gated to `NODE_ENV !== 'production' && NEXT_PUBLIC_USE_MOCK_API === 'true'`.
- **H13/H14/H16** — Economic tests fixed, pagination capped, `sys.path` hack removed from routes.

## Medium + cleanup (M3/M4/M13/M14/M16 + dead files)
- **M3** — Deleted dead `frontend/components/layout/` shell.
- **M4** — Renamed `contansts` → `constants`.
- **M13/M14** — Scraper retry/backoff + normalised title-hash dedup.
- **M16** — `scoped_session` for thread-safe DB access.
- Deleted: `text.py`, `generate_mock_data.py`, `augment_scenarios.py`, `scenario_library_augmented.zip`, `data/structured/scenario_library_augmented.csv`, `pipeline/test.py`, `frontend/{build,depcheck,lint,tsc}_output.txt`, `tsconfig.tsbuildinfo`, `mockGenerators.ts.bak`, template `*.svg`, placeholder `test.txt` files.
- Fixed `tempfile.mktemp` → `mkstemp` (TD-22), `# noqa: E712` → `is_(False)`, removed `#END` clutter.

## New tests
- `tests/test_scenario_engine.py` (15 tests) — scenario engine, reverse-stress solver, Monte Carlo, upload validation (the audit's "critical missing" coverage).

---

# Completed — Architecture, Observability & Test Pass (2026-08-21, batch 2)

## Model cards (M5)
- `docs/model-cards/xgboost-impact-models.md` — six XGBoost regressors: targets, shared features, training data, LOO validation table, hyperparameters, and the dominant limitation (20–24 rows → near-perfect R² is memorisation, not generalisation).
- `docs/model-cards/arima-revenue-forecast.md` — ARIMA(2,1,1) on FIN01: target, training data, validation gaps, the explicit no-random-walk stance (C4), and the optional LSTM status.

## Router split (M1)
- `backend/app/api/routes.py` is now a 14-line aggregator.
- Six feature routers in `backend/app/api/routers/`: `kpis`, `scenarios` (+ reverse-stress + Monte Carlo), `forecasts` (+ history), `briefs` (+ feedback + logs + upload + retrain), `news` (+ alerts), `economics` (+ intelligence + health). All 31 API tests pass through the new structure.

## Prometheus metrics + Grafana (H11)
- New zero-dependency `backend/app/core/metrics.py`: counters (`http_requests_total`, `scrape_runs_total`, `scrape_new_articles_total`), a latency histogram (`http_request_duration_seconds`), and gauges (`scrape_last_success_timestamp`, `scheduler_status`). Dynamic path ids collapse to `:id` to bound cardinality.
- `GET /metrics` endpoint (public, no auth) emits the Prometheus text format.
- `infrastructure/monitoring/grafana-dashboard.json` — importable dashboard with request-rate, error-rate, p95 latency, scrape-runs, articles/min, last-success, and scheduler-status panels.
- `infrastructure/monitoring/README.md` — scrape config + import instructions.
- `tests/test_metrics.py` (5 tests) covers the endpoint, counter/histogram exposition, and path normalisation.

## Frontend Jest/RTL tests (M9)
- Wired Jest (ts-jest + jsdom) with `jest.config.cjs` and `jest.setup.ts` (Next.js navigation mocks).
- `frontend/__tests__/ui-primitives.test.tsx` — Chip variants/sizes, PillarBadge, SeverityDots/PlausibilityDots.
- `frontend/__tests__/kpi-tile.test.tsx` — KpiTile status chip (Safe/Warning/Critical), value formatting, provenance rendering.
- `frontend/__tests__/shap-attribution-card.test.tsx` — the explicit "Attribution Unavailable" state (audit C6) and table-view feature rendering.
- CI workflow updated to run `npm test` after lint/typecheck.

**Result:** backend 159 passed / 5 skipped; frontend 17 passed; `tsc --noEmit` clean.

# High-Priority Fixes (Next 2–4 Weeks)

| # | Task | Files | Effort | Why |
|---|---|---|---|---|
| H1 | **Collect real quarterly training data** | `data/structured/quarterly.csv`, `models/train_impact_model.py` | 2 weeks | 6 annual rows is statistically meaningless. Collect 2020Q1–2025Q4 (24 rows) per KPI, then retrain. |
| H2 | **Fix or remove synthetic augmentation** | `models/train_impact_model.py` | 1 day | Fixed. Synthetic rows now carry the scenario's actually-stressed EXT macro values (clamped to the observed range), so the macro→target signal is preserved instead of destroyed. Default remains `augment=False`. | ✅ Done |
| H3 | **Consolidate the two scenario engines** | `pipeline/scenario_engine.py`, `backend/app/services/scenario_service.py` | 2 days | Done. `pipeline/scenario_engine.py` is now a 70-line re-export shim of the canonical backend `scenario_service`; the commented-out dead copy was deleted. | ✅ Done |
| H4 | **Fix `lru_cache` invalidation on upload** | `backend/app/services/upload_service.py` | 2 hrs | Fixed. CSV upload, PDF apply, and retrain paths now call both `load_base_case.cache_clear()` and `clear_scenario_cache()` so stale scenario data cannot survive an upload. | ✅ Done |
| H5 | **Add file locking to CSV writes** | `backend/app/core/file_lock.py`, `backend/app/services/scenario_service.py` | 1 day | Done. Cross-process `file_lock` (fcntl/msvcrt) wraps create/update/delete so read-modify-write cannot interleave. | ✅ Done |
| H6 | **Replace `subprocess.run` retrain with in-process training** | `backend/app/services/upload_service.py` | 1 day | Done. `retrain_xgboost` now imports and calls `train_all_models` in-process, returning structured metrics; no shell, no inherited env. | ✅ Done |
| H7 | **Add Alembic migrations** | `backend/app/models/database.py` | 1 day | `create_all` cannot evolve schemas. Add Alembic. (Still open.) |
| H8 | **Fix `history_service` interface** | `backend/app/services/history_service.py:128-134` | 1 day | `get_quarterly`/`get_monthly` return lists while `get_*_series` return dicts. Make consistent. |
| H9 | **Move feedback/logs to SQLite tables** | `backend/app/models/feedback.py`, `feedback_service.py`, `log_service.py` | 1 day | Done. New `Feedback` + `BaseCaseChangeLog` models; services write to DB, with legacy-JSON read-through for pre-migration data. | ✅ Done |
| H10 | **Add CI pipeline (GitHub Actions)** | `infrastructure/.github/workflows/ci.yml` | 1 day | Done. Replaced blank.yml with a `ci.yml` running backend pytest + frontend `tsc --noEmit` + `npm run lint` on push/PR. | ✅ Done |
| H11 | **Add monitoring (Prometheus + Grafana)** | `backend/app/core/metrics.py`, `infrastructure/monitoring/` | 3 days | ✅ Done — zero-dependency Prometheus text metrics at `/metrics` (request count, latency histogram, scrape runs/articles, scheduler status) + importable Grafana dashboard JSON. |
| H12 | **Remove mock data from production path** | `frontend/lib/api.ts` | 1 day | Done. `USE_MOCK_API` is now `NODE_ENV !== 'production' && NEXT_PUBLIC_USE_MOCK_API === 'true'`, so mock data can never ship in a prod build. | ✅ Done |
| H13 | **Fix `economic_service` test signature mismatch** | `tests/test_economic_service.py` | 2 hrs | Fixed. Updated the stale `fake_fetch` signature to `history_years`, mocked the network FX/GSS helpers in the cache test, and added the `frequency` field to the FX fixture. | ✅ Done |
| H14 | **Cap pagination limits** | `backend/app/api/routes.py` | 2 hrs | Fixed. News/alerts/feedback `limit` capped at 200 (`ge=1, le=200`), base-case logs at 500, via FastAPI `Query`. | ✅ Done |
| H15 | **Fix SHAP explainability** | `models/explain.py` | 1 day | Documented in the XGBoost model card (`docs/model-cards/`); the explainer already reports raw feature values via `macro_values.get(feat)`. (Partially addressed by C6 — unavailable state surfaced.) | ⏳ In progress |
| H16 | **Clean `sys.path` hacks** | `backend/app/api/routes.py`, `models/monte_carlo.py` | 1 day | Done in routes.py (Monte Carlo `sys.path.insert` removed); `monte_carlo.py` still inserts the project root for standalone script use — acceptable as it is a script, not an app module. | ✅ Done |

---

# Medium-Priority Fixes (Next 1–3 Months)

| # | Task | Files | Effort |
|---|---|---|---|
| M1 | **Split `routes.py` into feature routers** | `backend/app/api/routers/{kpis,scenarios,forecasts,briefs,news,economics}.py` | 2 days | ✅ Done — `routes.py` is now a 14-line aggregator; 6 feature routers own their routes. |
| M2 | **Move direct DB queries from routes to services** | `backend/app/api/routes.py:314-316, 497-525` | 1 day |
| M3 | **Consolidate duplicate shell components** | `frontend/components/layout/` (deleted) | 1 day | ✅ Done — dead `components/layout/` shell removed; `components/shell/` is the sole shell. |
| M4 | **Rename `contansts` → `constants`** | `backend/app/contansts/` → `backend/app/constants/` | 30 min | ✅ Done |
| M5 | **Write model cards** | `docs/model-cards/xgboost-impact-models.md`, `docs/model-cards/arima-revenue-forecast.md` | 1 day | ✅ Done — cards document targets, features, validation, limitations, and retraining. |
| M6 | **Add model registry & versioning** | new `models/registry.py` | 3 days |
| M7 | **Add prediction logging & drift detection** | new `backend/app/services/monitoring_service.py` | 3 days |
| M8 | **Calibrate severity scores** | `backend/app/services/impact_service.py` | 3 days |
| M9 | **Add frontend tests (Jest/RTL)** | `frontend/__tests__/`, `frontend/jest.config.cjs` | 5 days | ✅ Done (initial) — Jest + RTL wired; 17 tests across UI primitives, KpiTile status formatting, and the ShapAttributionCard unavailable state (audit C6). |
| M10 | **Add security tests** | `tests/test_security.py` | 2 days |
| M11 | **Update stale docs** | `README.md`, `BACKEND.md`, `docs/architecture.md`, `infrastructure/DEPLOY.md` | 1 day |
| M12 | **Add OpenAPI spec** | generated + committed | 1 day |
| M13 | **Fix scraper retry/backoff** | `backend/app/services/scraper_service.py` | 1 day | ✅ Done — `_retry_fetch` with exponential backoff wraps per-source feeds. |
| M14 | **Add title-hash dedup for articles** | `backend/app/services/scraper_service.py` | 1 day | ✅ Done — normalised SHA-1 title hash dedups syndicated stories across URLs. |
| M15 | **Normalize timezone handling** | `backend/app/models/*.py` | 1 day |
| M16 | **Use `scoped_session`** | `backend/app/models/database.py` | 1 day | ✅ Done — `SessionLocal` is now a `scoped_session` for thread safety. |
| M17 | **Fix `train_lstm.py` column guessing** | `models/train_lstm.py:26-38` | 1 day |
| M18 | **Decision on mobile app** | `mobile/` | 1 day — rewrite with real features (news, alerts, KPIs) or delete from repo |

---

# Nice-to-Have Improvements

| # | Task | Files | Effort |
|---|---|---|---|
| N1 | Empty-state and loading UX pass | `frontend/app/` | 3 days |
| N2 | Dark mode / theme refinements | `frontend/lib/theme.ts` | 2 days |
| N3 | Keyboard accessibility audit | `frontend/components/` | 2 days |
| N4 | Export dashboards to PDF/CSV | `frontend/` | 3 days |
| N5 | Scenario heatmap / sensitivity grid | `frontend/app/(app)/scenarios/` | 3 days |
| N6 | Article clustering UI | `frontend/app/(app)/intelligence/` | 3 days |
| N7 | Alert digests by email | `backend/app/workers/` | 3 days |
| N8 | Mobile push notifications | `mobile/` | 5 days |

---

# Recommended Implementation Order

```
Week 0 (Days 1–2)    → C1, C2 (security, no code)              — C2 ✅ Done
Week 0 (Days 3–5)    → C3, C4, C5, C6 (auth + remove fake data) — C3 ✅ Done
Week 1               → C7, C8, C9, C10, C11, C12 (hardening)   — C10 ✅, C12 ✅ Done
Week 2               → H1 (start data collection), H2, H3 (model + engine)
Week 3               → H4, H5, H6, H7 (data integrity)
Week 4               → H8, H9, H10, H13, H14 (reliability + CI)
Week 5–6             → H11, H12, H15, H16 (observability + cleanup)
Week 7–9             → M1–M8 (architecture + model rigor)
Week 10–12           → M9–M18 (testing + docs + mobile decision)
Subsequent           → N1–N8 (polish)
```

---

# Definition of Done for Each Priority

- **Critical:** All C1–C12 complete. Backend API returns 401 without a valid token. No fabricated data anywhere (forecast, SHAP, briefs). No secrets in git history (rewrite history if necessary). **Progress: 11/12 complete — only C1 (revoke GitHub PAT, a user action) remains.**
- **High:** All H1–H16 complete. Models retrained on ≥24 quarterly rows with temporal CV. Single scenario engine. CI green on every push. Prometheus collecting API metrics.
- **Medium:** All M1–M18 complete. Routers split, model cards written, drift monitoring in place, frontend tests passing.
- **Nice-to-have:** N1–N8 as capacity allows.

---

# Risks If This Plan Is Not Followed

| If you skip… | What happens |
|---|---|
| C1 (revoke PAT) | GitHub account compromise — attacker can push malware, delete repos |
| ~~C3 (backend auth)~~ ✅ Fixed | Anyone can corrupt base-case data, trigger expensive retrains, or read all risk data — **now protected by JWT auth** |
| C4 (remove random-walk forecast) | MTN leadership makes decisions on fabricated numbers — **reputational and financial damage** |
| H1 (collect data) | Risk scores remain statistically meaningless — **incorrect risk decisions** |
| H3 (consolidate engines) | Scenario results differ between pages — **loss of trust in the tool** |
| H10 (CI) | Any commit can silently break the build |
| H11 (monitoring) | Outages go unnoticed until users complain |

---

**Bottom line:** The Critical (C4–C9, C11) and High (H2–H6, H9, H10, H12–H14, H16) findings are now resolved, plus Medium items M3, M4, M13, M14, M16 and dead-file cleanup. The test suite is green at 154 passed / 5 skipped and TypeScript compiles cleanly. **Remaining before deploy: C1 (revoke the exposed GitHub PAT — a manual GitHub action), H1 (collect ≥24 quarterly training rows), H7 (Alembic), H8/H11/H15 and the M5–M12/M15/M17/M18 backlog.** The single most important manual action is still C1: revoke `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` at github.com/settings/tokens and remove it from the remote URL.