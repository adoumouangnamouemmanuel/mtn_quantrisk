# MTN QuantRisk — JWT Authentication Setup

MTN QuantRisk uses **local JWT authentication** with cookie-based server-side sessions. Application pages fail closed: if the backend is not reachable or the visitor has no valid session, the application redirects to `/login`.

---

## 1. Backend Configuration

The backend issues and validates JWT access tokens (HS256). Configure via environment variables:

```dotenv
# Backend (.env or environment)
JWT_SECRET=change-me-to-a-long-random-string
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480   # 8 hours
AUTH_EMAIL=analyst@mtn.com            # default analyst account
AUTH_PASSWORD=Pass.word.123           # default analyst password
```

> **Security note:** In production, set `JWT_SECRET` to a long random value (e.g. `openssl rand -hex 32`) and never commit it.

## 2. Frontend Configuration

```dotenv
# frontend/.env.local
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=mtn.com
```

- `NEXT_PUBLIC_API_BASE` must point to the running backend.
- `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` restricts which email domains may sign in (default `mtn.com`).

## 3. How It Works

1. The login form POSTs email/password to `/auth/login`.
2. The Next.js route handler forwards the credentials to `POST /api/auth/login` on the backend.
3. The backend validates the credentials and returns a signed JWT access token.
4. The frontend stores the token in an **httpOnly cookie** (`mtn_qr_token`) and the user profile in `mtn_qr_user`.
5. `frontend/proxy.ts` checks the cookie on every request and redirects unauthenticated visitors to `/login`.
6. All `/api/*` backend endpoints require the `Authorization: Bearer <token>` header. The frontend API client attaches it automatically.

## 4. Default Account

| Field    | Value            |
|----------|------------------|
| Email    | `analyst@mtn.com` |
| Password | `Pass.word.123`   |

## 5. Testing

1. Start the backend (`uvicorn app.main:app --reload --port 8000`).
2. Start the frontend (`npm run dev`).
3. Visit `/login` and enter an incorrect password. The page must remain on `/login` and show an error.
4. Enter the real credentials (`analyst@mtn.com` / `Pass.word.123`). It must open `/dashboard`.
5. Open the profile menu and confirm the email is shown.

## 6. Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Login redirects to `/login?error=configuration` | Backend is not running or `NEXT_PUBLIC_API_BASE` is wrong. |
| Login redirects to `/login?error=credentials` | Wrong email/password, or the email domain is not allowed. |
| API calls return `401` | The JWT token is missing or expired. Sign out and sign in again. |
| API calls return `403` | The token is valid but the user role lacks permission. |