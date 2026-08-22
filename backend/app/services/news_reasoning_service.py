"""
Explains *why* a news article has its relevance, severity, and category scores.

The NLP pipeline already stores the raw signals (keyword hits, entities,
sentiment, impact bands, confidence). This service assembles them into a
structured, human-readable rationale so the UI can drill down into the
reasoning behind every score — with an optional LLM narrative when a key is
available.
"""
from __future__ import annotations

import logging

from ..core.risk_taxonomy import normalise_category, RISK_CATEGORY_META

logger = logging.getLogger(__name__)


def _persist_reasoning(article_id: str, reasoning: dict) -> None:
    """Persist a reasoning breakdown to SQLite for queryability.

    Deduplicates by article_id — only stores the latest reasoning per article.
    """
    try:
        from ..models.database import SessionLocal
        from ..models.news_reasoning import NewsReasoningRecord

        with SessionLocal() as db:
            # Remove any existing reasoning for this article to avoid duplicates
            db.query(NewsReasoningRecord).filter(
                NewsReasoningRecord.article_id == article_id
            ).delete()

            record = NewsReasoningRecord(
                article_id=article_id,
                title=reasoning.get("title"),
                scored=reasoning.get("scored", False),
                category=reasoning.get("category"),
                category_label=reasoning.get("categoryLabel"),
                original_category=reasoning.get("originalCategory"),
                severity=reasoning.get("severity"),
                mtn_relevance=reasoning.get("mtnRelevance"),
                confidence=reasoning.get("confidence"),
                alert_tier=reasoning.get("alertTier"),
                sentiment=reasoning.get("sentiment"),
                relevance_reasons=reasoning.get("relevanceReasons"),
                severity_reasons=reasoning.get("severityReasons"),
                sentiment_reasons=reasoning.get("sentimentReasons"),
                impact_reasons=reasoning.get("impactReasons"),
                entities=reasoning.get("entities"),
                keyword_hits=reasoning.get("keywordHits"),
                matched_category_keywords=reasoning.get("matchedCategoryKeywords"),
                llm_explanation=reasoning.get("llmExplanation"),
                llm_used=reasoning.get("llmUsed", False),
            )
            db.add(record)
            db.commit()
    except Exception as exc:
        logger.warning("Failed to persist news reasoning: %s", exc)


