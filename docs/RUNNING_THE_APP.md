# MTN QuantRisk — Installation and Local Runbook

This guide explains how to install and run the complete dashboard locally. The main application has two required processes:

1. The FastAPI backend on `http://127.0.0.1:8001`
2. The Next.js frontend on `http://127.0.0.1:3000`

The mobile Expo application is optional.

## 1. Required software

Install these tools before cloning the project:

| Software | Recommended version | Check command |
|---|---:|---|
| Git | Current stable | `git --version` |
| Python | 3.12 or 3.13, 64-bit | `python --version` |
| Node.js | 22 LTS or newer | `node --version` |
| npm | Installed with Node.js | `npm.cmd --version` |
| Conda | Optional | `conda --version` |
| Docker Desktop | Optional | `docker --version` |

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by the PowerShell execution policy.

## 2. Clone and select the project branch

```powershell
git clone https://github.com/adoumouangnamouemmanuel/mtn_quantrisk.git
Set-Location .\mtn_quantrisk
git fetch --all --prune
git branch -a
git switch Foureiratou
git pull --ff-only origin Foureiratou
```

If the work has already been merged, use the repository's default branch instead:

```powershell
git switch main
git pull --ff-only origin main
```

All remaining commands assume the terminal is in the repository root (`mtn_quantrisk`).

## 3. Install the backend

### Recommended Windows setup with `venv`

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r .\backend\requirements.txt
python -m pip install -r .\requirements.txt
python -m spacy download en_core_web_sm
```

If PowerShell blocks activation, the environment can be used without activating it:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
.\.venv\Scripts\python.exe -m spacy download en_core_web_sm
```

### Alternative setup with Conda

```powershell
conda create --prefix .conda python=3.12 -y
conda activate .\.conda
python -m pip install --upgrade pip
python -m pip install -r .\backend\requirements.txt
python -m pip install -r .\requirements.txt
python -m spacy download en_core_web_sm
```

The root `requirements.txt` contains the optional PDF-processing and test dependencies. The backend can start with `backend/requirements.txt`, but install both files for every feature.

## 4. Configure the backend

The backend works without paid API tokens. Set variables in the same terminal before starting it.

```powershell
$env:SCRAPE_INTERVAL_MINUTES = "15"
$env:DB_PATH = "$PWD\backend\quantrisk_news.db"
```

Optional integrations:

```powershell
$env:HF_TOKEN = "your-hugging-face-token"
$env:GNEWS_TOKEN = "your-gnews-token"
$env:ANTHROPIC_API_KEY = "your-anthropic-key"
```

| Variable | Required | Purpose |
|---|---|---|
| `SCRAPE_INTERVAL_MINUTES` | No | RSS scraping interval; defaults to 15 minutes |
| `DB_PATH` | No | Local SQLite file; defaults to `backend/quantrisk_news.db` |
| `DATABASE_URL` | No | PostgreSQL connection URL; takes precedence over SQLite |
| `SUPABASE_DB_URL` | No | Alternative name for the PostgreSQL connection URL |
| `HF_TOKEN` | No | Hugging Face sentiment and briefing models |
| `GNEWS_TOKEN` | No | Additional GNews results |
| `ANTHROPIC_API_KEY` | No | LLM-assisted PDF extraction |

For local development, SQLite is the simplest option. To use Supabase Postgres, provide a complete SQLAlchemy-compatible database URL through `DATABASE_URL` or `SUPABASE_DB_URL`. Never commit the database password, Supabase secret key, or `service_role` key.

## 5. Start the backend

Open terminal 1 in the repository root:

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

Without environment activation:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

Conda users can run:

```powershell
conda activate .\.conda
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

Keep this terminal open. Confirm the API is running:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/
Invoke-RestMethod http://127.0.0.1:8001/api/health | ConvertTo-Json -Depth 8
```

Useful backend URLs:

- API root: `http://127.0.0.1:8001/`
- Swagger documentation: `http://127.0.0.1:8001/docs`
- Health status: `http://127.0.0.1:8001/api/health`

The scheduler performs one scrape shortly after startup and then runs every 15 minutes. The process must remain running, and the machine must have outbound internet access to the RSS sites.

## 6. Install and configure the frontend

Open terminal 2:

```powershell
Set-Location .\frontend
npm.cmd ci
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
```

Edit `frontend/.env.local` and provide these values:

```dotenv
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=mtn.com
```

Important rules:

- `NEXT_PUBLIC_API_BASE` must use port `8001`.
- Use a Supabase publishable key (or legacy anon key) in the frontend.
- Never place a Supabase secret key or `service_role` key in a `NEXT_PUBLIC_*` variable.
- The default login policy accepts `@mtn.com` addresses. Change `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` only if the intended users use another domain.
- Restart Next.js after editing `.env.local`.

