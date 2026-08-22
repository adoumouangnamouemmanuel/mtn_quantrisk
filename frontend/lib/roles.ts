/**
 * Frontend RBAC helpers — mirrors backend/app/core/rbac.py.
 *
 * The JWT already carries the user's role. These helpers let components
 * conditionally render UI elements based on role and permissions.
 */

export const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  analyst: 1,
  risk_manager: 2,
  cro: 3,
  admin: 4,
};

export type Role = keyof typeof ROLE_HIERARCHY;

export const PERMISSIONS: Record<string, string[]> = {
  viewer: [
    'kpis:read', 'scenarios:read', 'forecasts:read', 'news:read',
    'briefs:read', 'alerts:read', 'economics:read', 'intelligence:read',
    'backtest:read', 'monte_carlo:read', 'stress_test:read', 'history:read',
  ],
  analyst: [
    'scenarios:run', 'backtest:run', 'monte_carlo:run', 'stress_test:run',
    'forecasts:read_events',
  ],
  risk_manager: [
    'briefs:generate', 'upload:csv', 'upload:pdf',
    'alerts:acknowledge', 'news:trigger_scrape',
  ],
  cro: [
    'scenarios:create', 'scenarios:update', 'scenarios:delete',
    'models:retrain', 'feedback:read',
  ],
  admin: [
    'users:manage', 'system:settings', 'audit:read', 'llm:usage',
  ],
};

/** Compute effective permissions for a role (union of all lower roles). */
export function getEffectivePermissions(role: string): string[] {
  const level = ROLE_HIERARCHY[role] ?? 0;
  const perms = new Set<string>();
  for (const [r, lvl] of Object.entries(ROLE_HIERARCHY)) {
    if (lvl <= level) {
      for (const p of PERMISSIONS[r] ?? []) perms.add(p);
    }
  }
  return [...perms].sort();
}

/** Check if a role has a specific permission. */
export function hasPermission(role: string, permission: string): boolean {
  return getEffectivePermissions(role).includes(permission);
}

/** Check if the user's role is at least the given minimum role. */
export function hasRole(userRole: string, minimumRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minimumRole] ?? 0);
}

/** Human-readable role label. */
export const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  analyst: 'Analyst',
  risk_manager: 'Risk Manager',
  cro: 'CRO',
  admin: 'Admin',
};

/** Role badge color class (Tailwind). */
export const ROLE_COLORS: Record<string, string> = {
  viewer: 'bg-gray-100 text-gray-700',
  analyst: 'bg-blue-100 text-blue-700',
  risk_manager: 'bg-amber-100 text-amber-700',
  cro: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};
