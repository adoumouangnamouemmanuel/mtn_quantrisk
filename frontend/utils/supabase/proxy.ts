import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isDevAuthBypassEnabled } from './dev-auth'

export async function updateSession(request: NextRequest) {
  if (isDevAuthBypassEnabled(request.nextUrl.host)) {
    if (request.nextUrl.pathname === '/login') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      dashboardUrl.search = ''
      return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next({ request })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !publishableKey) {
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next({ request })
    }

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('error', 'configuration')
    return NextResponse.redirect(loginUrl)
  }

  // The credential POST must reach its route handler before a session exists.
  // That handler validates credentials and writes the new auth cookies.
  if (request.nextUrl.pathname === '/auth/login') {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([name, value]) =>
          response.headers.set(name, value)
        )
      },
    },
  })

  // Use the same server-validated identity check as the protected app layout.
  // This works with both symmetric and asymmetric Supabase signing keys.
  const { data, error } = await supabase.auth.getUser()
  const user = data.user
  if (error) {
    console.warn('[auth-proxy] Session validation failed', {
      code: error.code,
      status: error.status,
      message: error.message,
    })
  }

  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )
    return NextResponse.redirect(loginUrl)
  }

  if (user && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
