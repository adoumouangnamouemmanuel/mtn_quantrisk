"""SQLite model for the audit trail."""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone

from .database import Base


class AuditLog(Base):
    """Stores every authenticated API request for compliance and forensics."""
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    user_role: Mapped[str] = mapped_column(String(50))
    method: Mapped[str] = mapped_column(String(10))
    path: Mapped[str] = mapped_column(String(500), index=True)
    status_code: Mapped[int] = mapped_column(Integer)
    query_params: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Store a SHA-256 hash of the request body (never store raw PII)
    body_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
