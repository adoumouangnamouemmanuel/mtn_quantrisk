# MTN QuantRisk — Phase 2–6 Completion Plan

**Build week:** Jul 13–18 2026  
**Test week:** Jul 19–25 2026  
**Team:** Emmanuel (Tech Lead/Backend) · Chidima (Backend) · Nana (ML/Mobile) · Foureiratou (ML/Frontend)

---

## The Big Picture

You skipped Phases 2 & 3 and built Phase 4 (the web dashboard) first — that was smart for demos. The quantitative risk engine, stress tester, Monte Carlo, reverse stress, and SHAP attribution are **fully working**. What you're adding this week is the **live data layer underneath**: real news ingestion, NLP scoring, alerts from real articles, basic mobile screens, and deployment.

---

## Current State — What's Already Built

### Phase 1 ✅ Complete
- FastAPI backend skeleton, risk taxonomy, CSV data files, architecture docs, ADRs

### Phase 4 ✅ 92% Complete (Web Dashboard)

**All 12 frontend pages working with real API:**

| Page | Status |
|------|--------|
| `/dashboard` — 14 KPI tiles | ✅ Done |
| `/scenarios` — Stress Tester (3\|9 layout, banner, SHAP) | ✅ Done |
| `/monte-carlo` — 1000-sim MC with distribution bars | ✅ Done |
| `/reverse` — Binary search solver + trajectory | ✅ Done |
| `/compare` — Side-by-side scenario comparison | ✅ Done |
| `/forecasts` — ARIMA 90-day chart | ✅ Done |
| `/kri-register` — Full KRI table | ✅ Done |
| `/quarterly` + `/monthly` — Trend charts | ✅ Done |
| `/briefs` — Board brief library | ✅ Done |
| `/help` — Q&A + Glossary + Guides | ✅ Done |
| `/settings` — Upload + retrain | ✅ Done |

**Backend API endpoints (all live):**
- `GET/POST/PUT/DELETE /api/scenarios` — full CRUD (87 scenarios)
- `POST /api/scenarios/{id}/run` — scenario stress engine
- `POST /api/reverse-stress` — binary search solver
- `POST /api/monte-carlo` — Monte Carlo simulation
- `GET /api/forecast/{kpi_id}` — ARIMA + random-walk fallback
- `GET /api/quarterly/{id}` + `GET /api/monthly/{id}` — historical data
- `GET/POST /api/briefs` — board brief generation
- `POST /api/upload/csv` + `/pdf` — data uploads
- `POST /api/retrain` — XGBoost retrain trigger
- `GET /api/health` — pipeline health check

**ML models trained and working:**
- XGBoost × 6 KPI targets (`.joblib` files)
- SHAP TreeExplainer attribution
- ARIMA(2,1,1) revenue forecaster
- Monte Carlo Gaussian engine
- Binary search reverse stress solver
- StandardScaler feature pipeline

---

## Gap Analysis — What's Missing

| Component | Roadmap says | What we build (1-week scope) | Owner | Priority |
|-----------|-------------|------------------------------|-------|----------|
| News scrapers | Scrapy + Playwright, 15+ sources | **feedparser** RSS for 6 key sources | Backend | 🔴 Critical |
| Task scheduler | Celery + Redis + Celery Beat | **APScheduler** — zero setup, pure Python | Backend | 🔴 Critical |
| Article database | PostgreSQL 15 + Alembic | **SQLite** via SQLAlchemy — same ORM, trivial to upgrade | Backend | 🔴 Critical |
| Deduplication | Redis SHA-256 hash store | SQLite UNIQUE constraint on URL | Backend | 🔴 Critical |
| NER pipeline | spaCy `en_core_web_trf` | **spaCy `en_core_web_sm`** + keyword rule matcher | ML | 🔴 Critical |
| Risk classifier | Fine-tuned BERT (F1 > 0.85) | **Keyword scoring** — weighted lists per category | ML | 🟡 High |
| Sentiment model | finBERT + twitter-roberta | **transformers pipeline** — pip install, 2 lines | ML | 🟡 High |
| Impact scoring | Base exposure × severity × entity weight | Same formula, hardcoded category multipliers | ML | 🟡 High |
| Alert pipeline | Email (SendGrid) + WebSocket + FCM | **In-app only** — store in SQLite, REST endpoints | Backend | 🟡 High |
| News Feed page | Masonry grid, infinite scroll | **New `/news` page** — card list + filter chips + expand | Frontend | 🔴 Critical |
| Alerts page | Full acknowledge + config UI | **New `/alerts` page** — list + tier chips + acknowledge | Frontend | 🟡 High |
| Mobile app | Full React Native, biometric, FCM, offline | **3 screens** in Expo Go: Dashboard + News + Alerts | Mobile | 🟡 High |
| Tests | Pytest >80% + Cypress + Locust | **Pytest** for backend services + manual E2E checklist | All | 🟡 High |
| Deployment | AWS EC2 + RDS + ElastiCache + CloudFront | **Single VPS** (Railway/Render) + Docker Compose + HTTPS | Backend | 🟡 High |

