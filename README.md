# MTN QuantRisk Intelligence Platform

An AI-powered, full-stack quantitative risk dashboard for **MTN Ghana** — combining live news scraping, NLP risk scoring, ML scenario modelling, and a real-time web + mobile interface.

---

## What it does

The platform monitors 18 Ghanaian and African news sources every 15 minutes, runs each article through a 9-step AI pipeline (scrape → dedup → relevance gate → classify → sentiment → severity → GHS impact → tier → store), and surfaces actionable risk alerts on a live dashboard with GHS financial impact estimates.

| Capability | Detail |
|---|---|
| Live news pipeline | 18 RSS sources + optional GNews API — scrapes every 15 min |
| NLP risk scoring | spaCy NER + FinBERT sentiment (HF Inference API) + zero-shot classification |
| Alert tiers | Critical ≥ 7.5 · Warning ≥ 5.0 · Watch ≥ 3.0 severity |
| GHS impact | Monte-Carlo-style range: min / mid / max per article |
| Daily LLM briefing | BART-CNN (HF API) summarises last 24 h by risk category |
| Scenario engine | XGBoost stress tester, reverse stress, Monte Carlo (10 k sims) |
| Ghana macro data | World Bank Open Data — 6 indicators, 6 h cache |
| Mobile app | React Native (Expo) — same KPIs, dark theme, System Status screen |

---

## Live pages

| URL | Description |
|---|---|
| `/dashboard` | Core Anchors — live KPI tiles + alert strip + Ghana macro signal |
| `/news` | News Feed — 18-source live feed; click any card to expand inline |
| `/alerts` | Risk Alerts — tiered alert board with acknowledge flow |
| `/intelligence` | Daily Briefing — LLM-generated 24 h digest by risk category |
| `/economics` | Ghana Macro — World Bank sparklines and risk context |
| `/kri-register` | Full KRI Book — all key risk indicators |
| `/quarterly` | Quarterly trend charts |
| `/monthly` | Monthly trend charts |
| `/forecasts` | Predictive 90-day ARIMA forecast |
| `/briefs` | Board Briefs — board-ready narrative summaries |
| `/scenarios` | Stress Tester — SHAP-explained scenario runs |
| `/compare` | Scenario Compare — side-by-side waterfall |
| `/reverse` | Reverse Stress — binary-search to EBITDA target |
| `/monte-carlo` | Monte Carlo — 1 000–10 000 simulation distribution |

---

## Tech stack

### Backend (`backend/`)

| Layer | Choice |
|---|---|
| Framework | FastAPI + Uvicorn |
| Scheduler | APScheduler BackgroundScheduler (scrapes every 15 min) |
| Database | SQLite via SQLAlchemy (WAL mode) |
| ML models | XGBoost (severity / EBITDA), ARIMA (revenue forecast) |
| NLP | spaCy `en_core_web_sm` NER, FinBERT + BART-CNN via HuggingFace Inference API |
| Scraping | feedparser (18 RSS sources), requests (GNews API optional) |
| Deduplication | SQLite UNIQUE constraint on URL |

### Frontend (`frontend/`)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (Turbopack) + React 19 |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v4 — dark theme, MTN yellow `#FFD000` |
| Charts | Recharts (KPI trends, Monte Carlo distribution) |
| Icons | Lucide React |

### Mobile (`mobile/`)

React Native (Expo Router) — 4 tabs: Home KPIs, Alerts, Macro, System Status.

### Infrastructure (`infrastructure/`)

Docker Compose + `render.yaml` blueprint for one-click Render deploy.

---

## Project structure

```
mtn_quantrisk/
├── backend/
│   ├── app/
│   │   ├── api/routes.py             # All REST endpoints
│   │   ├── models/                   # SQLAlchemy ORM (Article, RiskScore, Alert)
│   │   ├── services/
│   │   │   ├── scraper_service.py    # 18 RSS sources + GNews
│   │   │   ├── nlp_service.py        # spaCy NER + zero-shot category
│   │   │   ├── sentiment_service.py  # FinBERT via HF API + lexicon fallback
│   │   │   ├── pipeline_service.py   # 9-step orchestrator
│   │   │   ├── alert_service.py      # Tier assignment + alert CRUD
│   │   │   ├── economic_service.py   # World Bank Open Data (6 indicators, 6 h cache)
│   │   │   └── intelligence_service.py # LLM daily briefing (BART-CNN, 30 min cache)
│   │   └── main.py                   # Lifespan + APScheduler
│   ├── tests/                        # 108 passing pytest tests
│   └── requirements.txt
│
├── frontend/
│   ├── app/(app)/
│   │   ├── dashboard/page.tsx
│   │   ├── news/page.tsx             # Inline-expand article cards
│   │   ├── alerts/page.tsx
│   │   ├── intelligence/page.tsx     # Daily LLM briefing
│   │   ├── economics/page.tsx
│   │   ├── scenarios/page.tsx
│   │   ├── monte-carlo/page.tsx
│   │   ├── reverse/page.tsx
│   │   └── ...
│   ├── components/shell/Sidebar.tsx
│   └── lib/api.ts                    # Typed fetch helpers for all endpoints
│
├── mobile/
│   └── src/app/                      # Expo Router screens
│
├── models/
│   ├── train_xgboost.py
│   ├── monte_carlo.py
│   └── artefacts/                    # Trained .joblib files
│
├── scripts/
│   └── seed_demo.py                  # Seeds 12 realistic articles → 9+ alerts
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── render.yaml                   # One-click Render deploy blueprint
│   └── DEPLOY.md
│
├── MTN_QUANTRISK_FULL_GUIDE.txt      # 18-part operator guide
└── README.md
```

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- Git

