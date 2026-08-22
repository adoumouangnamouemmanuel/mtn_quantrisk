import { cookies } from 'next/headers';
import { TOKEN_COOKIE, USER_COOKIE, type AuthUser } from '@/lib/auth';

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthUser;
  } catch {
    return null;
  }
}

export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getServerToken();
  return Boolean(token);
}