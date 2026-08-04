import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_COOKIE, USER_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}