### 1 — Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm   # one-time

uvicorn app.main:app --host 0.0.0.0 --port 8001
# API docs: http://localhost:8001/docs
```

### 2 — Seed demo data (first run)

```bash
# In a new terminal, from project root
python scripts/seed_demo.py
# Inserts 12 articles → triggers full pipeline → produces 9+ active alerts
```

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 4 — Mobile (optional)

```bash
cd mobile
npm install
npx expo start
# Scan QR in Expo Go (iOS/Android) or press W for web
```

### Docker (all-in-one)

```bash
cd infrastructure
docker compose up --build
```

Then seed: `python scripts/seed_demo.py`

---

## Environment variables

| Variable | Required | Source | Effect |
|---|---|---|---|
| `DB_PATH` | Auto-set | — | SQLite file location (defaults to `backend/quantrisk_news.db`) |
| `HF_TOKEN` | Optional | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (free) | Enables FinBERT sentiment + BART-CNN daily briefing |
| `GNEWS_TOKEN` | Optional | [gnews.io](https://gnews.io) (free, 100 req/day) | Adds targeted "MTN Ghana" search on top of 18 RSS sources |
| `CORS_ORIGINS` | Production | Set to frontend URL | Required when frontend and backend are on different hosts |

Without `HF_TOKEN` the platform still works fully — it uses a keyword lexicon for sentiment and extractive NLP for the daily briefing.

---

## AI pipeline (9 steps)

```
Article URL
  │
  1. Scrape (feedparser / GNews)
  2. Deduplicate (SQLite UNIQUE on URL)
  3. MTN relevance gate (keyword scoring ≥ 0.25 to proceed)
  4. Classify risk category (keyword → zero-shot BART fallback)
  5. Sentiment (FinBERT → lexicon fallback)
  6. Severity score 0–10 (category + sentiment + entity weights)
  7. GHS impact (base_exposure × severity × relevance; min/mid/max)
  8. Alert tier (Critical ≥ 7.5 / Warning ≥ 5.0 / Watch ≥ 3.0)
  9. Persist to SQLite + raise Alert record
```

Risk categories: `regulatory` · `fx_financial` · `competitive` · `operational` · `political` · `reputational`

---

## News sources (18 active)

**Ghana local:** JoyFM, Citi FM, Modern Ghana, GhanaWeb, Graphic Online, Pulse Ghana  
**Ghana business:** Ghana Business News  
**Tech & telecom:** TechCabal, Disrupt Africa  
**Africa / global:** BBC Africa, The Africa Report, African Business, CNBC Africa, Nairametrics  
**Google News RSS (free, aggregates social media):** MTN Ghana · Ghana Telecom/NCA · MoMo Ghana  
**Optional:** GNews API (set `GNEWS_TOKEN`)

---

## API reference (key endpoints)

```
GET  /api/health                  # System health
GET  /api/kpis                    # All KPIs (base case)
GET  /api/scenarios               # Scenario library
POST /api/scenarios/{id}/run      # Run stress test (SHAP output)
POST /api/monte-carlo             # Run N simulations
POST /api/reverse-stress          # Binary search to EBITDA target
GET  /api/news                    # Paginated news feed
GET  /api/news/summary            # 24 h stats
POST /api/news/scrape             # Trigger immediate scrape
GET  /api/alerts                  # Active alerts (filterable by tier)
PATCH /api/alerts/{id}/acknowledge
GET  /api/economics               # World Bank Ghana indicators
GET  /api/economics/risk-context  # Inflation / growth risk signals
GET  /api/intelligence/summary    # LLM 24 h briefing (BART-CNN / extractive)
GET  /api/forecasts/{kpi_id}      # ARIMA 90-day forecast
GET  /api/quarterly/{kpi_id}      # Quarterly history
GET  /api/monthly/{kpi_id}        # Monthly history
GET  /docs                        # Swagger UI
```

---

## Testing

```bash
# Backend — from project root
pytest tests/ --ignore=tests/test_extractor_tables.py -q
# Expected: 108 passed, 2 skipped

# Frontend type check
cd frontend && npx tsc --noEmit
# Expected: 0 errors
```

---

## Deployment

See [`infrastructure/DEPLOY.md`](infrastructure/DEPLOY.md) for:

- **Option A** — Local Docker (`docker compose up --build`)
- **Option B** — Render.com (free tier, blueprint auto-detected from `render.yaml`)
- **Option C** — Railway (CLI deploy, $5/month free credit)

---

## Team

| Role | Member | GitHub |
|---|---|---|
| Tech Lead / Architect | Emmanuel Adoum | [@adoumouangnamouemmanuel](https://github.com/adoumouangnamouemmanuel) |
| ML / NLP + Frontend | Foureiratou ZAKARI | [@Furairah3](https://github.com/Furairah3) |
| ML / NLP + Frontend | Nana Daasebre | [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi) |
| Backend Engineer | Chidima Praise | [@ChidimaUgwu](https://github.com/ChidimaUgwu) |
| MTN Business Liaison | Boaz Owiredu | MTN Ghana |

---

**Last updated:** July 2026 — Branch `Foureiratou` (Phase 2 complete)  
**Test status:** 108 pytest passed · 0 TypeScript errors · 15/15 pages 200 OK
