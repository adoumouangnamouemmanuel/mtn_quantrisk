import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return loginRedirect('configuration');
  }

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

  const response = relativeRedirect('/dashboard');
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.warn('[auth-login] Sign-in rejected', {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return loginRedirect('credentials');
  }

  return response;
}
