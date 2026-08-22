import { NextResponse, type NextRequest } from 'next/server';
import { TOKEN_COOKIE, USER_COOKIE } from '@/lib/auth';

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const userRaw = request.cookies.get(USER_COOKIE)?.value;

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/');

  // Allow auth routes (login POST, logout) through
  if (isAuthRoute) {
    return NextResponse.next({ request });
  }

  // No token → redirect to login (unless already on login page)
  if (!token && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Has token but on login page → redirect to dashboard
  if (token && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  // If token exists but user cookie is missing, try to refresh from /api/auth/me
  if (token && !userRaw && !isLoginPage) {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8001';
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const user = await res.json();
        const response = NextResponse.next({ request });
        response.cookies.set(
          USER_COOKIE,
          encodeURIComponent(JSON.stringify(user)),
          { httpOnly: true, sameSite: 'lax', path: '/' }
        );
        return response;
      }
      // Token invalid → clear and redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_COOKIE);
      response.cookies.delete(USER_COOKIE);
      return response;
    } catch {
      // Backend unreachable — allow through; API calls will surface errors
      return NextResponse.next({ request });
    }
  }

  return NextResponse.next({ request });
}