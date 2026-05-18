# MTN QuantRisk Intelligence Platform

**An AI-powered risk intelligence platform that delivers actionable insights and real-time alerts for MTN's operational and market risks.**

---

## 🎯 Overview

MTN QuantRisk is a full-stack platform that automatically monitors, analyzes, and scores risk events across MTN's business landscape. By combining web scraping, NLP, and machine learning, the platform detects emerging risks in real-time and delivers board-ready alerts within 15 minutes of publication.

**Key Promise:** Risk intelligence that's faster, smarter, and more reliable than manual monitoring.

---

## ✨ Key Features

- **Real-Time Risk Monitoring** - Automated scraping of news, social media, and regulatory sources
- **AI-Powered Risk Scoring** - BERT-based NLP and ML models to classify and quantify risk
- **Intelligent Dashboards** - Web and mobile apps for risk visualization and decision-making
- **Sub-15-Minute Latency** - Architectural focus on speed and reliability for time-critical alerts
- **Multi-Platform** - Desktop (web), mobile (iOS/Android), and PWA support
- **Production-Ready** - Built with monitoring, error handling, and scalability from day one

---

## 🛠️ Tech Stack

### Backend

- **Framework:** FastAPI (Python)
- **Task Queue:** Celery with Redis
- **Database:** PostgreSQL
- **Cache:** Redis
- **NLP/ML:** BERT classifier, spaCy NER, LSTM forecaster
- **Email:** SendGrid for alerts
- **Real-Time:** WebSocket for live updates

### Frontend

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** D3/Recharts
- **Real-Time:** WebSocket client

### Mobile

- **Framework:** React Native (Expo)
- **Platforms:** iOS, Android, Web
- **Navigation:** Expo Router
- **Authentication:** Biometric support
- **Offline:** PWA service worker + local cache

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **Deployment:** Cloud-ready architecture

---

## 📁 Project Structure

```
mtn_quantrisk/
├── backend/                    # FastAPI backend + ML pipeline
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   ├── ml/                # Machine learning models
│   │   ├── models/            # Data models (SQLAlchemy)
│   │   ├── nlp/               # NLP processing (BERT, spaCy)
│   │   ├── scrapers/          # Web scrapers
│   │   └── tasks/             # Celery async tasks
│   ├── tests/
│   └── requirements.txt
│
├── frontend/                   # Next.js web dashboard
│   ├── app/                   # React components & pages
│   ├── public/                # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     # React Native mobile app
│   ├── src/
│   │   ├── app/               # App layout & screens
│   │   └── components/        # Reusable UI components
│   ├── assets/                # Images, icons
│   └── package.json
│
├── infrastructure/            # Docker setup
│   └── docker-compose.yml
│
├── docs/                      # Documentation
│   └── MTN_QuantRisk_Roadmap.md
│
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm/yarn
- Docker & Docker Compose
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m app.main
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Mobile Setup

```bash
cd mobile
npm install
npm start
# Choose platform: Android, iOS, or Web
```

### Docker Setup (Recommended)

```bash
docker-compose up -d
# Services available at http://localhost:3000 (frontend), :8000 (backend)
```

---

## 🏗️ Architecture Highlights

### Data Pipeline

1. **Scrapers** collect articles from news sources and regulatory feeds
2. **NLP Models** process text and extract risk signals
3. **ML Models** score risk events with severity and category
4. **Redis Queue** manages async processing with sub-minute latency
5. **WebSocket** pushes real-time alerts to frontend & mobile

### Risk Scoring

- **Input:** Raw article text
- **Processing:** BERT classifier + spaCy NER + LSTM forecaster
- **Output:** Risk score (0-100), category, confidence, alert threshold
- **SLA:** Score delivered within 15 minutes of article publication

### Authentication & Security

- JWT-based API authentication
- Biometric support on mobile
- HTTPS/WSS encrypted communication
- Rate limiting & DDoS protection

---

## 📖 Development Workflow

### Running Tests

```bash
cd backend
pytest tests/

