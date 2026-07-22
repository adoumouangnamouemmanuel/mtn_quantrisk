# MTN QuantRisk Authentication Setup

MTN QuantRisk uses Supabase email/password authentication with cookie-based server-side sessions. Application pages fail closed: if Supabase is not configured or the visitor has no valid session, the application redirects to `/login`.

## 1. Select or create a Supabase project

Use a dedicated Supabase project for MTN QuantRisk. Do not reuse an unrelated production project's authentication tenant.

In the Supabase dashboard, open the project and use the **Connect** dialog to obtain:

- Project URL
- Publishable key beginning with `sb_publishable_`

Never place a secret key or `service_role` key in a `NEXT_PUBLIC_` environment variable.

## 2. Configure the frontend

Copy `frontend/.env.example` to `frontend/.env.local` and replace the placeholders:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=mtn.com
```

Restart the Next.js server after changing environment variables. Next.js embeds `NEXT_PUBLIC_` values during startup/build.

## 3. Configure email authentication

In Supabase Dashboard:

1. Open **Authentication > Sign In / Providers**.
2. Enable the Email provider.
3. Decide whether email confirmation is required. For administrator-created enterprise accounts, keeping confirmation enabled is recommended.
4. Open **Authentication > URL Configuration**.
5. Set the local Site URL to the frontend origin, such as `http://127.0.0.1:3001` during local development.
6. Add the production HTTPS origin when deployed.

Self-service registration is intentionally not exposed in the QuantRisk UI. An administrator controls who receives an account.

## 4. Create the first user

In **Authentication > Users**, select **Add user** and create an approved MTN account, for example:

```text
Email: analyst@mtn.com
Password: use a unique strong password
Auto Confirm User: enable only if the administrator has verified the address
```

The email must match `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN`. The default is `mtn.com`.

## 5. Verify

1. Visit `/dashboard` in a private browser window. It must redirect to `/login`.
2. Enter an incorrect password. The page must remain on `/login` and show an error.
3. Enter the real Supabase user's credentials. It must open `/dashboard`.
4. Open the profile menu and confirm the real email is shown.
5. Select **Sign Out**. Returning to `/dashboard` must redirect to `/login`.

## Security behavior

- `frontend/proxy.ts` refreshes auth cookies and validates signed JWT claims.
- `frontend/app/(app)/layout.tsx` calls `auth.getUser()` before rendering protected pages.
- Unauthenticated users cannot render application routes.
- Missing configuration never produces a fake successful login.
- Session-refresh cache headers are forwarded to prevent a CDN from caching and leaking an authenticated response.
- Only publishable/legacy anonymous keys are accepted by the frontend helpers; no service-role key is used.

## Current scope

This implementation authenticates access to the Next.js web application. The FastAPI API remains a separately addressable service. Before exposing the backend directly to the internet, add JWT verification to FastAPI or place it behind a trusted authenticated gateway.
