/**
 * RoleGate — conditionally renders children based on user role or permission.
 *
 * Usage:
 *   <RoleGate minimumRole="risk_manager">
 *     <GenerateBriefButton />
 *   </RoleGate>
 *
 *   <RoleGate permission="models:retrain">
 *     <RetrainButton />
 *   </RoleGate>
 */
'use client';

import { ReactNode } from 'react';
import { getStoredUser } from '@/lib/auth';
import { hasRole, hasPermission, Role } from '@/lib/roles';

interface RoleGateProps {
  /** Minimum role required (checked against role hierarchy). */
  minimumRole?: Role;
  /** Specific permission required. */
  permission?: string;
  /** Content to render if authorized. */
  children: ReactNode;
  /** Content to render if NOT authorized (default: render nothing). */
  fallback?: ReactNode;
}

export function RoleGate({ minimumRole, permission, children, fallback = null }: RoleGateProps) {
  const user = getStoredUser();
  if (!user) return <>{fallback}</>;

  const allowed =
    (minimumRole ? hasRole(user.role, minimumRole) : true) &&
    (permission ? hasPermission(user.role, permission) : true);

  return <>{allowed ? children : fallback}</>;
}
