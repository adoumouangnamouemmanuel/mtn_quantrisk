"""
News feed — paginated article list with risk scores joined.
"""

from datetime import datetime, date, timedelta
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..models.article import Article
from ..models.risk_score import RiskScore


def list_news(
    db: Session,
    category: str | None = None,
    source: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    keyword: str | None = None,
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
        start = datetime(date_from.year, date_from.month, date_from.day)
        query = query.filter(func.coalesce(Article.published_at, Article.scraped_at) >= start)
    if date_to:
        end = datetime(date_to.year, date_to.month, date_to.day) + timedelta(days=1)
        query = query.filter(func.coalesce(Article.published_at, Article.scraped_at) < end)
    if keyword and keyword.strip():
        search = f"%{keyword.strip()}%"
        query = query.filter(or_(
            Article.title.ilike(search),
            Article.body.ilike(search),
            Article.source_name.ilike(search),
        ))
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
    from datetime import timezone, timedelta
    now = datetime.now(timezone.utc)
    today = now.date()
    since_24h = now - timedelta(hours=24)

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

    # Source breakdown — article count per source in last 24 h
    recent = db.query(Article.source_name).filter(Article.scraped_at >= since_24h).all()
    source_counts: dict[str, int] = {}
    for (src,) in recent:
        key = src or "Unknown"
        source_counts[key] = source_counts.get(key, 0) + 1
    # Return top 15 by count, sorted descending
    source_breakdown = dict(
        sorted(source_counts.items(), key=lambda x: -x[1])[:15]
    )

    return {
        "articlesToday": all_today,
        "totalArticles": db.query(Article).count(),
        "topRiskCategory": top_category,
        "categoryBreakdown": cat_counts,
        "sourceBreakdown": source_breakdown,
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
