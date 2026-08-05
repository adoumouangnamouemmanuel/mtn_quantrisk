'use server'

import { redirect } from 'next/navigation'
import { TOKEN_COOKIE, USER_COOKIE } from '@/lib/auth'
import { cookies } from 'next/headers'

export type LoginState = { error: string | null }

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter your email and password.' }
  }

  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? 'mtn.com'
  if (allowedDomain && !email.endsWith(`@${allowedDomain.toLowerCase()}`)) {
    return { error: `Please use a valid @${allowedDomain} work email.` }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8001'

  let res: Response
  try {
    res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
  } catch {
    return {
      error: 'Authentication service is unreachable. Contact an administrator.',
    }
  }

  if (!res.ok) {
    return { error: 'The email or password is incorrect.' }
  }

  const data = await res.json()
  const token = data.access_token
  const user = data.user

  if (!token || !user) {
    return { error: 'The email or password is incorrect.' }
  }

  // NOTE: cookies are intentionally NOT httpOnly because the client-side API
  // layer (frontend/lib/api.ts) reads the token from document.cookie to attach
  // it as an Authorization: Bearer header to backend requests.
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.expires_in ?? 28800,
  })
  cookieStore.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.expires_in ?? 28800,
  })

  redirect('/dashboard')
}