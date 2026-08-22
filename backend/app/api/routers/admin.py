"""Admin-only endpoints for user management."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ...core.security import (
    get_current_user,
    hash_password,
    _USERS,
    _seed_default_user,
)
from ...core.rbac import require_role, ROLE_HIERARCHY

router = APIRouter(prefix="/api/admin", tags=["admin"])


class CreateUserRequest(BaseModel):
    email: str
    password: str
    role: str = "viewer"
    name: str


class UpdateRoleRequest(BaseModel):
    role: str


class UserListItem(BaseModel):
    email: str
    role: str
    name: str


@router.get("/users", dependencies=[Depends(require_role("admin"))])
def list_users():
    """List all registered users (admin only)."""
    _seed_default_user()
    return [
        {"email": email, "role": user["role"], "name": user["name"]}
        for email, user in _USERS.items()
    ]


@router.post("/users", status_code=201, dependencies=[Depends(require_role("admin"))])
def create_user(body: CreateUserRequest):
    """Create a new user (admin only)."""
    _seed_default_user()
    normalized = body.email.strip().lower()
    if normalized in _USERS:
        raise HTTPException(status_code=409, detail="User already exists")
    if body.role not in ROLE_HIERARCHY:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
    _USERS[normalized] = {
        "password_hash": hash_password(body.password),
        "role": body.role,
        "name": body.name,
    }
    return {"email": normalized, "role": body.role, "name": body.name}


@router.patch("/users/{email}/role", dependencies=[Depends(require_role("admin"))])
def update_user_role(email: str, body: UpdateRoleRequest):
    """Update a user's role (admin only)."""
    _seed_default_user()
    normalized = email.strip().lower()
    if normalized not in _USERS:
        raise HTTPException(status_code=404, detail="User not found")
    if body.role not in ROLE_HIERARCHY:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
    _USERS[normalized]["role"] = body.role
    return {"email": normalized, "role": body.role, "name": _USERS[normalized]["name"]}


@router.delete("/users/{email}", status_code=204, dependencies=[Depends(require_role("admin"))])
def delete_user(email: str):
    """Delete a user (admin only). Cannot delete the last admin."""
    _seed_default_user()
    normalized = email.strip().lower()
    if normalized not in _USERS:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent deleting the last admin
    if _USERS[normalized]["role"] == "admin":
        admin_count = sum(1 for u in _USERS.values() if u["role"] == "admin")
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin user")
    del _USERS[normalized]
    return None
