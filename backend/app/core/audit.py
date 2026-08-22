"""Audit trail middleware — logs every authenticated request to SQLite."""
import hashlib
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..models.database import SessionLocal
from ..models.audit_log import AuditLog

logger = logging.getLogger(__name__)

# Paths to exclude from audit logging (health checks, metrics, static)
_EXCLUDED_PATHS = {"/metrics", "/health", "/docs", "/openapi.json", "/redoc"}


class AuditMiddleware(BaseHTTPMiddleware):
    """Logs every authenticated API request to the audit_log table.

    Stores: timestamp, user email/role, method, path, status code,
    query params, body hash (SHA-256), IP, user agent, and duration.
    Never stores raw request bodies to avoid PII leakage.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip excluded paths and non-API routes
        path = request.url.path
        if path in _EXCLUDED_PATHS or not path.startswith("/api/"):
            return await call_next(request)

        start = time.monotonic()

        # Extract user info from state (set by get_current_user dependency)
        user_email = getattr(request.state, "user_email", None) or "anonymous"
        user_role = getattr(request.state, "user_role", None) or "unknown"

        # Hash the request body (if any)
        body_hash = None
        try:
            body = await request.body()
            if body:
                body_hash = hashlib.sha256(body).hexdigest()
        except Exception:
            pass

        # Capture query params
        query_params = str(request.url.query) if request.url.query else None

        # Get client info
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")[:500]

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = int((time.monotonic() - start) * 1000)

        # Log to database (fire-and-forget, don't block the response)
        try:
            db = SessionLocal()
            log_entry = AuditLog(
                user_email=user_email,
                user_role=user_role,
                method=request.method,
                path=path,
                status_code=response.status_code,
                query_params=query_params,
                body_hash=body_hash,
                ip_address=ip_address,
                user_agent=user_agent,
                duration_ms=duration_ms,
            )
            db.add(log_entry)
            db.commit()
        except Exception as exc:
            logger.warning("Audit log write failed: %s", exc)
        finally:
            try:
                db.close()
            except Exception:
                pass

        return response
