
/**
 * JWT authentication helpers for the MTN QuantRisk dashboard.
 *
 * The access token is stored in an httpOnly cookie (`mtn_qr_token`) set by the
 * server-side login route. Client components read the user profile from the
 * same cookie (non-httpOnly mirror) or from the `/api/auth/me` endpoint.
 */

export const TOKEN_COOKIE = 'mtn_qr_token';
export const USER_COOKIE = 'mtn_qr_user';

export interface AuthUser {
  email: string;
  role: string;
  name: string;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${USER_COOKIE}=`))
      ?.split('=')[1];
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as AuthUser;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));
  return match ? (match.split('=')[1] ?? null) : null;
}

export function clearAuthCookies(): void {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0`;
  document.cookie = `${USER_COOKIE}=; Path=/; Max-Age=0`;
}