---

## Scope Cuts — What We Are NOT Building This Week

These are deliberate cuts. A working product with fewer features beats a broken product with all features.

| Cut | Reason |
|-----|--------|
| Celery + Redis | APScheduler is simpler, same result, zero ops overhead |
| PostgreSQL | SQLite handles thousands of articles fine; trivial to migrate later |
| Full Scrapy | feedparser covers all high-signal RSS sources |
| AWS EC2/RDS | Single VPS + Docker Compose is sufficient for demo |
| JWT auth / RBAC | No user login needed for demo |
| BERT fine-tuning | No labeled training data, no GPU — keyword classifier works |
| Twitter/X API | Requires account approval, stream setup, rate limits |
| SendGrid email | In-app alerts avoid delivery failures during live demo |
| Firebase FCM push | Device setup during live demo is too risky |
| Anomaly detection | Enhancement; add post-demo |
| EAS Build / App Store | Expo Go on device is sufficient; store submission takes days |
| Locust 1000-user load test | Not needed for university demo |

---

## Week 1 — Day-by-Day Build Plan (Jul 13–18)

### Monday Jul 13 — Phase 2: Data Ingestion Layer

**Goal:** Articles flowing from RSS into SQLite by end of day.

**Backend (Emmanuel + Chidima)**

- [ ] Install `feedparser`, `sqlalchemy`, `apscheduler` in requirements
- [ ] Create `articles` SQLite table via SQLAlchemy:
  ```python
  # id, url (UNIQUE), title, body, source_name, published_at, scraped_at
  ```
- [ ] Write `backend/app/services/scraper_service.py`:
  - 6 RSS sources: JoyFM, CitiFM, Reuters/Africa, BBC/Africa, BusinessGhana, GhanaWeb
  - Use feedparser — fetch → deduplicate on URL → store in SQLite
  - Run once manually to verify articles populate
- [ ] Wire APScheduler to fire scraper every 15 minutes on FastAPI startup
- [ ] New endpoints:
  - `GET /api/news` — paginated, filter by `source`, `date`, `risk_category`
  - `GET /api/news/{id}` — full article + risk scores

**ML (Nana)**

- [ ] pip install `spacy`, download `en_core_web_sm`
- [ ] pip install `transformers`, `torch` (or `tensorflow`)
- [ ] Verify both load without errors: `python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('ok')"`

**Frontend (Foureiratou)**

- [ ] Fix Reverse Stress page — add narrative explanation banner (matching Monte Carlo style)
- [ ] Add `Binary Search Trajectory` interpretation sentence below the chart

---

### Tuesday Jul 14 — Phase 3: NLP Pipeline

**Goal:** Every article gets NER + risk category + sentiment + severity score.

**ML (Nana + Foureiratou)**

- [ ] Create `backend/app/services/nlp_service.py`:
  ```python
  def run_ner(text: str) -> dict:
      # spaCy: extract ORG, MONEY, GPE, PERSON
      # Custom rule matcher: "MTN Ghana", "NCA", "MoMo", "AirtelTigo"
      # Return: { entities: [...], mtn_mention_count: int, mtn_relevance: float }
  ```
- [ ] Keyword risk classifier — build `CATEGORY_KEYWORDS` dict:
  ```python
  CATEGORY_KEYWORDS = {
      "regulatory":    ["NCA", "licence", "regulation", "policy", "compliance", "fine", "spectrum"],
      "competitive":   ["Vodafone", "AirtelTigo", "market share", "price war", "subscriber loss"],
      "fx_financial":  ["Cedi", "exchange rate", "depreciation", "inflation", "interest rate", "BoG"],
      "operational":   ["outage", "network failure", "downtime", "infrastructure", "equipment"],
      "political":     ["election", "government", "parliament", "minister", "policy change"],
      "reputational":  ["scandal", "customer complaint", "social media", "backlash", "brand"],
  }
  # Score each article: count keyword hits per category → top category + score
  ```
