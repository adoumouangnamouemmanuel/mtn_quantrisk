# MTN QuantRisk Intelligence Platform – System Architecture

**Version:** 1.0  
**Status:** Approved by Tech Lead  
**Date:** 2026-05-20  
**Owner:** MTN QuantRisk Engineering Team

---

## 1. Executive Summary

The MTN QuantRisk Intelligence Platform is a real‑time, AI‑driven risk detection and forecasting system. It ingests news from 15+ sources every 15 minutes, classifies risks using fine‑tuned BERT and spaCy, forecasts financial impact via LSTM + Monte Carlo, and delivers interactive dashboards (web + mobile) with sub‑15‑minute latency from publication to alert.

This document describes the overall system architecture, data flow, technology stack, database design, security model, and key non‑functional requirements.

---

## 2. High‑Level Architecture Diagram
## 2. High‑Level Architecture Diagram
┌─────────────────────────────────────────────────────────────────────────────┐
│ External Sources │
│ (Reuters, Bloomberg, JoyFM, NCA Ghana, Twitter/X, Reddit, MTN IR, etc.) │
└─────────────────────┬───────────────────────────────────┬───────────────────┘
│ │
▼ ▼
┌─────────────────────────────────┐ ┌─────────────────────────────┐
│ Scrapy Spiders (15+ active) │ │ Social API Streams │
│ Playwright for JS pages │ │ (Twitter, Reddit, LinkedIn)│
└─────────────────┬───────────────┘ └───────────────┬─────────────┘
│ │
└───────────────┬─────────────────────────┘
▼
┌─────────────────────────────┐
│ Redis (Deduplication + │
│ task queue) │
└───────────────┬─────────────┘
▼
┌─────────────────────────────┐
│ Celery Workers │
│ - Text extraction │
│ - NLP pipeline (BERT, spaCy)│
│ - Risk scoring │
│ - LSTM forecast │
└───────────────┬─────────────┘
▼
┌─────────────────────────────┐
│ PostgreSQL (articles, │
│ risk scores, users) │
└───────────────┬─────────────┘
│
┌───────────────┴─────────────┐
▼ ▼
┌─────────────────────┐ ┌─────────────────────────┐
│ FastAPI REST API │ │ WebSocket Server │
│ + JWT Auth │ │ (live push) │
└──────────┬──────────┘ └────────────┬────────────┘
│ │
┌─────────┴─────────┐ ┌─────────┴─────────┐
▼ ▼ ▼ ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ React │ │ React │ │ Mobile │ │ PWA │
│ Web App │ │ Native │ │ (iOS/ │ │ (offline │
│ (Next.js)│ │ (Expo) │ │ Android) │ │ cache) │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

---

## 3. Data Flow (End‑to‑End)

1. **Ingestion**  
   - Scrapy spiders run every 15 min (Celery beat).  
   - Social streams via Twitter/X API (filtered stream), Reddit (PRAW), LinkedIn (REST).  
   - PDFs from MTN IR, NCA Ghana – extracted via `pdfplumber`.

2. **Deduplication**  
   - Redis stores SHA‑256 hashes of article URLs for 30 days.  
   - Duplicates discarded before further processing.

3. **NLP & ML Pipeline**  
   - **spaCy NER** extracts entities: MTN mentions, amounts (GHS/USD), regulations, competitors.  
   - **Fine‑tuned BERT** classifies MTN relevance (0–100%) and one of six risk categories with confidence.  
   - **Sentiment analysis** (finance‑domain calibrated) → positive/neutral/negative.  
   - **Impact scoring** uses formula: `impact = base_impact * (severity/10) * confidence * category_multiplier`.  
   - **LSTM forecaster** (trained on 12 months of MTN news) produces 7‑day and 30‑day projections.  
   - **Monte Carlo simulation** generates min/mid/max bands for financial impact (GHS & USD).  
   - **Anomaly detection** flags unusual clustering of negative news.

4. **Persistence**  
   - PostgreSQL stores articles, risk scores, forecast results, user preferences, alert logs.  
   - Redis caches real‑time feed data for low‑latency WebSocket pushes.

5. **Alerting & Delivery**  
   - Alert tiers: **Watch** (yellow), **Warning** (orange), **Critical** (red).  
   - Triggers: email via SendGrid, in‑app push via WebSocket, mobile push via Firebase Cloud Messaging (FCM).  
   - **LLM narrative brief** automatically generated from clustered news and model outputs.

