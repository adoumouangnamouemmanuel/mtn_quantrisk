import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class BoardBriefRecord(Base):
    __tablename__ = "board_briefs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"B-{uuid.uuid4().hex[:8].upper()}")
    title: Mapped[str] = mapped_column(Text, nullable=False)
    scenario_ids: Mapped[list] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Ready")
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    severity_score: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_impact: Mapped[dict] = mapped_column(JSON, nullable=False)
    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_kpi_impacts: Mapped[list] = mapped_column(JSON, nullable=False)
    calibration_notes: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_actions: Mapped[list] = mapped_column(JSON, nullable=False)
    key_entities: Mapped[list] = mapped_column(JSON, nullable=False)

    def to_dict(self) -> dict:
        generated_at = self.generated_at
        if generated_at.tzinfo is None:
            generated_at = generated_at.replace(tzinfo=timezone.utc)
        return {
            "id": self.id,
            "title": self.title,
            "scenarioIds": self.scenario_ids,
            "status": self.status,
            "generatedAt": generated_at.isoformat(),
            "severityScore": self.severity_score,
            "estimatedImpact": self.estimated_impact,
            "executiveSummary": self.executive_summary,
            "keyKpiImpacts": self.key_kpi_impacts,
            "calibrationNotes": self.calibration_notes,
            "recommendedActions": self.recommended_actions,
            "keyEntities": self.key_entities,
        }