- [ ] Sentiment wrapper:
  ```python
  from transformers import pipeline
  _sentiment = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
  
  def run_sentiment(text: str) -> dict:
      result = _sentiment(text[:512], truncation=True)[0]
      return { "sentiment": result["label"], "confidence": result["score"] }
  ```

**Backend (Chidima + Emmanuel)**

- [ ] Create `risk_scores` SQLite table:
  ```python
  # article_id FK, category, severity (0-10), confidence, sentiment,
  # mtn_relevance, impact_ghs_min, impact_ghs_mid, impact_ghs_max,
  # alert_tier, entities (JSON), created_at
  ```
- [ ] Create `backend/app/services/impact_service.py` — impact scoring formula:
  ```python
  CATEGORY_BASE_EXPOSURE_GHS = {
      "regulatory": 50_000_000,   # 50M GHS
      "fx_financial": 120_000_000, # 120M GHS
      "competitive": 40_000_000,
      "operational": 30_000_000,
      "political": 35_000_000,
      "reputational": 25_000_000,
  }
  def estimate_impact(category, severity, mtn_relevance):
      base = CATEGORY_BASE_EXPOSURE_GHS[category]
      mid = base * (severity / 10) * mtn_relevance
      return { "min": mid * 0.3, "mid": mid, "max": mid * 2.5 }
  ```

---

### Wednesday Jul 15 — Integration + News Feed Page

**Goal:** Full pipeline working end-to-end. New `/news` page live.

**Backend (Emmanuel)**

- [ ] Create `process_article(article_id)` function — chain:
  1. Load article from DB
  2. Run `run_ner()` → entities + mtn_relevance
  3. Run keyword classifier → category + score
  4. If mtn_relevance < 0.2 → skip (not MTN-relevant)
  5. Run `run_sentiment()` → sentiment
  6. Compute severity: `severity = keyword_score * 10 * mtn_relevance`
  7. Compute `alert_tier`: Watch ≥ 3, Warning ≥ 5, Critical ≥ 7.5
  8. Run `estimate_impact()` → GHS range
  9. Save `risk_score` row to DB
  10. If `alert_tier` in (Warning, Critical) → create alert record

**Backend (Chidima)**

- [ ] Create `alerts` SQLite table: `id, article_id FK, tier, category, headline, impact_ghs_mid, acknowledged, acknowledged_at, created_at`
- [ ] Wire `process_article()` to run automatically after each new article is stored
- [ ] Backfill: process all existing articles from Monday's scrape
- [ ] `GET /api/alerts` — list, filter by `tier`, `acknowledged`
- [ ] `PATCH /api/alerts/{id}/acknowledge` — set `acknowledged=true`, `acknowledged_at=now()`
- [ ] `GET /api/dashboard/summary` — returns: `articles_today`, `alerts_by_tier`, `top_risk_category`, `top_risk_article`

**Frontend (Foureiratou + Nana)**

- [ ] Build `/news` page (`frontend/app/(app)/news/page.tsx`):
  - Call `GET /api/news` on load
  - Article card: source chip · category badge · risk tier colour border · headline · 2-line body · entity tags · severity score · GHS impact
  - Filter chips: All / Regulatory / FX / Competitive / Operational / Political / Reputational
  - Click card → expand drawer showing full body + entity list + sentiment chip
- [ ] Add "News Feed" and "Alerts" links to `Sidebar.tsx`
- [ ] Update `/dashboard` to show: articles ingested today + active alert count + top risk category

---

### Thursday Jul 16 — Alerts Page + Mobile App

**Goal:** `/alerts` page working. Mobile shows 3 screens.

**Frontend (Foureiratou)**

- [ ] Build `/alerts` page (`frontend/app/(app)/alerts/page.tsx`):
  - Header: count chips (Critical N · Warning N · Watch N)
  - Alert list sorted by severity descending
  - Each row: tier colour stripe · headline · category · time · impact GHS · Acknowledge button
  - Filter: All / Unacknowledged / by tier
  - Acknowledged alerts greyed out with timestamp

**Mobile (Nana + Chidima)**