6. **Client Consumption**  
   - Web dashboard (React 18 + Next.js) – real‑time risk radar, heat maps, predictive charts, configurable alerts.  
   - Mobile app (React Native + Expo) – offline mode, biometric login, push notifications.  
   - Both clients consume same REST + WebSocket APIs.

---

## 4. Technology Stack (Detailed)

| Layer               | Technology                                                       |
|---------------------|------------------------------------------------------------------|
| **Backend**         | FastAPI (Python 3.11), Celery, Redis                            |
| **Database**        | PostgreSQL 15 (with pgvector for future vector search)          |
| **NLP/ML**          | Hugging Face Transformers (BERT‑base‑uncased fine‑tuned), spaCy (en_core_web_lg), LSTM (TensorFlow/Keras), Scikit‑learn |
| **Scraping**        | Scrapy, Playwright (for JS‑rendered pages), Requests, BeautifulSoup4 |
| **Social APIs**     | Tweepy (Twitter/X), PRAW (Reddit), LinkedIn API (restricted)    |
| **Web Frontend**    | Next.js 14, React 18, TypeScript, TailwindCSS, D3.js, Recharts, WebSocket client |
| **Mobile**          | React Native (Expo SDK 50), Expo Router, Firebase FCM, Expo LocalAuthentication |
| **DevOps**          | Docker, Docker Compose, GitHub Actions (CI/CD), AWS (EC2, RDS, ElastiCache), Nginx, Let's Encrypt |
| **Monitoring**      | Sentry (error tracking), Prometheus + Grafana (metrics), Logstash |

---

## 5. Database Overview (PostgreSQL Schema)

### Core Tables

```sql
-- Articles ingested from all sources
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    source_name VARCHAR(100),
    published_at TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    hash_sha256 VARCHAR(64) UNIQUE
);

-- Risk scores per article (one-to-many for multi‑risk articles)
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- regulatory, competitive, etc.
    severity FLOAT NOT NULL CHECK (severity >= 0 AND severity <= 10),
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    impact_ghs NUMERIC(20,2),
    impact_usd NUMERIC(20,2),
    sentiment VARCHAR(10), -- positive, neutral, negative
    alert_tier VARCHAR(20), -- watch, warning, critical
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecast results (LSTM + Monte Carlo)
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date DATE NOT NULL,
    days_ahead INT NOT NULL, -- 7 or 30
    risk_category VARCHAR(50),
    min_impact_ghs NUMERIC(20,2),
    mid_impact_ghs NUMERIC(20,2),
    max_impact_ghs NUMERIC(20,2),
    min_impact_usd NUMERIC(20,2),
    mid_impact_usd NUMERIC(20,2),
    max_impact_usd NUMERIC(20,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users and alert preferences
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    biometric_enabled BOOLEAN DEFAULT false,
    fcm_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert history
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    risk_score_id UUID REFERENCES risk_scores(id),
    tier VARCHAR(20) NOT NULL,
    delivered_via VARCHAR(50), -- email, websocket, fcm
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
Indexes:

articles(published_at, source_name)

risk_scores(article_id, category, severity)

alerts(user_id, tier, created_at)

Caching: Redis stores the most recent 500 articles (full text + scores) for real‑time feed serving.

6. Security Model
Aspect	Implementation
API Authentication	JWT (access + refresh tokens). Access token TTL = 15 min, refresh = 7 days.
Biometric Login	Mobile only: Face ID / Fingerprint via Expo LocalAuthentication. Backend stores only a secure token.
Transport Security	HTTPS (TLS 1.3) for all client–server traffic. WebSocket over WSS.
Database	Secrets (DB password, JWT secret) stored in environment variables / AWS Secrets Manager.
Input Validation	FastAPI automatic validation + additional sanitisation for scraped content.
Rate Limiting	slowapi (FastAPI) – 100 requests per minute per IP for authenticated endpoints.
Audit Logs	All alert deliveries and user login attempts logged to audit_log table.
DDoS Protection	AWS Shield + Nginx limit_req module.
7. Non‑Functional Requirements
Requirement	Target
Latency (news → alert)	≤ 15 minutes (95th percentile)
Throughput	500+ articles/day, peak 2,000/day
Concurrent users	1,000 (load tested)
Availability	99.9% (business hours)
Model accuracy	BERT F1 > 0.85, LSTM RMSE < 10% of revenue impact range
Data retention	Articles + scores: 2 years; alerts: 1 year
Backup	Daily automated snapshots of RDS + S3 for static assets
8. Deployment Architecture (AWS)
EC2 (t3.large or larger) – runs FastAPI + Celery workers + Nginx reverse proxy.

RDS PostgreSQL (db.t3.micro for dev, db.t3.medium for prod) – Multi‑AZ failover enabled.

ElastiCache for Redis (cache.t3.micro) – task broker + result backend + real‑time cache.

S3 – static assets (frontend build, model artifacts).

CloudFront – CDN for web app and PWA.

GitHub Actions – CI/CD pipeline (build, test, push to Docker Hub, deploy to EC2 via SSH).

9. Development & Testing Strategy
Unit tests: Pytest (backend, >80% coverage), Jest (frontend).

Integration tests: Testcontainers (PostgreSQL, Redis) + end‑to‑end with actual scraped feeds (sandbox).

Model back‑testing: Monthly retraining of LSTM against 12 months of historical MTN news.

Load testing: Locust / k6 – simulate 1,000 concurrent users reading WebSocket feed.

Staging environment: Mirrors production, uses same Docker images, runs on separate EC2 instance.

10. Sign‑Off
Role	Name	Signature	Date
Tech Lead / Architect	Emmanuel Adoum	(signed electronically)	2026-05-20
ML / NLP Engineer	Nana Daasebre, Foureiratou ZAKARI	(reviewed)	2026-05-20
Backend Engineer	Chidima Praise	(reviewed)	2026-05-20
MTN Business Liaison	Boaz Owiredu	(approved)	2026-05-20
11. Related Documents
ADR‑001: FastAPI over Django/Flask

ADR‑002: PostgreSQL + Redis over NoSQL

ADR‑003: BERT for classification, LSTM for forecasting

ADR‑004: React + Next.js for web, React Native for mobile

ADR‑005: Docker + GitHub Actions for CI/CD, AWS for production

Risk Taxonomy

Roadmap



---

## 📄 `docs/adr/ADR-001.md`

```markdown
# ADR-001: Backend Framework – FastAPI over Django/Flask

