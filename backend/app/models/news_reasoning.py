"""Persisted news reasoning breakdowns.

Stores the full reasoning breakdown for every scored article so drill-down
history survives restarts and is queryable.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class NewsReasoningRecord(Base):
    __tablename__ = "news_reasoning"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=True)
    scored: Mapped[bool] = mapped_column(default=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    category_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    original_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    severity: Mapped[float | None] = mapped_column(Float, nullable=True)
    mtn_relevance: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    alert_tier: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(20), nullable=True)
    relevance_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    severity_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    sentiment_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    impact_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    entities: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    keyword_hits: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    matched_category_keywords: Mapped[list | None] = mapped_column(JSON, nullable=True)
    llm_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_used: Mapped[bool] = mapped_column(default=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "articleId": self.article_id,
            "title": self.title,
            "scored": self.scored,
            "category": self.category,
            "categoryLabel": self.category_label,
            "originalCategory": self.original_category,
            "severity": self.severity,
            "mtnRelevance": self.mtn_relevance,
            "confidence": self.confidence,
            "alertTier": self.alert_tier,
            "sentiment": self.sentiment,
            "relevanceReasons": self.relevance_reasons,
            "severityReasons": self.severity_reasons,
            "sentimentReasons": self.sentiment_reasons,
            "impactReasons": self.impact_reasons,
            "entities": self.entities,
            "keywordHits": self.keyword_hits,
            "matchedCategoryKeywords": self.matched_category_keywords,
            "llmExplanation": self.llm_explanation,
            "llmUsed": self.llm_used,
            "computedAt": self.computed_at.isoformat(),
        }
