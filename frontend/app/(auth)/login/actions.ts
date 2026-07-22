'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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

  let supabase
  try {
    supabase = await createClient()
  } catch {
    return {
      error: 'Authentication is not configured on the server. Contact an administrator.',
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return {
      error:
        error.message === 'Invalid login credentials'
          ? 'The email or password is incorrect.'
          : error.message,
    }
  }

  redirect('/dashboard')
}
