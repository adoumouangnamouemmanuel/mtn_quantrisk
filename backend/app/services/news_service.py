"""
News feed — paginated article list with risk scores joined.
"""

from datetime import datetime, date
from sqlalchemy.orm import Session

from ..models.article import Article
from ..models.risk_score import RiskScore


def list_news(
    db: Session,
    category: str | None = None,
    source: str | None = None,
    date_from: date | None = None,
    limit: int = 30,
    offset: int = 0,
) -> list[dict]:
    query = (
        db.query(Article, RiskScore)
        .outerjoin(RiskScore, RiskScore.article_id == Article.id)
        .order_by(Article.scraped_at.desc())
    )

    if source:
        query = query.filter(Article.source_name.ilike(f"%{source}%"))
    if date_from:
        query = query.filter(Article.published_at >= datetime(date_from.year, date_from.month, date_from.day))
    if category:
        query = query.filter(RiskScore.category == category)

    rows = query.offset(offset).limit(limit).all()
    return [_row_to_dict(article, risk_score) for article, risk_score in rows]


def get_news_by_id(db: Session, article_id: str) -> dict | None:
    row = (
        db.query(Article, RiskScore)
        .outerjoin(RiskScore, RiskScore.article_id == Article.id)
        .filter(Article.id == article_id)
        .first()
    )
    if not row:
        return None
    return _row_to_dict(row[0], row[1], full=True)


def get_news_summary(db: Session) -> dict:
    """Stats for the dashboard summary card."""
    from datetime import timezone
    today = datetime.now(timezone.utc).date()
    all_today = (
        db.query(Article)
        .filter(Article.scraped_at >= datetime(today.year, today.month, today.day))
        .count()
    )
    scored = db.query(RiskScore).all()
    cat_counts: dict[str, int] = {}
    for rs in scored:
        cat_counts[rs.category] = cat_counts.get(rs.category, 0) + 1
    top_category = max(cat_counts, key=lambda c: cat_counts[c]) if cat_counts else None

    return {
        "articlesToday": all_today,
        "totalArticles": db.query(Article).count(),
        "topRiskCategory": top_category,
        "categoryBreakdown": cat_counts,
    }


def _row_to_dict(article: Article, risk_score: RiskScore | None, full: bool = False) -> dict:
    base = {
        "id":          article.id,
        "url":         article.url,
        "title":       article.title,
        "sourceName":  article.source_name,
        "publishedAt": article.published_at.isoformat() if article.published_at else None,
        "scrapedAt":   article.scraped_at.isoformat() if article.scraped_at else None,
    }
    if full:
        base["body"] = article.body

    if risk_score:
        base.update({
            "category":          risk_score.category,
            "severity":          risk_score.severity,
            "confidence":        risk_score.confidence,
            "mtnRelevance":      risk_score.mtn_relevance,
            "alertTier":         risk_score.alert_tier,
            "sentiment":         risk_score.sentiment,
            "impactGhsMin":      risk_score.impact_ghs_min,
            "impactGhsMid":      risk_score.impact_ghs_mid,
            "impactGhsMax":      risk_score.impact_ghs_max,
            "entities":          risk_score.entities,
        })
        if full:
            base["keywordHits"] = risk_score.keyword_hits
    else:
        base.update({
            "category": None, "severity": None, "mtnRelevance": None,
            "alertTier": None, "sentiment": None,
            "impactGhsMin": None, "impactGhsMid": None, "impactGhsMax": None,
            "entities": None,
        })
    return base
