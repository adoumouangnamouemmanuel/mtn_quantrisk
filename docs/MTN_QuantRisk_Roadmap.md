# 🗺️ MTN QuantRisk Intelligence Platform Roadmap

## From Zero to AI-Powered Risk Intelligence in 6 Weeks

### A Phase-by-Phase Build Plan with GitHub Issues & Project Tracking

---

## Table of Contents

1. [Guiding Philosophy](#1-guiding-philosophy)
2. [Project Timeline Summary](#2-project-timeline-summary)
3. [Team Structure](#3-team-structure)
4. [GitHub Project Setup](#4-github-project-setup)
5. [Phase 1 - Foundation & Architecture](#phase-1--foundation--architecture-week-1-may-18-24)
6. [Phase 2 - Web Scrapers & Data Pipeline](#phase-2--web-scrapers--data-pipeline-week-2-may-25-31)
7. [Phase 3 - NLP & ML Risk Models](#phase-3--nlp--ml-risk-models-week-3-jun-1-7)
8. [Phase 4 - Web App Dashboard](#phase-4--web-app-dashboard-week-4-jun-8-14)
9. [Phase 5 - Mobile App & PWA](#phase-5--mobile-app--pwa-week-5-jun-15-21)
10. [Phase 6 - Testing, Docs & Deployment](#phase-6--testing-docs--deployment-week-6-jun-22-29)
11. [GitHub Issues Registry](#github-issues-registry)
12. [Milestone Checklist](#milestone-checklist)
13. [Risk Register](#risk-register)
14. [Definition of Done](#definition-of-done)

---

## 1. Guiding Philosophy

Six weeks is aggressive. These rules are what will keep the project on track.

**Ship vertically, not horizontally.**
Do not build all database schemas, then all APIs, then all UIs in isolation. Each phase delivers a complete, working, testable slice of the system. By end of Week 1, you can query the database. By end of Week 2, articles are flowing. By end of Week 4, a stakeholder can log in and see live risk scores.

**Data pipeline is the heartbeat.**
Every feature on the platform depends on the scraper pipeline running clean. If articles aren't flowing, nothing works. Treat the pipeline as a production service from day one'; monitor it, alert on it, and test it constantly.

**ML models serve the product, not the other way around.**
Do not over-engineer the AI. A fine-tuned BERT classifier at F1 > 0.85 that runs reliably is worth ten times more than a perfect model that ships late. Build fast, validate with real MTN news data, and iterate.

**Real data beats mock data.**
As soon as the scrapers are live, stop using mock data everywhere. Plug real scraped articles into the NLP pipeline during development. This catches data-quality bugs weeks before QA.

**The 15-minute latency promise is your north star.**
Every architectural decision: queue depth, cache strategy, WebSocket delivery, mobile sync, should be evaluated against one question: *does this help us deliver a board-ready alert within 15 minutes of publication?*

---

## 2. Project Timeline Summary

```
MTN QuantRisk — 6-Week Sprint
MAY 18 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ JUN 29
        Wk 1     Wk 2     Wk 3     Wk 4     Wk 5     Wk 6
       May18   May25    Jun1     Jun8    Jun15    Jun22    Jun29
        │        │        │        │        │        │        │
        ▼        ▼        ▼        ▼        ▼        ▼        ▼
Phase1  ████████
Phase2           ████████
Phase3                    ████████
Phase4                             ████████
                                            ★ MILESTONE 1 (Jun 15)
Phase5                                      ████████
Phase6                                               ████████
                                                              ★ FINAL (Jun 29)

LEGEND
Phase 1 │ Foundation & Architecture    │ Week 1  │ May 18–24
Phase 2 │ Web Scrapers & Data Pipeline │ Week 2  │ May 25–31
Phase 3 │ NLP & ML Risk Models         │ Week 3  │ Jun 1–7
Phase 4 │ Web App Dashboard            │ Week 4  │ Jun 8–14
Phase 5 │ Mobile App & PWA             │ Week 5  │ Jun 15–21
Phase 6 │ Testing, Docs & Deployment   │ Week 6  │ Jun 22–29
```

---

## 3. Team Structure

```
┌────────────────────────────────────────────────────────────────────────────────────────|
│                    MTN QuantRisk - Project Team                      |                 |
├────────────────────────┬─────────────────────────────────────────────┤─────────────────┤
│ Role                   │ Primary Responsibilities                    │Names            |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ Tech Lead / Architect  │ System design, DevOps, backend API, ML      │  Emmanuel       |
│                        │ pipeline orchestration, code reviews        │                 |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ ML / NLP Engineer      │ BERT classifier, spaCy NER, LSTM forecaster │  Nana           |
│                        │ model training, evaluation, anomaly engine  │  Foureiratou    |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ Backend Engineer       │ FastAPI, Celery, PostgreSQL, Redis, scraper │  Chidima        |
│                        │ workers, WebSocket push, SendGrid           │  Emmanuel       |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ Frontend Engineer      │ React 18 dashboard, D3/Recharts, TypeScript │  Nana           |
│                        │ TailwindCSS, WebSocket client, alert UI     │  Foureiratou    |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ Mobile Engineer        │ React Native, Expo, Firebase FCM, biometric │  Nana           |
│                        │ auth, PWA service worker, offline cache     │  Chidima        |
├────────────────────────┼─────────────────────────────────────────────┤─────────────────┤
│ MTN Stakeholder        │ NOT a developer — reviews dashboards, signs │                 |
│ (Business Liaison)     │ off on risk categories, validates reports   │ Boaz            |
└────────────────────────┴─────────────────────────────────────────────┘─────────────────┤
```

---

## 4. GitHub Project Setup

Before writing any code, set up your GitHub Project board exactly as follows.

### 4.1 - Create the Repository

```bash
# Initialize the monorepo
mkdir mtn-quantrisk && cd mtn-quantrisk
git init
git remote add origin https://github.com/your-org/mtn-quantrisk.git

# Project structure
mtn-quantrisk/
├── backend/          # FastAPI + Celery + PostgreSQL
│   ├── app/
│   │   ├── api/      # FastAPI route handlers
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── scrapers/ # Scrapy spiders
│   │   ├── nlp/      # spaCy + BERT pipeline
│   │   ├── ml/       # LSTM, Monte Carlo, anomaly
│   │   └── tasks/    # Celery task definitions
│   ├── tests/
│   └── requirements.txt
├── frontend/         # React 18 + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
├── mobile/           # React Native + Expo
│   ├── src/
│   └── package.json
├── infrastructure/   # Docker, nginx, CI/CD configs
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .github/workflows/
└── docs/             # Architecture docs, ADRs
```

### 4.2 - GitHub Project Board Configuration

**Create a new GitHub Project (Beta - Table/Board view)**

**Columns / Status fields:**
```
📋 Backlog → 🔄 In Progress → 👀 In Review → ✅ Done → 🚫 Blocked
```

**Custom fields to add:**
```
Field Name    │ Type        │ Values / Notes
──────────────┼─────────────┼──────────────────────────────────────
Phase         │ Single sel. │ Phase 1 / Phase 2 / Phase 3 / Phase 4 / Phase 5 / Phase 6
Priority      │ Single sel. │ 🔴 Critical / 🟡 High / 🟢 Normal
Week          │ Single sel. │ Week 1 / Week 2 / Week 3 / Week 4 / Week 5 / Week 6
Story Points  │ Number      │ 1 / 2 / 3 / 5 / 8 (Fibonacci)
Milestone     │ Single sel. │ Milestone 1 (Jun 15) / Final (Jun 29)
```

### 4.3 - GitHub Labels to Create

```
Label                  │ Color    │ Used For
───────────────────────┼──────────┼──────────────────────────────
infrastructure         │ #0075ca  │ Docker, CI/CD, cloud setup
scraper                │ #e4e669  │ Scrapy spiders, data ingestion
nlp                    │ #d93f0b  │ spaCy, NER pipeline
ml-model               │ #b60205  │ BERT, LSTM, Monte Carlo
backend-api            │ #006b75  │ FastAPI endpoints
database               │ #0052cc  │ PostgreSQL schema, migrations
frontend               │ #5319e7  │ React components, UI
mobile                 │ #f9d0c4  │ React Native, Expo, PWA
alerts                 │ #e11d48  │ Watch/Warning/Critical system
testing                │ #0e8a16  │ Cypress, Pytest, load tests
-documentation          │ #cfd3d7  │ Docs, ADRs, runbooks
deployment             │ #1d76db  │ AWS, nginx, SSL, production
-bug                    │ #d73a4a  │ Something is broken
milestone-1            │ #FFCB00  │ Required for Jun 15 delivery
final-delivery         │ #000000  │ Required for Jun 29 delivery
```

### 4.4 — GitHub Milestones to Create

```
Milestone        │ Due Date  │ Description
─────────────────┼───────────┼────────────────────────────────────────────
🏗️ Phase 1 Done  │ May 24    │ Architecture doc + skeleton codebase live
📡 Phase 2 Done  │ May 31    │ 500+ articles/day flowing
🧠 Phase 3 Done  │ Jun 7     │ BERT F1 > 0.85 + LSTM validated
⭐ Milestone 1   │ Jun 15    │ Web App v1.0 deployed & publicly accessible
📱 Phase 5 Done  │ Jun 21    │ Mobile on TestFlight + Play Store beta
🚀 Final Delivery│ Jun 29    │ Full platform live on AWS + presentation
```

---

## Phase 1 - Foundation & Architecture

### Week 1 | May 18–24 | Deliverable: Architecture doc + skeleton codebase on GitHub

---

### 1.1 - Repository & DevOps Setup

**What you're building:** The scaffolding that every other task builds on. GitHub Actions CI/CD, Docker Compose local environment, environment variable management, and base project structure.

**Why it matters:** Containerization from day one means every developer runs identical environments. CI/CD catching broken code before it merges saves hours of debugging. Do not skip this.

- [ ] Create GitHub repository with branch protection on `main` (require PR + review)
- [ ] Set up branch strategy: `main` (production), `develop` (integration), `feature/*` (work branches)
- [ ] Create `docker-compose.yml` with services: `api`, `worker`, `db` (PostgreSQL), `redis`, `nginx`
- [ ] Write `Dockerfile` for the FastAPI backend (Python 3.11, slim image)
- [ ] Set up GitHub Actions workflow: lint → test → build → (deploy on merge to main)
- [ ] Configure environment variable management: `.env.example` committed, `.env` gitignored
- [ ] Set up pre-commit hooks: `black` (Python formatting), `flake8` (linting), `isort`
- [ ] Verify: `docker-compose up` runs all services clean on a fresh clone
- [ ] Commit skeleton codebase to GitHub

> ✔ **DELIVERABLE:** `docker-compose up` boots all services. CI/CD pipeline runs green on push.

---

### 1.2 — Risk Taxonomy Definition

**What you're building:** The authoritative definition of the 6 risk categories, their sub-types, severity scoring rubric, and financial impact estimation logic. This document drives everything the ML models will be trained to produce.

- [ ] Define the 6 risk categories as constants in `backend/app/constants/risk_taxonomy.py`:
  - `REGULATORY` — NCA policy changes, licence renewals, compliance mandates
  - `COMPETITIVE` — Competitor launches, market share shifts, new entrants
  - `FX_FINANCIAL` — GHS/USD volatility, interest rate moves, macro indicators
  - `OPERATIONAL` — Network outages, infrastructure failures, supply chain
  - `POLITICAL` — Elections, government policy, regulatory environment
  - `REPUTATIONAL` — Brand risk, customer sentiment, social media crises
- [ ] Define severity scale: 0.0–10.0, with tier thresholds:
  - 0.0–2.9: LOW (no alert)
  - 3.0–4.9: WATCH (in-app only)
  - 5.0–7.4: WARNING (email + in-app)
  - 7.5–10.0: CRITICAL (all channels, immediate)
- [ ] Document financial impact estimation formula: `impact_score = entity_weight × severity_score × market_exposure_coefficient`
- [ ] Write `docs/risk-taxonomy.md` — single source of truth, reviewed and signed off by MTN stakeholder
- [ ] Create enum classes for risk categories and alert tiers in shared types

> ✔ **DELIVERABLE:** `docs/risk-taxonomy.md` committed and reviewed by MTN business stakeholder.

---

### 1.3 — Database Schema Design

**What you're building:** The complete PostgreSQL schema for all platform data. Getting this right now prevents painful migrations during weeks 2–4.

- [ ] Install and configure Alembic for database migrations
- [ ] Design and implement the `articles` table:
  ```sql
  articles (
    id UUID PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    headline TEXT,
    body TEXT,
    source_name VARCHAR(100),
    source_category VARCHAR(50),  -- ghana_local / global_finance / mtn_specific / social
    published_at TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    language VARCHAR(10) DEFAULT 'en',
    raw_html TEXT
  )
  ```
- [ ] Design and implement the `risk_scores` table:
  ```sql
  risk_scores (
    id UUID PRIMARY KEY,
    article_id UUID REFERENCES articles(id),
    mtn_relevance FLOAT,          -- 0.0 to 1.0
    risk_category VARCHAR(50),
    severity_score FLOAT,          -- 0.0 to 10.0
    alert_tier VARCHAR(20),        -- WATCH / WARNING / CRITICAL / NONE
    sentiment VARCHAR(20),         -- POSITIVE / NEUTRAL / NEGATIVE
    financial_impact_min_ghs FLOAT,
    financial_impact_max_ghs FLOAT,
    financial_impact_min_usd FLOAT,
    financial_impact_max_usd FLOAT,
    confidence_score FLOAT,
    entities JSONB,
    model_version VARCHAR(50),
    scored_at TIMESTAMPTZ DEFAULT NOW()
  )
  ```
- [ ] Design `alerts` table (triggered alerts with delivery status tracking)
- [ ] Design `forecasts` table (LSTM output storage: date, predicted_score, category, horizon)
- [ ] Design `sources` table (scraper health registry: source name, url, status, last_article_at)
- [ ] Design `reports` table (AI-generated narrative reports)
- [ ] Design `users` table (platform users, roles, notification preferences)
- [ ] Write initial seed data script with 5 sample articles and scores for local development
- [ ] Run `alembic upgrade head` — verify all tables created clean

> ✔ **DELIVERABLE:** All tables created, migrations run clean, seed data loads without errors.

---

### 1.4 — FastAPI Base Application & JWT Authentication

**What you're building:** The API skeleton that all future endpoints will be added to. Authentication is built now so every route is secure from the start.

- [ ] Scaffold FastAPI application with lifespan context (startup/shutdown hooks)
- [ ] Configure CORS middleware (whitelist frontend and mobile origins)
- [ ] Set up dependency injection: `get_db()` session factory for all routes
- [ ] Implement JWT authentication:
  - `POST /auth/login` — returns access token (15 min) + refresh token (7 days)
  - `POST /auth/refresh` — rotate refresh token
  - `POST /auth/logout` — blacklist refresh token in Redis
  - JWT payload: `{ user_id, role, email, exp }`
- [ ] Implement role-based access control: roles `ADMIN`, `ANALYST`, `VIEWER`
- [ ] Build `GET /health` endpoint — returns service status, DB connection, Redis ping, last scrape time
- [ ] Set up structured JSON logging with `structlog` — all requests logged with correlation ID
- [ ] Configure Pydantic v2 settings management from environment variables
- [ ] Write 10+ unit tests covering auth flows (login, refresh, invalid token, expired token)
- [ ] Verify: `POST /auth/login` returns JWT, `GET /health` returns 200

> ✔ **DELIVERABLE:** API runs in Docker, JWT auth working, health endpoint returns green.

---

### 1.5 — News Source Audit & Scraping Strategy

**What you're building:** A documented inventory of all 15+ sources with scraping strategies, robots.txt compliance verification, and rate limiting parameters per domain.

- [ ] Audit all 15+ sources and document in `docs/source-inventory.md`:

  **Ghana & Africa:**
  - JoyFM / myjoyonline.com — verify RSS feed availability
  - CitiFM / citinewsroom.com — verify RSS + HTML fallback
  - Graphic Online — HTML scrape (no RSS)
  - GhanaWeb — HTML scrape
  - Business Ghana — verify RSS feed
  - TechCabal / Quartz Africa — RSS available

  **Global Finance & Telecom:**
  - Reuters — RSS feeds (telecom + africa sections)
  - Bloomberg — partial RSS, may require Playwright
  - Financial Times — RSS (limited, verify)
  - AP / BBC — full RSS available
  - Wall Street Journal — limited free access, RSS available
  - GSMA Intelligence — reports page, HTML scrape

  **MTN-Specific:**
  - MTN Group Investor Relations — HTML scrape (press releases page)
  - NCA Ghana — HTML scrape (press releases)
  - MTN Ghana Earnings Calls — HTML + PDF parsing

  **Social & Sentiment:**
  - Twitter/X API v2 — filtered stream on #MTN, #MTNGhana, #Ghana
  - Reddit API (PRAW) — r/ghana, r/africa, r/telecom
  - LinkedIn — limited (manual monitoring or Sales Navigator)

- [ ] For each source: check `robots.txt`, document allowed/disallowed paths
- [ ] Define per-source rate limits (requests/minute) — never exceed 1 req/2s on any single domain
- [ ] Identify sources requiring Playwright (JavaScript-rendered pages)
- [ ] Identify sources requiring proxy rotation (Bloomberg, WSJ)
- [ ] Document authentication requirements (Twitter API keys, Reddit client ID)

> ✔ **DELIVERABLE:** `docs/source-inventory.md` committed — strategy documented for all 15+ sources.

---

### 1.6 — Architecture Documentation

**What you're building:** The full system architecture document that captures every technical decision made in Week 1. This is what you show MTN stakeholders and new team members.

- [ ] Write `docs/architecture.md` including:
  - End-to-end data flow diagram (text-based ASCII or Mermaid)
  - Technology stack decisions with rationale (ADR format)
  - Database entity relationship overview
  - API layer design (REST + WebSocket)
  - ML pipeline overview (scrape → NER → BERT → LSTM → alert)
  - Infrastructure diagram (Docker local, AWS production target)
  - Security model (JWT, RBAC, data encryption at rest)
- [ ] Create Architecture Decision Records (ADRs) in `docs/decisions/`:
  - `ADR-001` — FastAPI over Django (speed, async support)
  - `ADR-002` — PostgreSQL over MongoDB (structured risk scores, relational joins)
  - `ADR-003` — Celery + Redis over RabbitMQ (simpler ops, good Python support)
  - `ADR-004` — React 18 + TypeScript over Next.js (real-time WebSocket simplicity)
  - `ADR-005` — Expo over bare React Native (faster iteration, OTA updates)
- [ ] Get architecture sign-off from Tech Lead before moving to Phase 2

> ✔ **DELIVERABLE:** `docs/architecture.md` committed. All ADRs written. Tech Lead sign-off recorded.

---

## Phase 2 — Web Scrapers & Data Pipeline

### Week 2 | May 25–31 | Deliverable: 500+ articles/day ingested across 15+ sources

---

### 2.1 — Scrapy Project Setup & Base Spider

**What you're building:** The core scraping infrastructure that all individual spiders will inherit from.

- [ ] Initialize Scrapy project: `scrapy startproject quantrisk_scrapers`
- [ ] Build `BaseSpider` class with shared behaviour:
  - Auto-detect article language (English vs French)
  - Extract canonical URL (avoid query parameter variants)
  - Extract `published_at` from multiple date formats (ISO, RFC 2822, relative)
  - Strip HTML to clean article body text (use `trafilatura` for main content extraction)
  - Set User-Agent rotation from a pool of 5+ realistic browser agents
  - Respect per-domain rate limits from `settings.py`
- [ ] Configure `pipelines.py`:
  - `DeduplicationPipeline` — check URL exists in Redis before inserting to PostgreSQL
  - `DatabasePipeline` — bulk-insert new articles to `articles` table
  - `MetricsPipeline` — increment Prometheus counters per source
- [ ] Configure `middlewares.py`:
  - Retry middleware (3 retries, exponential backoff)
  - HTTP cache middleware (cache responses for 5 minutes)
- [ ] Configure Playwright integration for JS-rendered pages (`scrapy-playwright`)
- [ ] Write 15 unit tests for the deduplication and extraction logic

> ✔ **DELIVERABLE:** Base spider scrapes any given URL and stores article in PostgreSQL.

---

### 2.2 — Ghana & Africa News Spiders

**What you're building:** 6 individual spiders targeting Ghana-specific sources.

- [ ] `JoyFMSpider` — parse RSS feed `myjoyonline.com/feed`, extract headline, body, published_at
- [ ] `CitiFMSpider` — parse RSS feed `citinewsroom.com/feed`, same extraction
- [ ] `GraphicOnlineSpider` — HTML spider, target news listing page, follow article links
- [ ] `GhanaWebSpider` — HTML spider, target business/technology section
- [ ] `BusinessGhanaSpider` — RSS or HTML, focus on telecom and MTN articles
- [ ] `TechCabalSpider` — RSS feed, filter for Ghana/West Africa relevance
- [ ] For each spider: write integration test that runs spider against a saved HTML fixture
- [ ] Verify all 6 spiders produce clean, UTF-8 article text with valid timestamps

> ✔ **DELIVERABLE:** 6 Ghana spiders running, producing articles in PostgreSQL within 2 min of publish.

---

### 2.3 — Global Finance & Telecom Spiders

**What you're building:** 6 spiders targeting international financial and telecom news sources.

- [ ] `ReutersSpider` — RSS feeds: `/rss/archive/rssBusinessNews.xml`, filter Africa + telecom keywords
- [ ] `BBCSpider` — BBC News RSS, Africa business section
- [ ] `APSpider` — AP News RSS, technology + business feeds
- [ ] `FinancialTimesSpider` — RSS where available (free tier), Playwright fallback
- [ ] `WSJSpider` — RSS feed for headlines (body limited behind paywall — headline + summary sufficient)
- [ ] `GSMASpider` — HTML spider targeting GSMA Intelligence news and report pages
- [ ] Keyword filtering middleware: discard articles with zero MTN/Ghana/telecom/Africa relevance keywords
- [ ] Write integration tests for each spider against saved HTML fixtures

> ✔ **DELIVERABLE:** 6 global spiders running, filtered to Africa/telecom relevance, storing clean articles.

---

### 2.4 — MTN-Specific Source Scrapers

**What you're building:** Spiders targeting MTN's own publications — the highest-signal sources.

- [ ] `MTNInvestorRelationsSpider` — scrape `mtn.com/investor-relations`, extract press releases
- [ ] `NCAGhanaSpider` — scrape NCA Ghana press releases page, watch for regulatory announcements
- [ ] `MTNGhanaEarningsSpider` — scrape earnings call pages, extract financial disclosures
- [ ] `GSMAReportsSpider` — identify and download relevant PDF reports (pass to PDF text extractor)
- [ ] Implement PDF text extraction for downloaded MTN/NCA PDFs using `pdfplumber`
- [ ] Set these spiders to run every 30 minutes (2× more frequent than standard 15-min cycle)

> ✔ **DELIVERABLE:** MTN-specific scrapers live, PDF text extraction working, stored in articles table.

---

### 2.5 — Social Media & Sentiment Pipeline

**What you're building:** Real-time social media monitoring via Twitter/X API and Reddit.

- [ ] **Twitter/X API v2 Integration:**
  - Implement filtered stream endpoint: track keywords `MTN`, `MTNGhana`, `#MTNGhana`, `NCA Ghana`
  - Parse tweet text, author, timestamp, engagement metrics (retweet count, like count)
  - Store tweets as articles in `articles` table with `source_category = 'social'`
  - Handle rate limits: implement backoff on 429 responses
  - Store bearer token securely in environment variable
- [ ] **Reddit API Integration (PRAW):**
  - Monitor `r/ghana`, `r/africa`, `r/investing` for MTN mentions
  - Pull top 25 posts per subreddit per 15-minute cycle
  - Extract post title + body, filter for MTN/Ghana relevance keywords
- [ ] Write Celery tasks for social media polling (Twitter stream runs continuously; Reddit polls every 15 min)
- [ ] Test with real API credentials in development environment

> ✔ **DELIVERABLE:** Social stream feeding tweets and Reddit posts into articles table in real time.

---

### 2.6 — Celery Task Scheduler & Deduplication Engine

**What you're building:** The orchestration layer that runs all scrapers on schedule and ensures no article is processed twice.

- [ ] Configure Celery with Redis as broker and PostgreSQL as result backend
- [ ] Define Celery Beat schedule in `backend/app/tasks/schedule.py`:
  ```python
  CELERYBEAT_SCHEDULE = {
      'run-all-scrapers': {
          'task': 'tasks.run_all_scrapers',
          'schedule': crontab(minute='*/15'),   # Every 15 minutes
      },
      'run-mtn-scrapers': {
          'task': 'tasks.run_mtn_scrapers',
          'schedule': crontab(minute='*/7'),    # Every 7 minutes
      },
      'cleanup-old-articles': {
          'task': 'tasks.cleanup_old_articles',
          'schedule': crontab(hour=3, minute=0), # Nightly at 3am
      },
  }
  ```
- [ ] Implement Redis-backed deduplication: SHA-256 hash of normalized URL stored in Redis Set with 30-day TTL
- [ ] Implement dead-letter queue: failed scrape jobs retry 3× then go to `failed_jobs` table
- [ ] Build `GET /api/pipeline/health` endpoint showing: each source status, articles scraped today, last run time, error count
- [ ] Add Celery Flower for pipeline monitoring dashboard (internal use)
- [ ] Load test: verify pipeline sustains 500+ articles/day without queue backup

> ✔ **DELIVERABLE:** Celery beating every 15 min. 500+ articles/day confirmed in PostgreSQL. Deduplication verified.

---

## Phase 3 — NLP & ML Risk Models

### Week 3 | Jun 1–7 | Deliverable: BERT F1 > 0.85 + LSTM forecaster validated + evaluation report

---

### 3.1 — spaCy NER Pipeline

**What you're building:** Named entity extraction that tags every article with the people, organizations, financial figures, and regulatory entities it mentions. This feeds the risk classifier.

- [ ] Install spaCy with `en_core_web_trf` (transformer-based, best accuracy for financial text)
- [ ] Build `NERPipeline` class in `backend/app/nlp/ner_pipeline.py`:
  - Detect and tag: `ORG` (MTN Group, NCA Ghana, Vodafone, AirtelTigo, etc.)
  - Detect and tag: `MONEY` (GHS and USD amounts with extraction of numeric value)
  - Detect and tag: `GPE` (Ghana, Accra, Kumasi, West Africa, etc.)
  - Detect and tag: `PERSON` (CEO names, minister names, regulator names)
  - Detect and tag: `LAW` / `REGULATION` (custom entity: NCA regulations, licence types)
  - Custom rule-based matcher for MTN-specific entities: "MTN Ghana", "MTN Group", "MoMo"
- [ ] Compute `mtn_mention_count` — number of times MTN or its subsidiaries appear
- [ ] Compute `entity_weight` — signal strength of entities detected (weighted by entity type)
- [ ] Output: JSON blob stored in `risk_scores.entities` column
- [ ] Write 20+ unit tests covering edge cases: no entities, multiple currencies, informal references to MTN

> ✔ **DELIVERABLE:** NER pipeline processes any article → structured entity JSON in under 200ms.

---

### 3.2 — BERT MTN-Relevance & Risk Classifier

**What you're building:** The core AI classifier — a fine-tuned BERT model that reads each article and outputs (a) MTN relevance score 0–1, and (b) risk category label.

- [ ] **Training Data Preparation:**
  - Assemble minimum 500 labeled articles (use scraped articles + manual labeling)
  - Labels per article: `mtn_relevant` (0/1) + `risk_category` (6 classes)
  - Split: 70% train / 15% validation / 15% test (stratified by risk category)
  - Save training data to `data/training/bert_training_set.jsonl`
- [ ] **Model Fine-tuning:**
  - Base model: `bert-base-uncased` from HuggingFace (or `distilbert-base-uncased` if GPU-limited)
  - Multi-task head: binary relevance classification + 6-class risk category classification
  - Training: 3 epochs, learning rate 2e-5, batch size 16
  - Use `Trainer` API from HuggingFace `transformers`
  - Save best checkpoint by validation F1
- [ ] **Evaluation:**
  - Compute F1, Precision, Recall per risk category on held-out test set
  - Target: overall weighted F1 > 0.85
  - Generate confusion matrix per category
  - Save evaluation report to `docs/model-evaluation-bert.md`
- [ ] **Deployment:**
  - Wrap trained model in `BERTClassifier` class with `predict(article_text) → dict` interface
  - Add model version tracking (version string stored in `risk_scores.model_version`)
  - Load model at FastAPI startup via lifespan event (singleton, not per-request)
- [ ] Write 10 integration tests: known articles → expected classifications

> ✔ **DELIVERABLE:** BERT classifier live, F1 > 0.85 confirmed on test set, evaluation report committed.

---

### 3.3 — Sentiment Analysis Model

**What you're building:** Article-level sentiment scoring calibrated for finance and telecom, not general web text.

- [ ] Evaluate: `ProsusAI/finbert` (finance-specific BERT) vs `cardiffnlp/twitter-roberta-base-sentiment`
- [ ] Select finBERT as primary model for press articles; twitter-roberta for social media content
- [ ] Build `SentimentAnalyzer` class:
  - Input: article text + source category
  - Output: `{ sentiment: 'POSITIVE'|'NEUTRAL'|'NEGATIVE', confidence: float, scores: { pos, neu, neg } }`
  - Route to finance model if source is press; social model if source is twitter/reddit
- [ ] Combine sentiment with risk score: high negative sentiment + high severity = escalate alert tier
- [ ] Write 15 unit tests with known finance articles from Ghana market context

> ✔ **DELIVERABLE:** Sentiment scoring on every article, stored in risk_scores table.

---

### 3.4 — Financial Impact Scoring Model

**What you're building:** An estimation model that converts a risk score + entity profile into a GHS and USD financial impact range.

- [ ] Define impact estimation formula with MTN stakeholder:
  ```python
  def estimate_impact(risk_category, severity_score, entities, mtn_relevance):
      base_exposure = CATEGORY_BASE_EXPOSURE[risk_category]  # e.g. REGULATORY = 50M GHS
      entity_multiplier = compute_entity_weight(entities)
      impact_median = base_exposure * (severity_score / 10) * entity_multiplier * mtn_relevance
      impact_min = impact_median * 0.3
      impact_max = impact_median * 2.5
      return { min_ghs, median_ghs, max_ghs, min_usd, median_usd, max_usd }
  ```
- [ ] Define `CATEGORY_BASE_EXPOSURE` constants (validated with MTN Finance team)
- [ ] Implement live GHS/USD exchange rate fetch (Bank of Ghana API or fallback to cached rate)
- [ ] Write 10 unit tests verifying impact calculations for each risk category

> ✔ **DELIVERABLE:** Every scored article has min/median/max financial impact in GHS and USD.

---

### 3.5 — LSTM Risk Forecaster

**What you're building:** A time-series model that forecasts risk scores 7 and 30 days into the future per risk category.

- [ ] **Data Preparation:**
  - Aggregate daily average risk scores per category for the past 12 months (use historical news data or generate synthetic training data to supplement)
  - Create sequences of length 30 (last 30 days → predict next 7 or 30 days)
  - Normalize scores to [0, 1] range; store scaler for inverse transform
- [ ] **Model Architecture:**
  ```python
  model = Sequential([
      LSTM(128, return_sequences=True, input_shape=(30, 6)),  # 6 risk categories
      Dropout(0.2),
      LSTM(64, return_sequences=False),
      Dropout(0.2),
      Dense(7 * 6)    # 7-day forecast × 6 categories
  ])
  ```
  - Train separate model for 7-day and 30-day horizons
  - Loss: Mean Absolute Error (MAE)
  - Evaluate: MAPE (Mean Absolute Percentage Error) — target < 10%
- [ ] **Monte Carlo Simulation:**
  - Run 1000 simulations per forecast with Gaussian noise on input sequence
  - Compute 10th, 50th, 90th percentiles → min/median/max impact bands
- [ ] Save trained models to `backend/models/lstm_7d.h5` and `backend/models/lstm_30d.h5`
- [ ] Build `LSTMForecaster.predict(category, horizon_days)` → returns forecast array
- [ ] Schedule daily retraining Celery task (runs at 02:00 UTC)
- [ ] Write `GET /api/forecasts/{category}?horizon=7` endpoint
- [ ] Evaluate against held-out period; save to `docs/model-evaluation-lstm.md`

> ✔ **DELIVERABLE:** LSTM producing 7-day and 30-day forecasts per category. Evaluation report committed.

---

### 3.6 — Anomaly Detection Engine

**What you're building:** A rule-based + statistical engine that flags unusual clustering of high-risk articles for immediate escalation.

- [ ] Implement `AnomalyDetector` class:
  - **Volume anomaly:** if article count for a category in the past 2 hours > 3× rolling 7-day average → flag
  - **Severity anomaly:** if 3+ articles with score > 7.5 from different sources in 1 hour → CRITICAL escalation
  - **Velocity anomaly:** risk score increasing > 30% in 4-hour window → WARNING escalation
- [ ] Trigger anomaly events to alert pipeline when thresholds breached
- [ ] Store anomaly events in `anomalies` table with: type, category, detected_at, description
- [ ] Build `GET /api/anomalies/active` endpoint
- [ ] Write 10 unit tests simulating each anomaly type

> ✔ **DELIVERABLE:** Anomaly detection triggers on real article clusters. Integrated with alert pipeline.

---

### 3.7 — Full NLP Orchestration Pipeline

**What you're building:** The Celery task that ties spaCy NER → BERT Classifier → Sentiment → Impact → Anomaly detection into one atomic pipeline run per article.

- [ ] Create `process_article` Celery task:
  ```
  Input: article_id
  Steps:
    1. Load article from DB
    2. Run NERPipeline → extract entities
    3. Run BERTClassifier → mtn_relevance + risk_category + confidence
    4. If mtn_relevance < 0.3: skip further processing, mark as irrelevant
    5. Run SentimentAnalyzer → sentiment + scores
    6. Run ImpactScorer → financial impact range
    7. Compute alert_tier from severity_score thresholds
    8. Save RiskScore record to DB
    9. If alert_tier in (WARNING, CRITICAL): trigger alert pipeline
    10. Run AnomalyDetector check
  ```
- [ ] Chain `process_article` task to fire automatically after `DatabasePipeline` stores a new article
- [ ] Set task timeout: 30 seconds per article (hard limit)
- [ ] Add retry logic: 3 retries with 5s exponential backoff on transient failures
- [ ] Measure pipeline latency: target < 2 minutes from article scrape to risk score stored
- [ ] Build `GET /api/pipeline/metrics` showing average processing time per article

> ✔ **DELIVERABLE:** Articles go from scrape to scored risk record in < 2 minutes, end-to-end.

---

## Phase 4 — Web App Dashboard

### Week 4 | Jun 8–14 | ⭐ Milestone 1: Jun 15 — Web App v1.0 publicly deployed

---

### 4.1 — React Application Setup & Design System

**What you're building:** The React 18 + TypeScript project with the MTN QuantRisk design system implemented as Tailwind config and shared components.

- [ ] Initialize React 18 + TypeScript + Vite project in `frontend/`
- [ ] Configure TailwindCSS with MTN brand tokens:
  ```js
  // tailwind.config.js
  colors: {
    'mtn-yellow': '#FFCB00',
    'mtn-black': '#000000',
    'mtn-charcoal': '#1A1A1A',
    'mtn-surface': '#2C2C2C',
    'mtn-border': '#333333',
    status: { critical: '#EF4444', warning: '#F59E0B', watch: '#3B82F6', safe: '#10B981' }
  }
  ```
- [ ] Install and configure: `recharts`, `@tanstack/react-query`, `zustand`, `react-router-dom`, `lucide-react`
- [ ] Build shared component library in `frontend/src/components/ui/`:
  - `<RiskBadge tier="CRITICAL|WARNING|WATCH|SAFE" />`
  - `<CategoryChip category="REGULATORY|FX_FINANCIAL|..." />`
  - `<KPICard title label value trend trendColor />`
  - `<ArticleCard article onExpand />`
  - `<LiveIndicator />` (pulsing green dot + "LIVE" text)
  - `<SkeletonLoader />` (shimmer animation for loading states)
  - `<AlertBanner message type onDismiss />`
- [ ] Set up React Query for all API calls (caching, refetch intervals, background updates)
- [ ] Set up WebSocket client hook: `useWebSocket(endpoint)` → returns live data stream
- [ ] Configure Zustand stores: `useAuthStore`, `useAlertStore`, `usePipelineStore`

> ✔ **DELIVERABLE:** React app boots with MTN design system. All shared components render correctly.

---

### 4.2 — Authentication & Protected Routes

- [ ] Build `LoginPage` component — email/password form, SSO button, MTN branding
- [ ] Implement JWT storage (httpOnly cookie preferred, fallback to memory — not localStorage)
- [ ] Implement `ProtectedRoute` HOC — redirect to login if no valid token
- [ ] Implement token refresh logic — silent refresh 60 seconds before expiry
- [ ] Build `useAuth` hook with: `login()`, `logout()`, `user`, `isAuthenticated`
- [ ] Build user role guard: hide Analyst/Admin features from Viewer role
- [ ] Write E2E test: login → access dashboard → logout → redirected to login

> ✔ **DELIVERABLE:** Authentication works. Invalid credentials rejected. Role-based UI renders correctly.

---

### 4.3 — Main Dashboard (Home)

**What you're building:** The command-centre overview page — the first thing a risk analyst sees every morning.

- [ ] Build `DashboardPage` with 3-row layout:
  - **Row 1 — KPI Cards (5 across):** Active Alerts, Articles Processed Today, Highest Risk Category, 7-Day Forecast Trend, AI Briefings Generated
  - **Row 2 — 70/30 split:** Risk Trend Chart (left) + Category Breakdown Panel (right)
  - **Row 3 — 60/40 split:** Live News Feed preview (left) + Active Alert Feed (right)
- [ ] **Risk Trend Chart** using Recharts `ComposedChart`:
  - Historical line (MTN yellow, area fill)
  - Forecast line (dashed white, area fill)
  - Monte Carlo confidence bands (semi-transparent)
  - Event annotation markers (NCA drops, FX spikes)
  - 7D/30D/90D toggle buttons
- [ ] **Category Breakdown Panel:** horizontal bars per category with score + tier badge
- [ ] All data fetched via React Query with 60-second refetch interval
- [ ] Live badge pulses every time new articles arrive (WebSocket count event)
- [ ] Build `GET /api/dashboard/summary` backend endpoint returning all KPIs in one call
- [ ] Write 5 component tests covering KPI rendering with mock data

> ✔ **DELIVERABLE:** Dashboard renders with live data. All 5 KPIs accurate. Chart displays correctly.

---

### 4.4 — Live News Feed Page

- [ ] Build `NewsFeedPage` with filter controls and 2-column masonry article grid
- [ ] Filter chips: risk category, source type, severity, date range, sort order
- [ ] `ArticleCard` (full version) displaying: source, category chip, timestamp, risk score badge, headline, AI summary, entity tags, financial impact, "View Analysis" CTA
- [ ] Implement infinite scroll (React Query + Intersection Observer)
- [ ] Build `GET /api/articles` backend endpoint with query params: `category`, `source_type`, `min_severity`, `date_from`, `date_to`, `sort`, `page`, `limit`
- [ ] Real-time new article indicator: "12 new articles — click to refresh" toast when WebSocket signals new arrivals
- [ ] Article detail modal / side panel: full article text, complete NLP output, entity graph, impact breakdown
- [ ] Write 5 component tests for filter combinations and article card rendering

> ✔ **DELIVERABLE:** News feed loads, filters work, infinite scroll works, real-time new articles indicated.

---

### 4.5 — Risk Radar Map View

- [ ] Build `RiskRadarPage` — integrate Mapbox GL JS with dark map style (`dark-v11`)
- [ ] Apply Ghana region heat-map overlay using GeoJSON for Ghana regions
  - Color scale: green (low risk) → yellow → amber → red (critical)
  - Opacity driven by risk score per region
- [ ] Animated pulse circles on high-risk zones (CSS animation via Mapbox addLayer)
- [ ] MTN Ghana location pin markers (yellow MTN color)
- [ ] Left control panel: view toggle (Ghana / Global), layer filters, severity threshold slider
- [ ] Region click → bottom drawer slides up with region details, sparklines, latest articles
- [ ] "MTN Group Global View" toggle: switches to world map with all MTN operating countries
- [ ] Build `GET /api/risk-radar/regions` endpoint returning: region, risk_score, top_category, article_count, last_updated
- [ ] Ensure Mapbox token stored securely in environment variable (never committed)

> ✔ **DELIVERABLE:** Ghana heat map renders with real risk scores. Region click shows drill-down data.

---

### 4.6 — Alert Management Center

- [ ] Build `AlertsPage` with alert summary bar + configuration panel + alert list
- [ ] Alert list with filtering by tier, category, status (acknowledged/unacknowledged)
- [ ] Alert card actions: Acknowledge (with timestamp + user), Escalate, View Report
- [ ] Alert configuration panel: severity threshold sliders per category, notification channel toggles
- [ ] Build WebSocket event handler: new CRITICAL alert → browser notification permission request → show desktop notification
- [ ] Build `POST /api/alerts/{id}/acknowledge` endpoint (records user + timestamp)
- [ ] Build `PUT /api/alert-config` endpoint for saving threshold preferences
- [ ] Alert history view: last 7 days, sorted by severity
- [ ] Build `POST /api/alerts/test` (admin only) — trigger a test alert through all channels

> ✔ **DELIVERABLE:** Alerts display live. Acknowledge works. Threshold config saves and applies.

---

### 4.7 — AI Narrative Reports View

- [ ] Build `ReportsPage` — sidebar list of generated reports + main report viewer
- [ ] Integrate LLM report generation:
  - Build `generate_report` Celery task: runs daily at 07:00 UTC and on-demand
  - Prompt engineering: feed top 5 articles by severity + LSTM forecast + anomaly flags → LLM generates 400-word executive brief
  - Use Anthropic Claude API or OpenAI GPT-4o as LLM backend
  - Structure report: Executive Summary, Key Risk Findings, Financial Impact Estimate, Recommended Actions, 30-Day Outlook
- [ ] Build `GET /api/reports` and `POST /api/reports/generate` endpoints
- [ ] Report viewer: styled as dark executive document card within the dark UI
- [ ] "Download PDF" button: server-renders report to PDF using `weasyprint`
- [ ] "Share" button: generates shareable link (authenticated, time-limited)
- [ ] Write 3 integration tests: verify report generates without error for each risk category

> ✔ **DELIVERABLE:** AI reports generate on schedule, render in viewer, download as PDF.

---

### 4.8 — Forecasting & Monte Carlo Page

- [ ] Build `ForecastsPage` — main forecast chart + per-category forecast cards + impact projections
- [ ] Multi-layer Recharts area chart:
  - Historical zone (yellow, solid)
  - Forecast zone (dashed, 3 Monte Carlo bands)
  - Event annotation vertical markers
- [ ] 7D / 30D toggle — fetch and swap forecast data
- [ ] Per-category forecast cards: current score, forecast score, trend arrow, sparkline, confidence
- [ ] Financial Impact Panel: min/median/max in GHS and USD with horizontal range bar
- [ ] Model Metrics card: BERT F1, LSTM MAPE, last retrained timestamp
- [ ] Anomaly alerts card: active anomaly flags with descriptions
- [ ] Build `GET /api/forecasts/summary` endpoint returning all categories + horizons in one call

> ✔ **DELIVERABLE:** Forecast page renders with real LSTM output. Monte Carlo bands display correctly.

---

### 4.9 — WebSocket Real-Time Push Backend

- [ ] Implement WebSocket server using FastAPI `WebSocket` endpoints:
  - `ws://api/ws/feed` — streams new article events (headline, score, category)
  - `ws://api/ws/alerts` — streams new alert events (tier, message, category)
  - `ws://api/ws/pipeline` — streams pipeline heartbeat (articles/min, queue depth)
- [ ] JWT authentication for WebSocket connections (token in query param on connect)
- [ ] Implement Redis Pub/Sub as the broadcast layer: Celery tasks publish events → API WebSocket handler subscribes → pushes to connected clients
- [ ] Handle disconnection gracefully: reconnect with exponential backoff on client side
- [ ] Load test WebSocket: verify 50 concurrent connections receive events without lag

> ✔ **DELIVERABLE:** Live data pushes to connected browser clients in real time. Tested with 50 connections.

---

## Phase 5 — Mobile App & PWA

### Week 5 | Jun 15–21 | Deliverable: iOS TestFlight + Android Play Store beta

---

### 5.1 — Expo Project Setup

- [ ] Initialize Expo managed workflow project in `mobile/`
- [ ] Configure `app.json`: app name "MTN QuantRisk", bundle ID `com.mtn.quantrisk`, icons, splash screen (MTN yellow on black)
- [ ] Install core dependencies: `expo-router`, `@tanstack/react-query`, `zustand`, `axios`
- [ ] Configure environment: `expo-constants` + `app.config.js` for API base URL
- [ ] Port MTN design system tokens to React Native StyleSheet equivalents
- [ ] Build shared mobile components: `RiskBadge`, `ArticleCard`, `KPICard` (mobile-optimized)
- [ ] Set up navigation: bottom tab navigator with 5 tabs (Home, Feed, Radar, Alerts, Reports)
- [ ] Implement shared API client with JWT token management (React Native AsyncStorage)

> ✔ **DELIVERABLE:** Expo app boots on simulator with bottom navigation and MTN branding.

---

### 5.2 — Biometric Authentication

- [ ] Implement `expo-local-authentication` for Face ID / Fingerprint
- [ ] Flow: first login → standard JWT email/password → store refresh token in `expo-secure-store`
- [ ] Subsequent logins: biometric prompt → if passes → retrieve stored token → refresh silently
- [ ] Fallback: PIN code entry if biometric fails 3 times
- [ ] Show biometric prompt screen with MTN branding, "Authenticate to continue" message
- [ ] Test on physical iOS device (Face ID) and Android device (Fingerprint)

> ✔ **DELIVERABLE:** Biometric login works on iOS and Android physical devices.

---

### 5.3 — Mobile Dashboard & News Feed

- [ ] Build `HomeScreen`: greeting, live status banner, alert summary card, risk score card, 7-day mini chart, latest 3 news cards, "View Full Dashboard" CTA
- [ ] Build `FeedScreen`: vertical scrolling list of `ArticleCard` components, filter chips, real-time new-article banner at top
- [ ] Build `AlertsScreen`: tiered alert list, acknowledge action, escalate action
- [ ] Build `ReportsScreen`: report list, PDF download, share options
- [ ] Implement pull-to-refresh on all screens
- [ ] Implement pagination / infinite scroll on news feed
- [ ] Sync interval: React Query refetch every 90 seconds (balance freshness vs battery)

> ✔ **DELIVERABLE:** Core screens functional, data syncing from API, pull-to-refresh working.

---

### 5.4 — Firebase Push Notifications (FCM)

- [ ] Set up Firebase project for MTN QuantRisk
- [ ] Install `expo-notifications` and configure FCM
- [ ] Backend: install `firebase-admin` SDK, store service account key in env
- [ ] Build `NotificationService` class:
  ```python
  def send_push(user_ids, title, body, data):
      # Fetch FCM tokens for user IDs
      # Send via Firebase Admin SDK
      # Log delivery status
  ```
- [ ] Integrate with alert pipeline: new CRITICAL/WARNING alert → fire push to all subscribed analysts
- [ ] Notification payload: `{ alertId, tier, category, headline, deepLink }`
- [ ] Deep link handling: tapping notification opens `AlertDetailScreen` for that alert
- [ ] Notification permission request on first app launch (with explanation dialog)
- [ ] Test notification delivery end-to-end: trigger alert in backend → confirm push received on device

> ✔ **DELIVERABLE:** Push notifications received on locked iOS and Android devices within 30 seconds.

---

### 5.5 — Offline Mode & PWA

- [ ] Implement `@react-native-async-storage/async-storage` offline cache:
  - Cache last 50 articles on every successful fetch
  - Cache last risk scores per category
  - Cache last generated report
  - Display cached data with "Offline — showing cached data from [timestamp]" banner when no network
- [ ] **PWA (Progressive Web App):**
  - Add `manifest.json` to `frontend/public/` with MTN QuantRisk branding
  - Implement Service Worker via Vite PWA plugin (`vite-plugin-pwa`)
  - Cache strategy: Network First for API calls, Cache First for static assets
  - Show "Install App" prompt for desktop and mobile browsers
  - Offline fallback page: shows cached dashboard with timestamp
- [ ] Test offline mode: airplane mode on device → app shows cached data correctly

> ✔ **DELIVERABLE:** App shows cached content offline. PWA installs from browser. "Offline" banner visible.

---

### 5.6 — Mobile Risk Radar (Map View)

- [ ] Integrate `react-native-maps` with custom dark map style
- [ ] Render Ghana region overlays with color heat map (risk score → color)
- [ ] Animated pulse markers on high-risk zones
- [ ] Bottom sheet drawer (`@gorhom/bottom-sheet`): draggable, shows region details on map tap
- [ ] View toggle: Ghana Focus / MTN Group Global
- [ ] Optimize map performance: cluster markers when zoomed out, load regions lazily
- [ ] Test on both iOS and Android physical devices for smooth rendering

> ✔ **DELIVERABLE:** Mobile map renders Ghana heat map. Region tap opens bottom sheet with details.

---

### 5.7 — Build & Submit to Stores

- [ ] Configure EAS Build (Expo Application Services)
- [ ] Build iOS `.ipa` via `eas build --platform ios`
- [ ] Submit to TestFlight via `eas submit --platform ios`
- [ ] Build Android `.aab` via `eas build --platform android`
- [ ] Submit to Google Play internal testing track via `eas submit --platform android`
- [ ] Share TestFlight link with MTN stakeholders for UAT
- [ ] Verify crash-free launch on at minimum 3 different device models

> ✔ **DELIVERABLE:** iOS on TestFlight, Android on Play Store internal beta. MTN stakeholders have access.

---

## Phase 6 — Testing, Docs & Deployment

### Week 6 | Jun 22–29 | ⭐ Final Deadline: Jun 29 — Full platform live on AWS

---

### 6.1 — End-to-End Test Suite

- [ ] **Backend (Pytest):**
  - `test_scraper_pipeline.py` — verify articles ingested, deduplicated, stored
  - `test_nlp_pipeline.py` — verify NER, BERT, sentiment, impact scoring on 20 real articles
  - `test_alert_pipeline.py` — verify CRITICAL article triggers alert, stored, delivered to WebSocket
  - `test_forecast_endpoint.py` — verify LSTM output shape and value ranges
  - `test_auth.py` — JWT flows, role guards, token expiry
  - Coverage target: > 80% on `backend/app/` excluding scrapers (integration-tested separately)
- [ ] **Frontend (Cypress E2E):**
  - `login.cy.js` — valid login, invalid credentials, token refresh
  - `dashboard.cy.js` — KPIs render, chart renders, live badge updates
  - `newsfeed.cy.js` — articles load, filters work, article modal opens
  - `alerts.cy.js` — alert appears, acknowledge flow, threshold config saves
  - `reports.cy.js` — report generates, PDF downloads
- [ ] All tests run automatically in GitHub Actions on push to `main`
- [ ] No PR merges if tests fail

> ✔ **DELIVERABLE:** Test suite running green in CI/CD. Backend coverage > 80%. All Cypress flows pass.

---

### 6.2 — Load Testing

- [ ] Install `locust` for load testing
- [ ] Write `locustfile.py` simulating typical analyst behavior:
  - `GET /api/dashboard/summary` — every 30 seconds per user
  - `GET /api/articles` with filters — every 60 seconds per user
  - `WebSocket /ws/feed` — persistent connection
- [ ] Run load test: 1,000 concurrent users on staging environment (AWS t3.medium)
- [ ] Identify and fix bottlenecks:
  - Add database indexes for `risk_scores.scored_at`, `articles.published_at`, `risk_scores.alert_tier`
  - Enable PostgreSQL connection pooling via PgBouncer
  - Add Redis caching to `GET /api/dashboard/summary` (60-second TTL)
  - Optimize `GET /api/articles` query with pagination cursor (not OFFSET)
- [ ] Target: p95 response time < 500ms for all endpoints under 1,000 users

> ✔ **DELIVERABLE:** Load test at 1,000 users passes. p95 < 500ms confirmed. No OOM or timeout errors.

---

### 6.3 — Model Back-Testing & Validation

- [ ] Run LSTM forecaster against 12 months of held-out historical MTN news data
- [ ] Compute MAPE per risk category and overall — document in `docs/model-evaluation-lstm.md`
- [ ] Validate BERT classifier on 100 new articles not in training set — confirm F1 still > 0.85
- [ ] Test anomaly detection: inject synthetic article cluster → verify anomaly flagged within 5 minutes
- [ ] Document any discovered model weaknesses in risk register

> ✔ **DELIVERABLE:** Model back-test complete. Evaluation results committed to docs. Weaknesses documented.

---

### 6.4 — Technical Documentation

- [ ] **API Reference:** auto-generate from FastAPI OpenAPI schema → `docs/api-reference.md`
- [ ] **Deployment Runbook:** `docs/deployment-runbook.md`
  - Step-by-step AWS deployment procedure
  - Environment variable checklist
  - Database migration procedure
  - SSL certificate renewal procedure
  - How to restart individual services
  - Rollback procedure
- [ ] **Operator User Guide:** `docs/user-guide.md` for MTN analysts
  - How to read the risk dashboard
  - Understanding risk categories and alert tiers
  - How to configure alert thresholds
  - How to generate and export reports
  - How to use the mobile app
- [ ] **Architecture Diagrams:** update `docs/architecture.md` with final deployed topology
- [ ] **Changelog:** `CHANGELOG.md` with all features delivered per phase

> ✔ **DELIVERABLE:** All 5 documentation artifacts committed and reviewed by Tech Lead.

---

### 6.5 — Production Deployment on AWS

- [ ] **Infrastructure Provisioning:**
  - EC2 `t3.large` for API + Celery workers (Ubuntu 24.04)
  - RDS PostgreSQL `db.t3.medium` (Multi-AZ for production reliability)
  - ElastiCache Redis `cache.t3.micro`
  - S3 bucket for report PDF storage
  - CloudFront CDN in front of React frontend
  - Security groups: restrict DB access to EC2 only, no public database exposure
- [ ] **Nginx Configuration:**
  - Reverse proxy to FastAPI on port 8000
  - Serve React build from `/var/www/quantrisk/`
  - WebSocket proxy: `proxy_pass` with `upgrade` headers
  - HTTPS only: redirect all HTTP → HTTPS
- [ ] **SSL Certificate:** Let's Encrypt via Certbot, auto-renewal cron job
- [ ] **Process Management:** Systemd service units for API, Celery worker, Celery beat
- [ ] **Monitoring:** configure CloudWatch alarms for CPU > 80%, memory > 85%, API error rate > 1%
- [ ] **Backup:** daily RDS automated snapshots (7-day retention), S3 versioning on report bucket
- [ ] Run `alembic upgrade head` against production database
- [ ] Run seed data script (MTN-specific entity weights, initial user accounts)
- [ ] Smoke test: verify all endpoints return 200, WebSocket connects, scraper is running

> ✔ **DELIVERABLE:** Full platform live at production URL. All services running. HTTPS active. Monitoring on.

---

### 6.6 — Final Presentation & Stakeholder Demo

- [ ] Update pitch deck with live platform screenshots and real data
- [ ] Prepare 20-minute live demo script:
  1. Show live dashboard with real articles (5 min)
  2. Drill into a CRITICAL alert from today — show article → NLP analysis → impact score (5 min)
  3. Show forecast chart — 30-day projection for top risk category (3 min)
  4. Show AI-generated board briefing — download PDF (3 min)
  5. Demo mobile app — receive push notification, view on phone (4 min)
- [ ] Executive summary report: 2-page PDF covering: what was built, technical approach, performance metrics, model accuracy, suggested next steps
- [ ] Send demo URL + credentials to MTN stakeholders 24 hours before presentation
- [ ] Record a backup demo video in case of live connectivity issues

> ✔ **DELIVERABLE:** Presentation delivered. Demo run live. Executive summary distributed to stakeholders.

---

## GitHub Issues Registry

Copy each issue below into GitHub Issues. Set labels, milestone, and project fields as specified.

---

### Phase 1 Issues

```
ISSUE #001
Title:     [INFRA] Set up GitHub repo, Docker Compose, and CI/CD pipeline
Labels:    infrastructure, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🔴 Critical
Points:    5
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Create the foundational DevOps infrastructure for the MTN QuantRisk platform.

  ## Tasks
  - [ ] Create GitHub repo with branch protection on `main`
  - [ ] Set up branch strategy (main / develop / feature/*)
  - [ ] Write `docker-compose.yml` with services: api, worker, db, redis, nginx
  - [ ] Write `Dockerfile` for FastAPI backend (Python 3.11 slim)
  - [ ] Set up GitHub Actions: lint → test → build workflow
  - [ ] Configure pre-commit hooks (black, flake8, isort)
  - [ ] Add `.env.example` with all required environment variables documented
  - [ ] Verify `docker-compose up` runs clean on fresh clone

  ## Acceptance Criteria
  - `docker-compose up` boots all 5 services without errors
  - CI pipeline runs green on a test push
  - Branch protection prevents direct push to main

  ## Definition of Done
  All tasks checked off. CI green. Docker clean boot verified.
```

```
ISSUE #002
Title:     [INFRA] Define risk taxonomy and constants
Labels:    infrastructure, backend-api, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🔴 Critical
Points:    3
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Establish the authoritative risk taxonomy — 6 categories, alert tiers, severity thresholds.

  ## Tasks
  - [ ] Implement 6 risk categories in `backend/app/constants/risk_taxonomy.py`
  - [ ] Define severity scale 0.0–10.0 with tier thresholds (WATCH/WARNING/CRITICAL)
  - [ ] Document financial impact formula
  - [ ] Write `docs/risk-taxonomy.md` and get MTN stakeholder sign-off
  - [ ] Create shared enum types for risk categories and alert tiers

  ## Acceptance Criteria
  - `risk_taxonomy.py` committed with all 6 categories and tier constants
  - `docs/risk-taxonomy.md` reviewed and approved by MTN stakeholder
```

```
ISSUE #003
Title:     [DB] Design and implement PostgreSQL schema with Alembic migrations
Labels:    database, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🔴 Critical
Points:    5
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Create complete database schema for all platform data.

  ## Tables to Create
  - [ ] `articles` — raw scraped article storage
  - [ ] `risk_scores` — NLP/ML output per article
  - [ ] `alerts` — triggered alerts with delivery tracking
  - [ ] `forecasts` — LSTM forecast output storage
  - [ ] `sources` — scraper health registry
  - [ ] `reports` — AI narrative reports
  - [ ] `users` — platform users and roles
  - [ ] `anomalies` — anomaly detection events

  ## Acceptance Criteria
  - `alembic upgrade head` runs clean with zero errors
  - Seed data script loads successfully
  - All foreign key constraints pass
```

```
ISSUE #004
Title:     [API] FastAPI base application with JWT authentication
Labels:    backend-api, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🔴 Critical
Points:    5
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Build the FastAPI application skeleton with JWT auth and RBAC.

  ## Tasks
  - [ ] Scaffold FastAPI app with lifespan context
  - [ ] Configure CORS middleware
  - [ ] Set up DB session dependency injection
  - [ ] POST /auth/login — returns JWT access + refresh tokens
  - [ ] POST /auth/refresh — token rotation
  - [ ] POST /auth/logout — token blacklist in Redis
  - [ ] GET /health — service status check
  - [ ] Implement RBAC: ADMIN / ANALYST / VIEWER roles
  - [ ] Write 10+ unit tests for auth flows

  ## Acceptance Criteria
  - POST /auth/login returns valid JWT
  - Protected routes return 401 without token
  - VIEWER role cannot access ADMIN endpoints
  - 10+ tests passing
```

```
ISSUE #005
Title:     [DOCS] News source audit and scraping strategy document
Labels:    documentation, scraper, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🟡 High
Points:    3
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Audit all 15+ sources and document the scraping strategy for each.

  ## Tasks
  - [ ] Verify robots.txt compliance for all 15+ sources
  - [ ] Identify RSS vs HTML vs API access per source
  - [ ] Identify Playwright-required sources
  - [ ] Document rate limits per domain
  - [ ] Document authentication requirements (Twitter, Reddit API keys)
  - [ ] Write `docs/source-inventory.md`

  ## Acceptance Criteria
  - All 15+ sources documented in `docs/source-inventory.md`
  - robots.txt compliance confirmed for each
  - API key requirements listed
```

```
ISSUE #006
Title:     [DOCS] System architecture document and ADRs
Labels:    documentation, infrastructure, milestone-1
Phase:     Phase 1
Week:      Week 1
Priority:  🟡 High
Points:    3
Milestone: Phase 1 Done (May 24)
Body:
  ## Objective
  Document the complete system architecture before any code is written.

  ## Tasks
  - [ ] Write `docs/architecture.md` with data flow, tech stack, DB overview, security model
  - [ ] Write ADR-001 through ADR-005 covering all major technology decisions
  - [ ] Get Tech Lead sign-off on architecture document

  ## Acceptance Criteria
  - Architecture doc committed and reviewed
  - All 5 ADRs written
  - Sign-off documented in architecture doc
```

---

### Phase 2 Issues

```
ISSUE #007
Title:     [SCRAPER] Scrapy project setup with base spider and pipeline
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🔴 Critical
Points:    5
Milestone: Phase 2 Done (May 31)

ISSUE #008
Title:     [SCRAPER] Ghana & Africa news spiders (6 sources)
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🔴 Critical
Points:    5
Milestone: Phase 2 Done (May 31)

ISSUE #009
Title:     [SCRAPER] Global finance & telecom spiders (6 sources)
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🔴 Critical
Points:    5
Milestone: Phase 2 Done (May 31)

ISSUE #010
Title:     [SCRAPER] MTN-specific source scrapers + PDF extraction
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🔴 Critical
Points:    5
Milestone: Phase 2 Done (May 31)

ISSUE #011
Title:     [SCRAPER] Twitter/X API filtered stream integration
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🟡 High
Points:    3
Milestone: Phase 2 Done (May 31)

ISSUE #012
Title:     [SCRAPER] Reddit API monitoring (PRAW)
Labels:    scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🟢 Normal
Points:    2
Milestone: Phase 2 Done (May 31)

ISSUE #013
Title:     [INFRA] Celery Beat scheduler + Redis deduplication engine
Labels:    infrastructure, scraper, milestone-1
Phase:     Phase 2
Week:      Week 2
Priority:  🔴 Critical
Points:    5
Milestone: Phase 2 Done (May 31)
Body:
  ## Acceptance Criteria
  - Celery Beat runs all-scrapers task every 15 minutes without manual intervention
  - 0 duplicate articles stored (verify with SQL: SELECT COUNT(*) WHERE url duplicated)
  - 500+ articles stored after 24-hour run confirmed with COUNT query
  - Dead-letter queue captures failed jobs

ISSUE #014
Title:     [API] Pipeline health endpoint GET /api/pipeline/health
Labels:    backend-api, scraper
Phase:     Phase 2
Week:      Week 2
Priority:  🟡 High
Points:    2
Milestone: Phase 2 Done (May 31)
```

---

### Phase 3 Issues

```
ISSUE #015
Title:     [NLP] spaCy NER pipeline with MTN-specific entity extraction
Labels:    nlp, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🔴 Critical
Points:    8
Milestone: Phase 3 Done (Jun 7)

ISSUE #016
Title:     [ML] BERT MTN-relevance and risk category classifier — training and evaluation
Labels:    ml-model, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🔴 Critical
Points:    8
Milestone: Phase 3 Done (Jun 7)
Body:
  ## Acceptance Criteria
  - Model fine-tuned and checkpoint saved
  - Weighted F1 > 0.85 on held-out test set
  - Confusion matrix generated per category
  - `docs/model-evaluation-bert.md` committed
  - BERTClassifier class integrated into FastAPI startup

ISSUE #017
Title:     [ML] Sentiment analysis model (finBERT + twitter-roberta)
Labels:    ml-model, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🟡 High
Points:    3
Milestone: Phase 3 Done (Jun 7)

ISSUE #018
Title:     [ML] Financial impact scoring model (GHS + USD)
Labels:    ml-model, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🟡 High
Points:    3
Milestone: Phase 3 Done (Jun 7)

ISSUE #019
Title:     [ML] LSTM risk forecaster — 7-day and 30-day with Monte Carlo
Labels:    ml-model, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🔴 Critical
Points:    8
Milestone: Phase 3 Done (Jun 7)
Body:
  ## Acceptance Criteria
  - 7-day and 30-day LSTM models trained and saved
  - MAPE < 10% on validation set
  - Monte Carlo returns 10th/50th/90th percentile bands
  - GET /api/forecasts/{category}?horizon=7 returns valid data
  - Daily retraining Celery task scheduled

ISSUE #020
Title:     [ML] Anomaly detection engine (volume + severity + velocity)
Labels:    ml-model, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🟡 High
Points:    3
Milestone: Phase 3 Done (Jun 7)

ISSUE #021
Title:     [NLP] Full NLP orchestration pipeline — Celery task chaining
Labels:    nlp, ml-model, backend-api, milestone-1
Phase:     Phase 3
Week:      Week 3
Priority:  🔴 Critical
Points:    5
Milestone: Phase 3 Done (Jun 7)
Body:
  ## Acceptance Criteria
  - New article → scored risk record in PostgreSQL in < 2 minutes end-to-end
  - Pipeline latency logged and accessible via GET /api/pipeline/metrics
  - CRITICAL articles trigger alert pipeline
  - All 6 pipeline steps (NER → BERT → Sentiment → Impact → Alert → Anomaly) logged
```

---

### Phase 4 Issues

```
ISSUE #022
Title:     [FRONTEND] React app setup with MTN design system and component library
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #023
Title:     [FRONTEND] JWT authentication, login page, and protected routes
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    3
Milestone: Milestone 1 (Jun 15)

ISSUE #024
Title:     [FRONTEND] Main dashboard page — KPIs, risk trend chart, category breakdown
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    8
Milestone: Milestone 1 (Jun 15)

ISSUE #025
Title:     [FRONTEND] Live news feed page with filters and infinite scroll
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #026
Title:     [FRONTEND] Risk radar map — Ghana heat map with Mapbox GL
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🟡 High
Points:    8
Milestone: Milestone 1 (Jun 15)

ISSUE #027
Title:     [FRONTEND] Alert management center — list, acknowledge, threshold config
Labels:    frontend, alerts, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #028
Title:     [FRONTEND] AI narrative reports viewer with PDF download
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🟡 High
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #029
Title:     [FRONTEND] Forecasting page — LSTM chart + Monte Carlo bands + impact panel
Labels:    frontend, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🟡 High
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #030
Title:     [API] WebSocket real-time push — feed, alerts, and pipeline heartbeat streams
Labels:    backend-api, alerts, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    5
Milestone: Milestone 1 (Jun 15)

ISSUE #031
Title:     [ALERTS] Three-tier alert pipeline — Watch/Warning/Critical with SendGrid email
Labels:    alerts, backend-api, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🔴 Critical
Points:    5
Milestone: Milestone 1 (Jun 15)
Body:
  ## Acceptance Criteria
  - New article with severity > 7.5 triggers CRITICAL alert within 5 minutes of scoring
  - SendGrid email delivered to configured recipients
  - Alert stored in `alerts` table with delivery status
  - In-app WebSocket push received by connected clients
  - Alert shows correctly in AlertsPage frontend

ISSUE #032
Title:     [ML] LLM-powered AI report generation with Celery task
Labels:    ml-model, backend-api, milestone-1
Phase:     Phase 4
Week:      Week 4
Priority:  🟡 High
Points:    5
Milestone: Milestone 1 (Jun 15)
```

---

### Phase 5 Issues

```
ISSUE #033
Title:     [MOBILE] Expo project setup with navigation and MTN design system
Labels:    mobile, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🔴 Critical
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #034
Title:     [MOBILE] Biometric authentication (Face ID / Fingerprint)
Labels:    mobile, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🟡 High
Points:    3
Milestone: Final Delivery (Jun 29)

ISSUE #035
Title:     [MOBILE] Core screens — Dashboard, News Feed, Alerts, Reports
Labels:    mobile, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🔴 Critical
Points:    8
Milestone: Final Delivery (Jun 29)

ISSUE #036
Title:     [MOBILE] Firebase FCM push notifications — Watch/Warning/Critical delivery
Labels:    mobile, alerts, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🔴 Critical
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #037
Title:     [MOBILE] Offline mode — AsyncStorage cache + PWA service worker
Labels:    mobile, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🟡 High
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #038
Title:     [MOBILE] Mobile risk radar map view with bottom sheet
Labels:    mobile, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🟡 High
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #039
Title:     [MOBILE] EAS Build — iOS TestFlight + Android Play Store beta submission
Labels:    mobile, deployment, final-delivery
Phase:     Phase 5
Week:      Week 5
Priority:  🔴 Critical
Points:    3
Milestone: Final Delivery (Jun 29)
```

---

### Phase 6 Issues

```
ISSUE #040
Title:     [TESTING] Pytest backend test suite — coverage > 80%
Labels:    testing, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🔴 Critical
Points:    8
Milestone: Final Delivery (Jun 29)

ISSUE #041
Title:     [TESTING] Cypress E2E test suite — 5 critical user flows
Labels:    testing, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🔴 Critical
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #042
Title:     [TESTING] Locust load test — 1,000 concurrent users, p95 < 500ms
Labels:    testing, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🟡 High
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #043
Title:     [ML] LSTM and BERT model back-testing on 12 months historical data
Labels:    ml-model, testing, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🟡 High
Points:    3
Milestone: Final Delivery (Jun 29)

ISSUE #044
Title:     [DOCS] API reference, deployment runbook, and operator user guide
Labels:    documentation, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🟡 High
Points:    5
Milestone: Final Delivery (Jun 29)

ISSUE #045
Title:     [DEPLOY] AWS production deployment — EC2, RDS, ElastiCache, CloudFront, SSL
Labels:    deployment, infrastructure, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🔴 Critical
Points:    8
Milestone: Final Delivery (Jun 29)
Body:
  ## Acceptance Criteria
  - All services running on AWS in production
  - HTTPS enforced (HTTP → HTTPS redirect)
  - SSL certificate from Let's Encrypt with auto-renewal
  - CloudWatch alarms configured
  - Daily RDS snapshots confirmed
  - All smoke tests pass on production URL

ISSUE #046
Title:     [DEPLOY] Final presentation prep — demo script, executive summary, backup video
Labels:    documentation, deployment, final-delivery
Phase:     Phase 6
Week:      Week 6
Priority:  🟡 High
Points:    3
Milestone: Final Delivery (Jun 29)
```

---

## Milestone Checklist

```
□  Phase 1 Done (May 24)
   └─ Architecture doc committed + reviewed by MTN stakeholder
   └─ DB schema migrations run clean
   └─ FastAPI + JWT auth working in Docker
   └─ CI/CD pipeline green on first push

□  Phase 2 Done (May 31)
   └─ All 15+ source spiders running
   └─ 500+ articles/day confirmed in PostgreSQL over 24-hour run
   └─ Zero duplicate articles (deduplication verified)
   └─ Celery Beat running every 15 minutes
   └─ Social media pipeline live (Twitter + Reddit)

□  Phase 3 Done (Jun 7)
   └─ BERT classifier trained: weighted F1 > 0.85 on test set
   └─ NER pipeline processing articles in < 200ms
   └─ LSTM producing 7-day and 30-day forecasts
   └─ Full NLP pipeline: article to scored risk record in < 2 minutes
   └─ Anomaly detection live and tested
   └─ Model evaluation reports committed to docs

□  ⭐ MILESTONE 1 (Jun 15) — Web App v1.0
   └─ React dashboard publicly accessible at production URL
   └─ All 5 dashboard pages rendering with live data
   └─ CRITICAL alerts triggering email + in-app push
   └─ AI narrative reports generating daily
   └─ MTN stakeholder has reviewed and accepted dashboard

□  Phase 5 Done (Jun 21)
   └─ iOS app on TestFlight
   └─ Android app on Google Play internal beta
   └─ Biometric login working on physical devices
   └─ Push notifications received on locked devices within 30s
   └─ Offline mode showing cached data correctly

□  ⭐ FINAL DELIVERY (Jun 29) — Project Complete
   └─ Full platform live on AWS
   └─ Pytest coverage > 80%
   └─ All Cypress E2E tests passing
   └─ Load test: p95 < 500ms at 1,000 concurrent users
   └─ BERT back-test: F1 still > 0.85 on 100 new articles
   └─ LSTM back-test: MAPE < 10% on 12-month historical data
   └─ All 5 documentation artifacts committed
   └─ Final presentation delivered to MTN stakeholders
   └─ Executive summary report distributed
```

---

## Risk Register

```
┌──────────────────────────────────┬──────────┬──────────┬──────────────────────────────────────┐
│ Risk                             │Likelihood│  Impact  │ Mitigation                           │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ BERT training data insufficient  │ Medium   │ CRITICAL │ Start labeling articles on Day 1 of  │
│ (< 500 labeled examples)         │          │          │ Week 1 using scraped real MTN news;  │
│                                  │          │          │ use data augmentation if needed       │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Scraper blocked by source        │ High     │ HIGH     │ Implement per-domain rate limits;    │
│ (IP ban, CAPTCHA, robots.txt)    │          │          │ rotate User-Agents; use proxy for    │
│                                  │          │          │ WSJ/Bloomberg; document blocked sites │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Twitter/X API access suspended   │ Medium   │ HIGH     │ Build Reddit + LinkedIn as fallbacks; │
│ or rate-limited severely         │          │          │ social media is enhancement, not core │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ LSTM forecast accuracy too low   │ Medium   │ MEDIUM   │ Fall back to ARIMA for simple trend  │
│ (MAPE > 15%)                     │          │          │ if LSTM underperforms; disclose       │
│                                  │          │          │ confidence limits in the UI           │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ AWS costs exceed budget during   │ Low      │ MEDIUM   │ Use t3.medium during dev; set         │
│ development                      │          │          │ CloudWatch billing alarm at $200/month │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ WebSocket performance degrades   │ Medium   │ HIGH     │ Redis Pub/Sub as broadcast layer;    │
│ at 50+ concurrent connections    │          │          │ load test in Week 6; horizontal scale │
│                                  │          │          │ with multiple API instances if needed  │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Mapbox token exposed in frontend │ Medium   │ MEDIUM   │ Use Mapbox token restrictions (URL   │
│ bundle (key theft)               │          │          │ restriction to production domain only) │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Mobile builds fail on EAS        │ Medium   │ HIGH     │ Test EAS build in Week 5 Day 1, not  │
│ (native dependencies, signing)   │          │          │ Day 5; reserve 2 days for build fixes │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ LLM API costs spike              │ Low      │ MEDIUM   │ Cache report outputs; generate once  │
│ (report generation at scale)     │          │          │ daily at 07:00 UTC; set monthly cap  │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Scope creep in Week 4 (UI polish │ Very High│ HIGH     │ Freeze feature list after Week 3;   │
│ delays core feature delivery)    │          │          │ ship functional over beautiful;      │
│                                  │          │          │ design system handles visual quality  │
├──────────────────────────────────┼──────────┼──────────┼──────────────────────────────────────┤
│ Data pipeline latency > 15 min   │ Low      │ CRITICAL │ Monitor p95 latency via Prometheus;  │
│ (breaks core value proposition)  │          │          │ index DB on scored_at; Redis cache    │
│                                  │          │          │ for hot articles; Celery concurrency  │
└──────────────────────────────────┴──────────┴──────────┴──────────────────────────────────────┘
```

---

## Definition of Done

A phase is **Done** when ALL of the following are true:

1. **All tasks in the phase checklist are checked off** — no partial completions counted
2. **Code is merged to `develop` branch via PR** — at minimum, Tech Lead has reviewed
3. **CI/CD pipeline passes** — all linting, unit tests, and integration tests green
4. **The milestone deliverable works end-to-end** — tested manually, not just unit tested
5. **No known data loss bugs or silent failures** — pipeline errors are surfaced and logged
6. **Latency target maintained** — article to alert delivered in < 15 minutes, confirmed with stopwatch test
7. **API endpoints return correct HTTP status codes** — no 500s in happy-path flows
8. **Documentation updated** — `CHANGELOG.md` entry added; `docs/` updated if architecture changed
9. **MTN stakeholder touchpoint completed** — at Phase 1, 3, and 4 (Milestone 1): demo or async review

---

## Final Advice

**The pipeline is everything.**
The dashboard is what stakeholders see. The pipeline is what makes it true. An empty or stale dashboard destroys trust in 30 seconds. Invest disproportionately in pipeline reliability during Weeks 1–2.

**Don't train until you have real data.**
Start the scrapers before you write a single line of model code. Train the BERT classifier on real MTN news, not synthetic examples. The difference in model quality is not small.

**Alert fatigue is a product killer.**
If every article triggers a CRITICAL alert, stakeholders will disable notifications within a week. Tune the thresholds carefully in Week 3 with the MTN business liaison. A well-tuned WATCH/WARNING/CRITICAL system is a competitive advantage.

**Build something you would be proud to show the MTN Ghana Board.**
That is your north star.

---

*MTN QuantRisk Intelligence Platform — Development Roadmap v1.0*
*Project Duration: 6 Weeks | May 18 – Jun 29, 2026*
*Confidential · MTN Ghana · 2026 · AI-Powered Risk Intelligence*
