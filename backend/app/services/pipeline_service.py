"""
process_article — chains NLP → sentiment → impact → alert creation.
Called immediately after a new article is stored by the scraper.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def process_article(article_id: str) -> dict | None:
    """
    Full NLP pipeline for one article:
      1. Load article from DB
      2. Run NER + keyword classifier  →  mtn_relevance, category, severity
      3. Skip if mtn_relevance < 0.2 (not relevant to MTN)
      4. Run sentiment analysis
      5. Compute financial impact
      6. Determine alert tier
      7. Save RiskScore
      8. If tier in (Watch, Warning, Critical) → create Alert

    Returns the saved RiskScore dict or None if skipped.
    """
    from ..models.database import SessionLocal
    from ..models.article import Article
    from ..models.risk_score import RiskScore
    from ..models.alert import Alert
    from .nlp_service import compute_mtn_relevance, run_nlp
    from .sentiment_service import run_sentiment
    from .impact_service import estimate_impact, compute_alert_tier

    with SessionLocal() as db:
        article = db.get(Article, article_id)
        if not article:
            logger.warning("process_article: article %s not found", article_id)
            return None

        # ── Step 2 — NLP
        article_text = f"{article.title or ''} {article.body or ''}"
        mtn_relevance = compute_mtn_relevance(article_text)
        if mtn_relevance < 0.2:
            logger.debug("Skipping %s before remote NLP — mtn_relevance=%.2f", article_id[:8], mtn_relevance)
            return None

        nlp_result = run_nlp(article.title or "", article.body or "")
        mtn_relevance = nlp_result["mtn_relevance"]

        # ── Step 3 — Skip low-relevance articles
        if mtn_relevance < 0.2:
            logger.debug("Skipping %s — mtn_relevance=%.2f", article_id[:8], mtn_relevance)
            return None

        # ── Step 4 — Sentiment
        sentiment_result = run_sentiment(f"{article.title} {article.body or ''}")

        # ── Step 5 — Impact
        impact = estimate_impact(
            nlp_result["category"],
            nlp_result["severity"],
            mtn_relevance,
            nlp_result["confidence"],
        )

        # ── Step 6 — Alert tier
        alert_tier = compute_alert_tier(nlp_result["severity"], mtn_relevance)

        # ── Step 7 — Save RiskScore
        risk_score = RiskScore(
            article_id=article_id,
            category=nlp_result["category"],
            severity=nlp_result["severity"],
            confidence=nlp_result["confidence"],
            mtn_relevance=mtn_relevance,
            alert_tier=alert_tier,
            sentiment=sentiment_result["sentiment"],
            sentiment_confidence=sentiment_result["sentiment_confidence"],
            impact_ghs_min=impact["impact_ghs_min"],
            impact_ghs_mid=impact["impact_ghs_mid"],
            impact_ghs_max=impact["impact_ghs_max"],
            entities=nlp_result["entities"],
            keyword_hits=nlp_result["keyword_hits"],
        )
        db.add(risk_score)

        # ── Step 8 — Create Alert if threshold met
        if alert_tier:
            alert = Alert(
                article_id=article_id,
                tier=alert_tier,
                category=nlp_result["category"],
                headline=article.title or "",
                source_name=article.source_name or "",
                severity=nlp_result["severity"],
                impact_ghs_mid=impact["impact_ghs_mid"],
                mtn_relevance=mtn_relevance,
            )
            db.add(alert)
            logger.info(
                "[%s] %s — %s severity=%.1f relevance=%.2f",
                alert_tier.upper(), article.source_name, article.title[:60],
                nlp_result["severity"], mtn_relevance,
            )

        db.commit()

        return {
            "article_id": article_id,
            "category": nlp_result["category"],
            "severity": nlp_result["severity"],
            "mtn_relevance": mtn_relevance,
            "alert_tier": alert_tier,
            "sentiment": sentiment_result["sentiment"],
        }