- [ ] Screen 1 — `HomeScreen.tsx`:
  - Call `GET /api/dashboard/summary`
  - Show 4 KPI tiles: Revenue GHSm · EBITDA Margin % · ARPU GHS · Cedi/USD
  - Status colour per tile (green/yellow/orange/red)
  - Alert summary: "3 active alerts" with tier breakdown chips
- [ ] Screen 2 — `NewsScreen.tsx`:
  - Call `GET /api/news?limit=20`
  - Vertical list of article cards (source + headline + risk tier dot + time)
  - Tap card → expand full body
- [ ] Screen 3 — `AlertsScreen.tsx`:
  - Call `GET /api/alerts?acknowledged=false`
  - List with tier chip + headline + GHS impact
  - "Acknowledge" button calls `PATCH /api/alerts/{id}/acknowledge`
- [ ] Bottom tab navigator: Home / News / Alerts

---

### Friday Jul 17 — Deploy + Integration Testing

**Goal:** Platform live on production URL. Pipeline confirmed end-to-end.

**Backend (Emmanuel)**

- [ ] Update `docker-compose.yml` — add SQLite volume mount, new Python deps
- [ ] Deploy to Railway or Render (or DigitalOcean App Platform):
  - Set `DATABASE_URL`, `CORS_ORIGINS` env vars
  - Verify HTTPS active on production URL
  - Confirm APScheduler fires on startup
- [ ] Run full pipeline integration test:
  - Scraper fires → article stored → NLP scores → alert created
  - Time it: target < 2 minutes from scrape to scored alert

**All**

- [ ] Full walkthrough on production URL — every page, every feature
- [ ] Log all bugs in a shared doc, triage by severity
- [ ] Fix any P0 (crashes, blank pages, wrong data) issues same day
- [ ] Foureiratou: update `MTN_QUANTRISK_FULL_GUIDE.txt` — add News Feed and Alerts sections

---

### Saturday Jul 18 — Buffer Day (use if needed)

- [ ] Finish any Mon–Fri tasks not completed
- [ ] Optional: Mobile biometric login (`expo-local-authentication`) — ~2 hours
- [ ] Optional: Zero-shot risk classification (`facebook/bart-large-mnli`) if keyword classifier is inaccurate
- [ ] Full demo run-through × 2 — time it, identify weak points
- [ ] Verify all pages load in < 3s on production URL

---

## Week 2 — Test Plan (Jul 19–25)

### Monday Jul 21 — Backend Unit Tests

Write `pytest` tests for all new services:

```
tests/
  test_scraper.py   — RSS articles stored, duplicates rejected
  test_nlp.py       — NER entities extracted, sentiment returns valid scores
  test_classifier.py — keyword classifier assigns correct category
  test_impact.py    — impact formula correct for each category
  test_alerts.py    — severity ≥ 7.5 creates CRITICAL alert
  test_api.py       — GET /api/news, /api/alerts return correct shape
```

**Owner:** Chidima · **Goal:** ≥ 15 tests passing

---

### Tuesday Jul 22 — Frontend E2E Manual Checklist

Work through every page and verify:

```
□ /dashboard      — All 14 KPI tiles load, colours match status, articles today count shows
□ /news           — Articles load from real API, filters work, expand drawer shows full body
□ /alerts         — Alerts listed, acknowledge works, acknowledged items grey out
□ /scenarios      — Pick scenario → run → banner + KPI tiles + waterfall + SHAP appear
□ /monte-carlo    — 1000 sims run, distribution bars expand on click, P05/P95 correct
□ /reverse        — Set target → solve → binary search trajectory renders, narrative banner shows
□ /compare        — Pick 2 scenarios → both run → side-by-side comparison renders
□ /forecasts      — Chart renders, ARIMA line shows, historical data visible
□ /briefs         — Brief library loads, generate brief works
□ /kri-register   — All KPIs in table, status chips correct
□ /quarterly      — Chart renders for each KPI
□ /monthly        — Chart renders for each KPI
□ /help           — Search works, Q&A expands, glossary shows
□ /settings       — Health check shows green, upload CSV works
```

**Owner:** Foureiratou · **Log bugs in shared doc**

---

### Wednesday Jul 23 — Pipeline Integration Test

