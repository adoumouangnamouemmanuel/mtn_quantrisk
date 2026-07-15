import { createBrowserClient } from '@supabase/ssr'

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

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return createFallbackClient() as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, anonKey)
}
