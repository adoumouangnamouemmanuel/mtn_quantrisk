import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_COOKIE, USER_COOKIE } from '@/lib/auth';

function relativeRedirect(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}

function loginRedirect(error: string) {
  return relativeRedirect(`/login?error=${encodeURIComponent(error)}`);
}

export async function POST(request: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN?.trim();

  if (!email || !password) {
    return loginRedirect('missing');
  }
  if (allowedDomain && !email.endsWith(`@${allowedDomain.toLowerCase()}`)) {
    return loginRedirect('domain');
  }

  // Call the backend JWT login endpoint
  let res: Response;
  try {
    res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    return loginRedirect('configuration');
  }

  if (!res.ok) {
    console.warn('[auth-login] Sign-in rejected', { status: res.status });
    return loginRedirect('credentials');
  }

  const data = await res.json();
  const token = data.access_token;
  const user = data.user;

  if (!token || !user) {
    return loginRedirect('credentials');
  }

  // NOTE: cookies are intentionally NOT httpOnly because the client-side API
  // layer (frontend/lib/api.ts) reads the token from document.cookie to attach
  // it as an Authorization: Bearer header to backend requests.
  const response = relativeRedirect('/dashboard');
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.expires_in ?? 28800,
  });
  response.cookies.set(
    USER_COOKIE,
    encodeURIComponent(JSON.stringify(user)),
    {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: data.expires_in ?? 28800,
    }
  );

  return response;
}