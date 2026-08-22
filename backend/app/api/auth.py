"""Authentication endpoints for the MTN QuantRisk API."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..core.security import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_user_by_email,
)
from ..core.rbac import get_user_permissions

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    email: str
    role: str
    name: str
    permissions: list[str]


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from ..core.security import JWT_ACCESS_TOKEN_EXPIRE_MINUTES

    token = create_access_token(
        subject=user["email"],
        email=user["email"],
        role=user["role"],
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile with permissions."""
    user = get_user_by_email(current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["permissions"] = get_user_permissions(user)
    return user


@router.post("/logout", status_code=204)
def logout(current_user: dict = Depends(get_current_user)):
    """Logout endpoint. JWT is stateless — the client discards the token."""
    return None