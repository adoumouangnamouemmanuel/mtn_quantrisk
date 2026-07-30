export function isDevAuthBypassEnabled(host?: string | null) {
  if (process.env.DEV_AUTH_BYPASS?.trim().toLowerCase() !== 'true') {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const normalizedHost = host?.trim().toLowerCase() ?? '';
  return (
    normalizedHost === 'localhost' ||
    normalizedHost.startsWith('localhost:') ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost.startsWith('127.0.0.1:') ||
    normalizedHost === '[::1]' ||
    normalizedHost.startsWith('[::1]:')
  );
}
