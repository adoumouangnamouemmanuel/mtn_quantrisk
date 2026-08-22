"""Persisted forecast adjustment history.

Stores every event-aware forecast computation so the drill-down history
survives restarts and is queryable across sessions.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class ForecastAdjustment(Base):
    __tablename__ = "forecast_adjustments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kpi_id: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    baseline_p50: Mapped[float] = mapped_column(Float, nullable=False)
    adjusted_p50: Mapped[float] = mapped_column(Float, nullable=False)
    adjustment_abs: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    adjustment_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    event_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    aggregate_pressure: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    narrative: Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_used: Mapped[bool] = mapped_column(default=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "kpiId": self.kpi_id,
            "date": self.date,
            "baselineP50": self.baseline_p50,
            "adjustedP50": self.adjusted_p50,
            "adjustmentAbs": self.adjustment_abs,
            "adjustmentPct": self.adjustment_pct,
            "eventCount": self.event_count,
            "aggregatePressure": self.aggregate_pressure,
            "events": self.events,
            "narrative": self.narrative,
            "llmUsed": self.llm_used,
            "computedAt": self.computed_at.isoformat(),
        }
