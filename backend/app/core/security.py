"""
JWT authentication and password security for the MTN QuantRisk API.

Implements:
  - Password hashing with PBKDF2-HMAC-SHA256 (stdlib only)
  - JWT access token creation and verification (HS256, stdlib-only)
  - FastAPI dependency for protecting routes
"""
import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "480")
)  # 8 hours default

# ── Password hashing (PBKDF2-HMAC-SHA256) ──────────────────────────────────────

_PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a random salt.

    Format: pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
    """
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS
    )
    return (
        f"pbkdf2_sha256${_PBKDF2_ITERATIONS}$"
        f"{salt.hex()}${digest.hex()}"
    )


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a PBKDF2 hash string."""
    try:
        algorithm, iterations_str, salt_hex, hash_hex = hashed.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


# ── JWT helpers (stdlib-only HS256) ────────────────────────────────────────────


def _b64url_encode(data: bytes) -> str:
    """Base64url encode without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    """Base64url decode with padding restoration."""
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(header_b64: str, payload_b64: str) -> str:
    """Create an HMAC-SHA256 signature."""
    message = f"{header_b64}.{payload_b64}".encode("ascii")
    sig = hmac.new(
        JWT_SECRET.encode("utf-8"), message, hashlib.sha256
    ).digest()
    return _b64url_encode(sig)


def create_access_token(
    subject: str,
    email: str,
    role: str = "analyst",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token (HS256, stdlib-only)."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        or timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": subject,
        "email": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "mtn-quantrisk",
        "aud": "mtn-quantrisk-api",
    }

    header_b64 = _b64url_encode(
        json.dumps(header, separators=(",", ":")).encode("utf-8")
    )
    payload_b64 = _b64url_encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signature = _sign(header_b64, payload_b64)

    return f"{header_b64}.{payload_b64}.{signature}"


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token. Raises HTTPException on invalid/expired."""
    try:
        header_b64, payload_b64, signature = token.split(".")
    except (ValueError, AttributeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Verify signature
    expected_sig = _sign(header_b64, payload_b64)
    if not hmac.compare_digest(expected_sig, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode payload
    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except (ValueError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Verify issuer and audience
    if payload.get("iss") != "mtn-quantrisk":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if payload.get("aud") != "mtn-quantrisk-api":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify expiry
    exp = payload.get("exp")
    if not isinstance(exp, (int, float)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if time.time() > exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# ── FastAPI dependency ─────────────────────────────────────────────────────────

_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict[str, Any]:
    """FastAPI dependency that validates the Bearer JWT and returns the user."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role", "analyst"),
    }


# ── Local user store ───────────────────────────────────────────────────────────

# In-memory user registry. In production, replace with a database-backed
# user table. The default analyst account is seeded on first use.
_USERS: dict[str, dict[str, str]] = {}


def _seed_default_user() -> None:
    """Seed the default analyst user if no users exist yet."""
    if _USERS:
        return
    email = os.environ.get("AUTH_EMAIL", "analyst@mtn.com")
    password = os.environ.get("AUTH_PASSWORD", "Pass.word.123")
    _USERS[email.lower()] = {
        "password_hash": hash_password(password),
        "role": "analyst",
        "name": "Risk Analyst",
    }


def authenticate_user(email: str, password: str) -> Optional[dict[str, str]]:
    """Validate credentials and return the user dict (without password hash)."""
    _seed_default_user()
    normalized = email.strip().lower()
    user = _USERS.get(normalized)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return {
        "email": normalized,
        "role": user["role"],
        "name": user["name"],
    }


def get_user_by_email(email: str) -> Optional[dict[str, str]]:
    """Return a user dict (without password hash) by email."""
    _seed_default_user()
    user = _USERS.get(email.strip().lower())
    if not user:
        return None
    return {
        "email": email.strip().lower(),
        "role": user["role"],
        "name": user["name"],
    }