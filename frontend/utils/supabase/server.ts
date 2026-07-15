import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createFallbackClient() {
  return {
    auth: {
      async signInWithPassword() {
        return { error: null }
      },
      async signOut() {
        return undefined
      },
    },
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return createFallbackClient() as ReturnType<typeof createServerClient>
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