The Supabase URL and publishable key are available in the Supabase project dashboard under the API/project settings. Create permitted users under Supabase Authentication, or enable the required sign-up/invitation flow for the project.

## 7. Start the frontend

From `mtn_quantrisk/frontend`:

```powershell
npm.cmd run dev -- -p 3000
```

Keep terminal 2 open, then visit:

- Login: `http://127.0.0.1:3000/login`
- Dashboard: `http://127.0.0.1:3000/dashboard`

Sign in with a Supabase Authentication user whose email matches the configured allowed domain.

## 8. First-run verification

Run these commands in a third PowerShell terminal:

```powershell
Invoke-WebRequest http://127.0.0.1:3000/login -UseBasicParsing |
    Select-Object StatusCode

Invoke-RestMethod http://127.0.0.1:8001/

Invoke-RestMethod http://127.0.0.1:8001/api/kpis |
    Select-Object -First 1

Invoke-RestMethod http://127.0.0.1:8001/api/health |
    ConvertTo-Json -Depth 8
```

Expected results:

- Frontend returns HTTP `200`.
- API root returns `status: ok`.
- `/api/kpis` returns KPI records.
- Health shows the scheduler as `Scheduled` with an `interval[0:15:00]` schedule.

The overall health can show `Degraded` when external RSS sites are unavailable even if the API, CSV data, and ML artifacts are healthy. Inspect `externalFeeds.sources` in the health response to find network, DNS, or publisher-specific failures.

To manually request a scrape:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8001/api/news/scrape
```

## 9. Seed demo news (optional)

If the local news database is empty and demo records are desired, run this from the repository root while the Python environment is active:

```powershell
python .\scripts\seed_demo.py
```

Do not run the seed script against a production database unless demo data is intentionally required.

## 10. Run quality checks

Backend tests, from the repository root:

```powershell
.\.venv\Scripts\python.exe -m pytest .\tests -q
```

Frontend checks, from `frontend`:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

## 11. Optional mobile application

The Expo mobile application is not required for the web dashboard.

```powershell
Set-Location .\mobile
npm.cmd ci
npx.cmd expo start
```

Install Expo Go on a phone and scan the QR code, or press `w` in the Expo terminal to use its web target. A physical phone cannot reach `127.0.0.1` on the development computer; configure the mobile API URL to use the computer's LAN IP address, such as `http://192.168.1.20:8001`, and allow the port through the local firewall.

## 12. Docker option

Docker Desktop users can build the two services with:

```powershell
Set-Location .\infrastructure
docker compose up --build
```

Stop them with:

```powershell
docker compose down
```

The current Compose configuration supplies the backend API address but does not supply the Supabase frontend build variables. Therefore, the two-terminal local method above is recommended when testing real login. Add the public Supabase build arguments to the frontend image configuration before expecting Supabase Auth to work in a Docker-built frontend.

## 13. How to stop the local app

Press `Ctrl+C` once in the frontend terminal and once in the backend terminal. This cleanly stops Next.js, Uvicorn, and the backend scheduler.

## 14. Common problems

### The page is blank or stays on loading cards

1. Confirm the backend terminal is still running.
2. Open `http://127.0.0.1:8001/api/health`.
3. Confirm `.env.local` uses `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001`.
4. Restart the frontend after changing `.env.local`.
5. Check the browser console and both terminal logs.

### Login says authentication is incomplete

`NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is missing or still contains a placeholder. Correct `frontend/.env.local` and restart the frontend.

### Login rejects the email address

The address must match `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` (default `mtn.com`) and the user must exist/be permitted in Supabase Auth.

### `npm.ps1` cannot be loaded

Use the Windows command shim:

```powershell
npm.cmd ci
npm.cmd run dev
```

### Port 3000 or 8001 is already in use

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,8001 |
    Select-Object LocalPort,OwningProcess

Get-Process -Id YOUR_PROCESS_ID
```

Stop the existing application cleanly from its terminal. Only use `Stop-Process` after confirming that the PID belongs to an obsolete QuantRisk process.

### Scrape completes with zero articles

Check the detailed feed status:

```powershell
$healthResult = Invoke-RestMethod http://127.0.0.1:8001/api/health
$healthResult.externalFeeds.sources |
    Select-Object name,status,entryCount,error |
    Format-Table -AutoSize
```

Typical causes are blocked outbound HTTPS, DNS failure, publisher downtime, malformed RSS, firewall/proxy rules, or all fetched URLs already existing in the database. `newArticleCount: 0` is not automatically a scheduler failure; check `lastAttemptAt`, `lastCompletedAt`, source statuses, and `fetchedCount` together.

### Google fonts fail during development

Next.js falls back to local/system fonts when Google Fonts cannot be reached. This does not stop the application, but outbound access to `fonts.googleapis.com` is needed to download those fonts during development or build.