def build_reasoning(article_id: str) -> dict | None:
    """Return the full reasoning breakdown for one article."""
    from ..models.database import SessionLocal
    from ..models.article import Article
    from ..models.risk_score import RiskScore
    from .nlp_service import MTN_KEYWORDS, GHANA_KEYWORDS, CATEGORY_KEYWORDS

    with SessionLocal() as db:
        article = db.get(Article, article_id)
        if not article:
            return None
        score = (
            db.query(RiskScore).filter(RiskScore.article_id == article_id).first()
        )
        if not score:
            return {
                "articleId": article_id,
                "scored": False,
                "note": "This article was stored but not yet scored by the NLP pipeline.",
            }

        text = f"{article.title or ''} {article.body or ''}"
        text_lower = text.lower()

        # ── Relevance reasons ──
        mtn_hits = [kw for kw in MTN_KEYWORDS if kw.lower() in text_lower]
        ghana_hits = [kw for kw in GHANA_KEYWORDS if kw.lower() in text_lower]
        relevance_reasons: list[dict] = []
        for kw in mtn_hits:
            relevance_reasons.append(
                {"signal": "MTN mention", "keyword": kw, "weight": 0.35}
            )
        for kw in ghana_hits:
            relevance_reasons.append(
                {"signal": "Ghana mention", "keyword": kw, "weight": 0.10}
            )
        relevance_reasons.append(
            {
                "signal": "Base relevance",
                "keyword": None,
                "weight": 0.10,
                "note": "Any Ghana-focused source gets a 0.10 floor.",
            }
        )

        # ── Severity / category reasons ──
        category = normalise_category(score.category)
        category_label = RISK_CATEGORY_META.get(category, {}).get("label", category)
        category_keywords = CATEGORY_KEYWORDS.get(score.category, [])
        matched_keywords = [
            kw for kw in category_keywords if kw.lower() in text_lower
        ]
        severity_reasons: list[dict] = []
        for kw in matched_keywords:
            severity_reasons.append(
                {
                    "signal": "Category keyword hit",
                    "keyword": kw,
                    "category": score.category,
                    "mappedCategory": category,
                }
            )
        severity_reasons.append(
            {
                "signal": "Severity score",
                "value": float(score.severity),
                "note": "Keyword hits × category weight, normalised 0–10.",
            }
        )
        if score.alert_tier:
            severity_reasons.append(
                {
                    "signal": "Alert tier",
                    "value": score.alert_tier,
                    "note": "Escalates when mtn_relevance ≥ 0.25 and severity crosses 3/5/7.5.",
                }
            )

        # ── Sentiment + impact ──
        sentiment_reasons = [
            {
                "signal": "Sentiment label",
                "value": score.sentiment,
                "confidence": float(score.sentiment_confidence)
                if score.sentiment_confidence is not None
                else None,
                "note": "FinBERT via HF when configured; lexicon fallback otherwise.",
            }
        ]
        impact_reasons = []
        if score.impact_ghs_mid is not None:
            impact_reasons.append(
                {
                    "signal": "Estimated impact",
                    "min": float(score.impact_ghs_min)
                    if score.impact_ghs_min is not None
                    else None,
                    "mid": float(score.impact_ghs_mid),
                    "max": float(score.impact_ghs_max)
                    if score.impact_ghs_max is not None
                    else None,
                    "note": "base × (severity/10) × relevance × confidence, in GHS millions.",
                }
            )

        # ── Entities ──
        entities = score.entities or {}

        llm_summary = _llm_explanation(
            article.title or "",
            text[:1500],
            category_label,
            float(score.severity),
            float(score.mtn_relevance or 0.0),
            matched_keywords,
        )

        result = {
            "articleId": article_id,
            "title": article.title,
            "scored": True,
            "category": category,
            "categoryLabel": category_label,
            "originalCategory": score.category,
            "severity": float(score.severity),
            "mtnRelevance": float(score.mtn_relevance or 0.0),
            "confidence": float(score.confidence),
            "alertTier": score.alert_tier,
            "sentiment": score.sentiment,
            "relevanceReasons": relevance_reasons,
            "severityReasons": severity_reasons,
            "sentimentReasons": sentiment_reasons,
            "impactReasons": impact_reasons,
            "entities": entities,
            "keywordHits": score.keyword_hits or {},
            "matchedCategoryKeywords": matched_keywords,
            "llmExplanation": llm_summary,
            "llmUsed": llm_summary is not None,
        }

        # Persist reasoning breakdown to SQLite
        _persist_reasoning(article_id, result)

        return result


def _llm_explanation(
    title: str,
    body: str,
    category: str,
    severity: float,
    relevance: float,
    matched_keywords: list[str],
) -> str | None:
    """Ask the LLM for a one-paragraph explanation of the score.

    Uses the provider-agnostic LLM client with cost/latency controls.
    """
    try:
        from ..core.llm_client import get_llm_client

        client = get_llm_client()
        kw_str = ", ".join(matched_keywords[:10]) or "none"
        prompt = (
            "You are an MTN Ghana risk analyst. Explain in 2-3 short sentences why this "
            f"news article was scored as:\n"
            f"- Category: {category}\n"
            f"- Severity: {severity}/10\n"
            f"- MTN relevance: {relevance:.2f}/1.0\n"
            f"- Matched keywords: {kw_str}\n\n"
            f"Title: {title}\nBody excerpt: {body[:600]}\n\n"
            "Ground the explanation in the keywords and entities. Do not invent facts. "
            "Return only the explanation."
        )
        resp = client.complete(prompt, max_tokens=220)
        return resp.text or None
    except Exception as exc:
        logger.debug("LLM news explanation failed: %s", exc)
        return None