cd frontend
npm run lint
npm test

cd mobile
npm run lint
```

### Building for Production

```bash
# Backend
cd backend
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# Frontend
cd frontend
npm run build
npm run start

# Mobile
cd mobile
npm run build
npm install -g eas-cli
eas build --platform all
```

---

## 🔄 Development Phases

The project follows a **6-week agile sprint** structure:

| Phase | Focus                        | Duration           |
| ----- | ---------------------------- | ------------------ |
| **1** | Foundation & Architecture    | Week 1 (May 18–24) |
| **2** | Web Scrapers & Data Pipeline | Week 2 (May 25–31) |
| **3** | NLP & ML Risk Models         | Week 3 (Jun 1–7)   |
| **4** | Web App Dashboard            | Week 4 (Jun 8–14)  |
| **5** | Mobile App & PWA             | Week 5 (Jun 15–21) |
| **6** | Testing, Docs & Deployment   | Week 6 (Jun 22–29) |

See [MTN_QuantRisk_Roadmap.md](docs/MTN_QuantRisk_Roadmap.md) for detailed phase breakdown and milestone tracking.

---

## 📝 Key Design Principles

1. **Ship Vertically** - Each phase delivers a complete, working slice of the system
2. **Data Pipeline First** - Scrapers and data flow are the heartbeat of the platform
3. **Real Data Over Mocks** - Use live MTN news from day one
4. **ML Serves Product** - Practical models over over-engineered AI
5. **Latency Obsession** - Every decision evaluated against the 15-minute promise

---

## 🤝 Contributing

We follow strict **Definition of Done** standards. All contributions must:

- Include unit tests (>80% coverage)
- Pass linting and type checks
- Be documented with clear commit messages
- Work with the full data pipeline
- Not degrade latency metrics

See the [Roadmap](docs/MTN_QuantRisk_Roadmap.md) for the full development guide and GitHub Issues registry.

---

## 📞 Support & Documentation

- **Architecture Deep-Dive:** See [MTN_QuantRisk_Roadmap.md](docs/MTN_QuantRisk_Roadmap.md)
- **API Docs:** Available at `/docs` endpoint (Swagger UI)
- **ML Models:** See `backend/app/ml/` for model details
- **Component Library:** See `frontend/app/` and `mobile/src/components/`

---

## 📄 License

[See LICENSE file](LICENSE)

---

## 👥 Team

| Role                      | Members                                                                                                                               | Responsibilities                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Tech Lead / Architect** | Emmanuel Adoum [@adoumouangnamouemmanuel](https://github.com/adoumouangnamouemmanuel)                                                 | System design, DevOps, backend API, ML pipeline orchestration, code reviews                 |
| **ML / NLP Engineer**     | Nana Daasebre [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi)<br>Foureiratou ZAKARI [@Furairah3](https://github.com/Furairah3) | BERT classifier, spaCy NER, LSTM forecaster, model training & evaluation, anomaly detection |
| **Backend Engineer**      | Chidima Praise [@ChidimaUgwu](https://github.com/ChidimaUgwu)<br>Emmanuel Adoum                                                       | FastAPI, Celery, PostgreSQL, Redis, scraper workers, WebSocket, SendGrid integration        |
| **Frontend Engineer**     | Nana Daasebre [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi)<br>Foureiratou ZAKARI [@Furairah3](https://github.com/Furairah3) | React 18 dashboard, D3/Recharts, TypeScript, TailwindCSS, WebSocket client, alert UI        |
| **Mobile Engineer**       | Nana Daasebre [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi)<br>Chidima Praise [@ChidimaUgwu](https://github.com/ChidimaUgwu) | React Native, Expo, Firebase FCM, biometric auth, PWA service worker, offline cache         |
| **MTN Business Liaison**  | Boaz Owiredu [MTN Ghana]                                                                                                              | Business requirements, dashboard reviews, risk category sign-off, stakeholder alignment     |

---

**Last Updated:** May 18, 2026  
**Status:** In Active Development (Phase 1)
