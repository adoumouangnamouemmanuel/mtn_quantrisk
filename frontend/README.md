# Frontend — MTN QuantRisk Web Dashboard

**A real-time risk intelligence dashboard built with Next.js 16, React 19, and TypeScript.**

---

## 🎯 Overview

The web dashboard provides stakeholders with a comprehensive, real-time view of MTN's risk landscape. It displays live risk scores, trending alerts, detailed risk analytics, and enables filtering by risk category, severity, and business unit.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Charts & Visualization:** D3.js / Recharts
- **Real-Time Communication:** WebSocket client
- **Code Quality:** ESLint (Next.js config)
- **Build:** Next.js built-in compiler

---

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home dashboard
│   ├── globals.css        # Global styles
│   └── ...                # Feature pages
├── components/            # Reusable React components
│   ├── charts/            # Risk visualization components
│   ├── alerts/            # Alert display components
│   ├── filters/           # Filter UI components
│   └── ...
├── lib/                   # Utilities & helpers
│   ├── api.ts             # API client
│   ├── websocket.ts       # WebSocket connection handler
│   └── ...
├── hooks/                 # Custom React hooks
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── postcss.config.mjs
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
npm run start

# Linting
npm run lint
```

---

## 🎨 Design Features

- **Premium Visual Style** — Clean, modern UI without gradients
- **No Grid Backgrounds** — Polished, minimal aesthetic
- **Responsive Design** — Works seamlessly on desktop and tablet
- **Real-Time Updates** — WebSocket integration for live risk score updates
- **Dark/Light Mode** — Theme support based on system preferences
- **Accessibility** — WCAG 2.1 AA standards

---

## 📊 Key Features

### Risk Dashboard

- Overview of all active risks with real-time status
- Risk severity indicators (Critical, High, Medium, Low)
- Trending risk categories over time

### Detailed Risk View

- Full article context and news source
- ML confidence scores and explanation
- Historical risk trends for specific categories
- Impact assessment and mitigation suggestions

### Alerts & Notifications

- Real-time alert stream
- Filtering by severity, category, and business unit
- Alert acknowledgment and archiving
- Email/SMS delivery status tracking

### Risk Analytics

- Time-series charts of risk frequency
- Category distribution charts
- Trend analysis and forecasting
- Comparative metrics across business units

### User Management

- Role-based access control (Admin, Manager, Viewer)
- Team collaboration features
- Audit logs for risk score reviews

---

## 🔌 API Integration

The dashboard connects to the backend API at `http://localhost:8000` (configurable).

**Key Endpoints:**

- `GET /api/risks` — List all risks
- `GET /api/risks/{id}` — Risk details
- `GET /api/risks/category/{category}` — Risks by category
- `WS /ws/alerts` — WebSocket stream for real-time alerts

See `lib/api.ts` for API client implementation.

---

## 🧪 Testing

```bash
# Run tests (when test suite is ready)
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

---

## 🎯 Development Phases

| Phase | Focus                | Duration           |
| ----- | -------------------- | ------------------ |
| **4** | Web App Dashboard    | Week 4 (Jun 8–14)  |
| **6** | Testing & Refinement | Week 6 (Jun 22–29) |

---

## 👥 Team

| Role                   | Members                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Engineers** | Nana Daasebre [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi)<br>Foureiratou ZAKARI [@Furairah3](https://github.com/Furairah3) |
| **Tech Lead**          | Emmanuel Adoum [@adoumouangnamouemmanuel](https://github.com/adoumouangnamouemmanuel)                                                 |
| **Backend Support**    | Chidima Praise [@ChidimaUgwu](https://github.com/ChidimaUgwu)                                                                         |

---

## 📖 Documentation

- **Parent Project:** [MTN QuantRisk](../README.md)
- **Architecture:** [MTN_QuantRisk_Roadmap.md](../docs/MTN_QuantRisk_Roadmap.md)
- **API Docs:** Available at `http://localhost:8000/docs` (Swagger UI)

---

## 🤝 Contributing

All contributions must:

- Follow TypeScript best practices (strict mode enabled)
- Include component documentation
- Pass ESLint checks (`npm run lint`)
- Maintain responsive design
- Not degrade performance (aim for <100ms re-renders)

See the parent [README](../README.md) for Definition of Done standards.

---

**Last Updated:** May 18, 2026  
**Status:** In Development (Phase 4)
