import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id: Mapped[str] = mapped_column(String(36), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)

    tier: Mapped[str] = mapped_column(String(20), nullable=False)           # Watch / Warning / Critical
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    headline: Mapped[str] = mapped_column(Text, nullable=False)
    source_name: Mapped[str] = mapped_column(String(100), nullable=True)
    severity: Mapped[float] = mapped_column(Float, nullable=False)
    impact_ghs_mid: Mapped[float] = mapped_column(Float, nullable=True)
    mtn_relevance: Mapped[float] = mapped_column(Float, nullable=True)

    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    article: Mapped["Article"] = relationship("Article", back_populates="alerts")  # noqa: F821