```
□ Run scraper manually → articles appear in /news within 2 minutes
□ Inject test article with "NCA", "regulatory", "MTN Ghana" keywords →
  confirm WATCH/WARNING alert generated in /alerts
□ Inject test article with severity > 7.5 → confirm CRITICAL alert in /alerts
□ Restart FastAPI → confirm APScheduler fires automatically without manual trigger
□ Check /api/health — all scraped sources show green status
□ 24-hour run → count articles stored → verify no duplicates (SELECT COUNT, COUNT(DISTINCT url))
□ Verify pipeline latency: scrape → scored alert < 2 minutes (stopwatch test)
```

**Owner:** Emmanuel + Nana

---

### Thursday Jul 24 — Mobile Testing + Bug Fixes

```
□ Open Expo Go on iOS → all 3 screens load, no errors
□ Open Expo Go on Android → all 3 screens load, no errors
□ HomeScreen: KPI values match web dashboard
□ NewsScreen: articles scroll smoothly, tap-to-expand works on both platforms
□ AlertsScreen: tier chips visible, acknowledge updates list
□ Layout check on iPhone SE (small) and larger Android
□ Fix all P1 bugs from Tuesday's checklist
```

**Owner:** Nana (iOS) · Chidima (Android)

---

### Friday Jul 25 — Demo Rehearsal + Final Polish

```
□ Full 20-min demo run-through × 2 (one live, one recorded as backup)
□ All pages load in < 3s on production URL
□ Seed a test CRITICAL alert for demo if no real ones exist
□ Share production URL + Expo Go QR with MTN stakeholders 24h before presentation
□ Export 2-page executive summary PDF: what was built + model metrics + next steps
□ Update README.md with setup instructions and production URL
```

---

## Demo Script (20 min)

| # | What to show | Time |
|---|-------------|------|
| 1 | Dashboard — 14 KPI tiles with live status | 3 min |
| 2 | News Feed — live articles from today, show entity tags + sentiment | 3 min |
| 3 | Alerts — show CRITICAL alert, acknowledge it live | 2 min |
| 4 | Stress Tester — Cedi Crisis at 1.5×, walk through SHAP attribution | 4 min |
| 5 | Monte Carlo — 1000 sims, explain P05 = your risk floor | 3 min |
| 6 | Reverse Stress — "how bad until EBITDA breaches 55%?" show binary search | 2 min |
| 7 | Mobile (Expo Go) — Dashboard + News + Alerts on phone | 3 min |

**Demo day risk mitigations:**

| Risk | Mitigation |
|------|-----------|
| RSS source goes down | Pre-seed 10 articles in DB before demo |
| No CRITICAL alerts today | Inject test article with severity = 8.5 before demo |
| Sentiment model slow to load | Pre-warm at startup, cache predictions |
| Mobile doesn't connect on-site WiFi | Run backend on localhost, connect via USB/hotspot |
| Live demo crashes | Play Thursday's recording backup |

---

## Architecture After This Week

```
Before (what you had):
  CSVs ──► FastAPI ──► Next.js Dashboard
                └──► Quantitative risk engine (XGBoost, ARIMA, Monte Carlo)

After (what you're adding):
  RSS feeds ──► feedparser scrapers ──► SQLite (articles)
                                              │
                                     APScheduler (every 15 min)
                                              │
                                     NLP pipeline (spaCy + keywords + sentiment)
                                              │
                                     risk_scores + alerts in SQLite
                                              │
  FastAPI ──────────────────────────────────────────────────────────────────────
       │                                                                        │
  Next.js (+ /news + /alerts pages)                                     Expo Go (3 screens)
```

---

## New Files to Create This Week

```
backend/app/services/
  scraper_service.py     # feedparser RSS scrapers for 6 sources
  nlp_service.py         # spaCy NER + keyword risk classifier
  sentiment_service.py   # transformers sentiment wrapper
  impact_service.py      # GHS impact scoring formula
  alert_service.py       # alert creation + acknowledge logic

backend/app/models/
  database.py            # SQLAlchemy engine + session
  article.py             # Article ORM model
  risk_score.py          # RiskScore ORM model
  alert.py               # Alert ORM model

frontend/app/(app)/
  news/page.tsx          # News Feed page
  alerts/page.tsx        # Alerts Management page

mobile/src/screens/
  HomeScreen.tsx         # KPI tiles + alert summary
  NewsScreen.tsx         # Article card list
  AlertsScreen.tsx       # Alert list + acknowledge
```

---

*MTN QuantRisk Intelligence Platform · Phase 2–6 Build Plan · Jul 12 2026*  
*Confidential · Ashesi University Capstone · MTN Ghana*
