# MTN QuantRisk — Deployment Guide

## Option A — Run Locally with Docker (recommended for demo)

The safest approach for a live demo. Everything runs on your laptop.

```bash
# From the project root
cd infrastructure
docker compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs:   http://localhost:8001/docs

Seed the demo DB before presenting:
```bash
# In a new terminal, from project root
python scripts/seed_demo.py
```

---

## Option B — Deploy to Render (free cloud hosting)

Render has a free tier that supports Docker. Takes ~10 minutes to set up.

### Steps

1. Make sure the code is pushed to GitHub:
   ```bash
   git push origin Foureiratou
   ```

2. Go to https://dashboard.render.com and sign up (free)

3. Click **New** → **Blueprint**

4. Connect your GitHub account and select the `mtn_quantrisk` repo

5. Render will find `infrastructure/render.yaml` automatically

6. In the environment variables section, set (optional but improves quality):
   - `HF_TOKEN` — free from https://huggingface.co/settings/tokens
   - `GNEWS_TOKEN` — free from https://gnews.io (100 req/day)

7. Click **Apply** — Render will build and deploy both services

8. Your URLs will be:
   - Frontend: `https://quantrisk-frontend.onrender.com`
   - Backend:  `https://quantrisk-backend.onrender.com`

> **Note:** Free tier spins down after 15 minutes of inactivity.
> First request after sleep takes ~30 seconds to wake up.
> For a live demo, open the URL 2 minutes before presenting.

---

## Option C — Deploy to Railway (alternative free cloud)

Railway has a $5/month free credit — enough for a demo.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# From project root, deploy backend
cd backend
railway init        # name it "quantrisk-backend"
railway up

# Deploy frontend
cd ../frontend
railway init        # name it "quantrisk-frontend"
railway up
```

Set environment variables in the Railway dashboard:
- `DB_PATH=/data/quantrisk_news.db`
- `HF_TOKEN=<your-token>`
- `GNEWS_TOKEN=<your-token>`

---

## Pre-Demo Checklist

Run this the night before or morning of the presentation:

```
[ ] Backend running (local or cloud)
[ ] Frontend running and reachable
[ ] python scripts/seed_demo.py  → confirm 9+ active alerts
[ ] Open /alerts → at least 1 Critical alert visible
[ ] Open /news   → articles showing with risk scores
[ ] Open /economics → Ghana macro data loaded (not "unavailable")
[ ] Open /dashboard → Live Intelligence strip shows non-zero counts
[ ] Stress tester: run Scenario S01 → SHAP chart appears
[ ] Monte Carlo: run 1000 sims → distribution bars render
[ ] Reverse stress: set EBITDA target → binary search converges
[ ] Mobile: Expo Go QR scanned → HomeScreen loads KPIs
```

## Environment Variables Reference

| Variable | Required | Where to get | Effect |
|---|---|---|---|
| `DB_PATH` | Yes | Set automatically | SQLite file location |
| `HF_TOKEN` | Optional | huggingface.co/settings/tokens (free) | FinBERT sentiment + zero-shot classification |
| `GNEWS_TOKEN` | Optional | gnews.io (free, 100 req/day) | Targeted "MTN Ghana" news search |
| `CORS_ORIGINS` | Production only | Set to your frontend URL | Allow frontend to call backend |
