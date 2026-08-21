import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Feedback(Base):
    """User feedback on predictions and alerts (audit finding H9 / TD-16).

    Previously feedback was appended to a JSON file with no concurrency
    control; moving it to a DB table makes writes atomic and queryable.
    """

    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())[:8]
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    page: Mapped[str] = mapped_column(String(120), nullable=False)
    feedback_type: Mapped[str] = mapped_column(String(40), nullable=False)
    rating: Mapped[str] = mapped_column(String(16), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    context: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    def to_dict(self) -> dict:
        ts = self.timestamp
        if ts is not None and ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return {
            "id": self.id,
            "timestamp": ts.isoformat() if ts else None,
            "page": self.page,
            "type": self.feedback_type,
            "rating": self.rating,
            "message": self.message,
            "context": self.context or {},
        }


class BaseCaseChangeLog(Base):
    """Append-only audit log of base-case value changes (audit H9 / TD-16)."""

    __tablename__ = "base_case_change_log"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    kpi_id: Mapped[str] = mapped_column(String(20), nullable=False)
    old_value: Mapped[float] = mapped_column(Float, nullable=False)
    new_value: Mapped[float] = mapped_column(Float, nullable=False)
    delta: Mapped[float] = mapped_column(Float, nullable=False)
    delta_pct: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(200), nullable=False)

    def to_dict(self) -> dict:
        ts = self.timestamp
        if ts is not None and ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return {
            "timestamp": ts.isoformat() if ts else None,
            "kpiId": self.kpi_id,
            "oldValue": self.old_value,
            "newValue": self.new_value,
            "delta": self.delta,
            "deltaPct": self.delta_pct,
            "source": self.source,
        }