**Status:** Accepted  
**Date:** 2026-05-18  
**Deciders:** Emmanuel Adoum (Tech Lead), Chidima Praise (Backend Engineer)

---

## Context

MTN QuantRisk requires a high‑performance, asynchronous backend to handle:
- Real‑time WebSocket connections for live risk feed.
- Concurrent scraping and NLP processing (Celery tasks).
- Low latency API responses (<200 ms for dashboard queries).

Options considered: Django (sync, heavy), Flask (sync, light but limited async), FastAPI (async native, OpenAPI built‑in).

---

## Decision

Use **FastAPI** as the primary web framework.

---

## Rationale

1. **Asynchronous first** – Native `async/await` support for WebSocket and long‑polling.
2. **Automatic OpenAPI docs** – `/docs` endpoint saves documentation effort for 15+ API endpoints.
3. **Performance** – On par with Node.js and Go (Starlette + Uvicorn).
4. **Pydantic validation** – Reduces boilerplate for request/response models (risk scores, alerts).
5. **Type hints** – Better IDE support and runtime validation.
6. **Celery integration** – Easy to call async tasks from endpoints.

---

## Consequences

- **Positive:** Fast development, excellent documentation, high throughput.
- **Negative:** Smaller ecosystem than Django (but sufficient for our needs).  
  Requires separate admin panel (we can build a simple one or use SQLAdmin).

---

## Alternatives Considered

- **Django + Django Channels** – Overkill, synchronous ORM would block the event loop.
- **Flask + Quart** – Quart is immature, fewer extensions.
- **Node.js (Express)** – Not aligned with team’s Python/ML expertise.

---

## Compliance with Requirements

- ✅ Sub‑15‑minute latency (async scraping + WebSocket)
- ✅ Real‑time updates (WebSocket)
- ✅ JWT authentication (fastapi‑users / python‑jose)

*Decision recorded by Emmanuel Adoum*