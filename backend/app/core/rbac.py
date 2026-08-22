"""
Role-Based Access Control (RBAC) for the MTN QuantRisk API.

Roles (ascending privilege):
  viewer      → read-only access to dashboards, KPIs, forecasts, news
  analyst     → + run scenarios, backtests, Monte Carlo, stress tests
  risk_manager → + generate briefs, upload data, acknowledge alerts
  cro         → + retrain models, manage scenarios (CRUD)
  admin       → + user management, system settings, audit trail

Implementation:
  - Permission matrix as a dict[role → set[permission]]
  - FastAPI dependencies: require_role(*roles), require_permission(perm)
  - JWT already carries `role`; we validate it here
"""

from functools import wraps
from typing import Callable, Sequence

from fastapi import Depends, HTTPException, status

from .security import get_current_user

# ── Role hierarchy (higher index = more privilege) ────────────────────────────

ROLE_HIERARCHY: dict[str, int] = {
    "viewer": 0,
    "analyst": 1,
    "risk_manager": 2,
    "cro": 3,
    "admin": 4,
}

# ── Permission matrix ─────────────────────────────────────────────────────────

PERMISSIONS: dict[str, set[str]] = {
    # Viewer permissions (read-only)
    "viewer": {
        "kpis:read",
        "scenarios:read",
        "forecasts:read",
        "news:read",
        "briefs:read",
        "alerts:read",
        "economics:read",
        "intelligence:read",
        "backtest:read",
        "monte_carlo:read",
        "stress_test:read",
        "history:read",
    },
    # Analyst permissions (+ write scenarios, run simulations)
    "analyst": {
        "scenarios:run",
        "backtest:run",
        "monte_carlo:run",
        "stress_test:run",
        "forecasts:read_events",
    },
    # Risk Manager permissions (+ generate briefs, upload, acknowledge alerts)
    "risk_manager": {
        "briefs:generate",
        "upload:csv",
        "upload:pdf",
        "alerts:acknowledge",
        "news:trigger_scrape",
    },
    # CRO permissions (+ CRUD scenarios, retrain)
    "cro": {
        "scenarios:create",
        "scenarios:update",
        "scenarios:delete",
        "models:retrain",
        "feedback:read",
    },
    # Admin permissions (+ user management, system settings, audit)
    "admin": {
        "users:manage",
        "system:settings",
        "audit:read",
        "llm:usage",
    },
}

# Compute effective permissions by merging all lower roles
def _effective_permissions(role: str) -> set[str]:
    """Return the union of permissions for the given role and all roles below it."""
    level = ROLE_HIERARCHY.get(role, 0)
    perms: set[str] = set()
    for r, lvl in ROLE_HIERARCHY.items():
        if lvl <= level:
            perms |= PERMISSIONS.get(r, set())
    return perms

# Cache effective permissions
_EFFECTIVE_CACHE: dict[str, set[str]] = {}
for _role in ROLE_HIERARCHY:
    _EFFECTIVE_CACHE[_role] = _effective_permissions(_role)


def has_permission(role: str, permission: str) -> bool:
    """Check if a role has a specific permission."""
    return permission in _EFFECTIVE_CACHE.get(role, set())


def get_role_level(role: str) -> int:
    """Return the numeric privilege level for a role."""
    return ROLE_HIERARCHY.get(role, 0)


# ── FastAPI Dependencies ─────────────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """FastAPI dependency that requires the user to have one of the listed roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
        def admin_endpoint(): ...

        @router.post("/scenario", dependencies=[Depends(require_role("cro", "admin"))])
        def create_scenario(): ...
    """
    allowed_levels = {ROLE_HIERARCHY.get(r, -1) for r in allowed_roles}

    def _check(user: dict = Depends(get_current_user)) -> dict:
        user_role = user.get("role", "viewer")
        user_level = ROLE_HIERARCHY.get(user_role, 0)
        if user_level < min(allowed_levels):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(allowed_roles)}. Your role: {user_role}",
            )
        return user
    return _check


def require_permission(permission: str):
    """FastAPI dependency that requires a specific permission.

    Usage:
        @router.post("/retrain", dependencies=[Depends(require_permission("models:retrain"))])
        def retrain(): ...
    """
    def _check(user: dict = Depends(get_current_user)) -> dict:
        user_role = user.get("role", "viewer")
        if not has_permission(user_role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}. Your role: {user_role}",
            )
        return user
    return _check


def get_user_permissions(user: dict) -> list[str]:
    """Return the list of effective permissions for a user dict."""
    role = user.get("role", "viewer")
    return sorted(_EFFECTIVE_CACHE.get(role, set()))
