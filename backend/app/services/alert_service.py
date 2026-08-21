"""
Alert CRUD — list, acknowledge, and summary helpers.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from ..models.alert import Alert
from ..models.article import Article


def list_alerts(
    db: Session,
    tier: str | None = None,
    acknowledged: bool | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    query = db.query(Alert).join(Article, Alert.article_id == Article.id)

    if tier:
        query = query.filter(Alert.tier == tier)
    if acknowledged is not None:
        query = query.filter(Alert.acknowledged == acknowledged)

    alerts = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
    return [_alert_to_dict(a) for a in alerts]


def acknowledge_alert(db: Session, alert_id: str) -> dict | None:
    alert = db.get(Alert, alert_id)
    if not alert:
        return None
    alert.acknowledged = True
    alert.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return _alert_to_dict(alert)


def get_alert_summary(db: Session) -> dict:
    """Returns counts per tier for dashboard display."""
    all_active = db.query(Alert).filter(Alert.acknowledged.is_(False)).all()
    return {
        "total_active": len(all_active),
        "critical": sum(1 for a in all_active if a.tier == "Critical"),
        "warning":  sum(1 for a in all_active if a.tier == "Warning"),
        "watch":    sum(1 for a in all_active if a.tier == "Watch"),
    }


def _alert_to_dict(alert: Alert) -> dict:
    return {
        "id":             alert.id,
        "articleId":      alert.article_id,
        "tier":           alert.tier,
        "category":       alert.category,
        "headline":       alert.headline,
        "sourceName":     alert.source_name,
        "severity":       alert.severity,
        "impactGhsMid":   alert.impact_ghs_mid,
        "mtnRelevance":   alert.mtn_relevance,
        "acknowledged":   alert.acknowledged,
        "acknowledgedAt": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "createdAt":      alert.created_at.isoformat() if alert.created_at else None,
    }
