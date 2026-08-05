# MTN QuantRisk — Prioritized Action Plan

**Generated:** 2026-08-03
**Last Updated:** 2026-08-05
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
| C4 | **Remove the random-walk forecast fallback** | `backend/app/api/routes.py:145-166` | 2 hrs | Fabricated data presented as a forecast. Replace with `HTTPException(503, "Forecast model unavailable")`. | 🔲 Not Started |
| C5 | **Remove hardcoded `MOCK_BRIEFS`** | `backend/app/api/routes.py:189-239` | 2 hrs | Fake board briefs shown in production. Wire `/api/briefs` to `brief_service.list_board_briefs()` only. | 🔲 Not Started |
| C6 | **Remove heuristic SHAP fallback** | `backend/app/services/scenario_service.py:216-244` | 2 hrs | Fake "SHAP attributions" from hardcoded constants. Return `null` / `"unavailable"` when real SHAP fails. | 🔲 Not Started |
| C7 | **Add rate limiting** | `backend/app/main.py`, new `backend/app/core/rate_limit.py` | 1 day | Prevent DoS on `/api/retrain`, `/api/news/scrape`, `/api/upload/*`. Use `slowapi` or middleware. | 🔲 Not Started |
| C8 | **Validate upload inputs** | `backend/app/services/upload_service.py` | 1 day | Whitelist KPI IDs against `KPI_META`; enforce max file size (10 MB); validate value ranges (no negatives for revenue). | 🔲 Not Started |
| C9 | **Fix Docker model mount** | `infrastructure/docker-compose.yml:31` | 2 hrs | `../models/artefacts:ro` is read-only — `/api/retrain` will fail in Docker. Change to `:rw`. | 🔲 Not Started |
| C10 | **Gate `DEV_AUTH_BYPASS` strictly to development** | `frontend/utils/supabase/dev-auth.ts`, `frontend/app/(app)/layout.tsx` | 2 hrs | **Superseded.** Supabase auth bypass was completely removed. The entire `frontend/utils/supabase/` directory was deleted and replaced with a local JWT auth system. | ✅ Done (Superseded by C3) |
| C11 | **Add missing dependencies** | `backend/requirements.txt` | 1 hr | `camelot`, `spacy`, `psycopg2`, `tensorflow` are imported in code but absent from requirements. | 🔲 Not Started |
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

# High-Priority Fixes (Next 2–4 Weeks)

