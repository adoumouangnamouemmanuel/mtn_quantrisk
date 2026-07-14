import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id: Mapped[str] = mapped_column(String(36), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)

    category: Mapped[str] = mapped_column(String(50), nullable=False)       # regulatory, competitive, etc.
    severity: Mapped[float] = mapped_column(Float, nullable=False)           # 0.0–10.0
    confidence: Mapped[float] = mapped_column(Float, nullable=False)         # 0.0–1.0
    mtn_relevance: Mapped[float] = mapped_column(Float, nullable=False)      # 0.0–1.0
    alert_tier: Mapped[str] = mapped_column(String(20), nullable=True)       # Watch / Warning / Critical / None

    sentiment: Mapped[str] = mapped_column(String(20), nullable=True)        # positive / neutral / negative
    sentiment_confidence: Mapped[float] = mapped_column(Float, nullable=True)

    impact_ghs_min: Mapped[float] = mapped_column(Float, nullable=True)
    impact_ghs_mid: Mapped[float] = mapped_column(Float, nullable=True)
    impact_ghs_max: Mapped[float] = mapped_column(Float, nullable=True)

    entities: Mapped[dict] = mapped_column(JSON, nullable=True)              # { orgs, money, locations, persons }
    keyword_hits: Mapped[dict] = mapped_column(JSON, nullable=True)          # { category: count }

    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    article: Mapped["Article"] = relationship("Article", back_populates="risk_scores")  # noqa: F821