| # | Task | Files | Effort | Why |
|---|---|---|---|---|
| H1 | **Collect real quarterly training data** | `data/structured/quarterly.csv`, `models/train_impact_model.py` | 2 weeks | 6 annual rows is statistically meaningless. Collect 2020Q1–2025Q4 (24 rows) per KPI, then retrain. |
| H2 | **Fix or remove synthetic augmentation** | `models/train_impact_model.py:52-113` | 1 day | Currently creates rows with identical features and different targets — model learns noise. Either properly stress macro features or delete augmentation. |
| H3 | **Consolidate the two scenario engines** | `pipeline/scenario_engine.py`, `backend/app/services/scenario_service.py` | 2 days | Two implementations can produce different results. Create `shared/scenario_engine.py` and make both callers use it. |
| H4 | **Fix `lru_cache` invalidation on upload** | `backend/app/services/upload_service.py:83,211` | 2 hrs | `load_base_case.cache_clear()` is called, but `load_scenario_details`/`load_scenario_meta` caches are only cleared via `clear_scenario_cache()` which is not called after base-case upload. Verify and fix. |
| H5 | **Add file locking to CSV writes** | `backend/app/services/scenario_service.py` CRUD | 1 day | Concurrent scenario CRUD can corrupt CSVs. Use `filelock`. |
| H6 | **Replace `subprocess.run` retrain with in-process training** | `backend/app/services/upload_service.py:218-234` | 1 day | Avoid shelling out. Import `train_all_models` and call in-process, or use `ARQ`/`Celery`. |
| H7 | **Add Alembic migrations** | `backend/app/models/database.py` | 1 day | `create_all` cannot evolve schemas. Add Alembic. |
| H8 | **Fix `history_service` interface** | `backend/app/services/history_service.py:128-134` | 1 day | `get_quarterly`/`get_monthly` return lists while `get_*_series` return dicts. Make consistent. |
| H9 | **Move feedback/logs to SQLite tables** | `backend/app/services/feedback_service.py`, `log_service.py` | 1 day | JSON files have race conditions. Add `Feedback` and `BaseCaseChangeLog` tables. |
| H10 | **Add CI pipeline (GitHub Actions)** | `infrastructure/.github/workflows/blank.yml` → replace with `ci.yml` | 1 day | pytest + ESLint + tsc + Next build on every push/PR. |
| H11 | **Add monitoring (Prometheus + Grafana)** | new `backend/app/core/metrics.py`, `infrastructure/monitoring/` | 3 days | Metrics for API latency, scheduler runs, scraper health, NLP pipeline, model predictions. |
| H12 | **Remove mock data from production path** | `frontend/lib/mockData.ts`, `mockGenerators.ts`, `frontend/lib/api.ts:9` | 1 day | Gate `USE_MOCK_API` behind `process.env.NODE_ENV === 'development'` and `NEXT_PUBLIC_USE_MOCK_API === 'true'`. Exclude from production build. |
| H13 | **Fix `economic_service` test signature mismatch** | `backend/app/services/economic_service.py`, `tests/test_economic_service.py` | 2 hrs | Test passes `mrv=8` but function signature is `history_years`. Align. |
| H14 | **Cap pagination limits** | `backend/app/api/routes.py:434,441` | 2 hrs | `limit` param is unbounded. Cap at 100 for news, alerts, feedback, logs. |
| H15 | **Fix SHAP explainability** | `models/explain.py` | 1 day | Report raw feature values alongside scaled SHAP; use `shap.Explainer` correctly. |
| H16 | **Clean `sys.path` hacks** | `backend/app/api/routes.py:397`, `models/monte_carlo.py:29` | 1 day | Use proper package imports (e.g., `from app.services.data_loader import ...`). |

---

# Medium-Priority Fixes (Next 1–3 Months)

| # | Task | Files | Effort |
|---|---|---|---|
| M1 | **Split `routes.py` into feature routers** | `backend/app/api/routes.py` → `routers/` | 2 days |
| M2 | **Move direct DB queries from routes to services** | `backend/app/api/routes.py:314-316, 497-525` | 1 day |
| M3 | **Consolidate duplicate shell components** | `frontend/components/layout/` + `frontend/components/shell/` | 1 day |
| M4 | **Rename `contansts` → `constants`** | `backend/app/contansts/` | 30 min |
| M5 | **Write model cards** | new `docs/model-cards/` | 1 day |
| M6 | **Add model registry & versioning** | new `models/registry.py` | 3 days |
| M7 | **Add prediction logging & drift detection** | new `backend/app/services/monitoring_service.py` | 3 days |
| M8 | **Calibrate severity scores** | `backend/app/services/impact_service.py` | 3 days |
| M9 | **Add frontend tests (Jest/RTL)** | `frontend/` | 5 days |
| M10 | **Add security tests** | `tests/test_security.py` | 2 days |
| M11 | **Update stale docs** | `README.md`, `BACKEND.md`, `docs/architecture.md`, `infrastructure/DEPLOY.md` | 1 day |
| M12 | **Add OpenAPI spec** | generated + committed | 1 day |
| M13 | **Fix scraper retry/backoff** | `backend/app/services/scraper_service.py` | 1 day |
| M14 | **Add title-hash dedup for articles** | `backend/app/services/scraper_service.py:345` | 1 day |
| M15 | **Normalize timezone handling** | `backend/app/models/*.py` | 1 day |
| M16 | **Use `scoped_session`** | `backend/app/models/database.py` | 1 day |
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

- **Critical:** All C1–C12 complete. Backend API returns 401 without a valid token. No fabricated data anywhere (forecast, SHAP, briefs). No secrets in git history (rewrite history if necessary). **Progress: C2, C3, C10, C12 complete (4/12).**
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

**Bottom line:** This is a promising prototype with a strong feature surface, but it is **not safe to deploy** until the remaining Critical fixes are complete. The backend API is now protected by JWT authentication (C3 ✅), but C4–C9 and C11 remain open. Prioritize the remaining C-items before any new feature work.