"""
Daily Intelligence Briefing — LLM-powered 24-hour risk digest.
Uses facebook/bart-large-cnn via HuggingFace Inference API (free, requires HF_TOKEN).
Falls back to extractive summarisation when HF_TOKEN is not set.
Results are cached for 30 minutes to avoid hammering the HF API.
"""
import logging
import os
import re
import time
from collections import Counter
from datetime import datetime, timezone, timedelta

import requests

logger = logging.getLogger(__name__)

HF_TOKEN = os.environ.get("HF_TOKEN", "")
_SUMMARISE_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"

_CACHE: dict = {}
_CACHE_TTL = 1800  # 30 min

CATEGORY_LABELS = {
    "regulatory":   "Regulatory & Compliance",
    "fx_financial": "FX & Financial Markets",
    "competitive":  "Competitive Landscape",
    "operational":  "Network & Operations",
    "political":    "Political & Policy",
    "reputational": "Brand & Reputation",
}

CATEGORY_ICONS = {
    "regulatory":   "shield",
    "fx_financial": "trending-up",
    "competitive":  "activity",
    "operational":  "wifi",
    "political":    "globe",
    "reputational": "eye",
}


def _extractive_summary(texts: list[str]) -> str:
    """Return first meaningful sentence from each of the top 3 articles."""
    sentences = []
    for t in texts[:4]:
        parts = re.split(r"(?<=[.!?])\s+", t.strip())
        for part in parts:
            cleaned = part.strip()
            if len(cleaned) > 45:
                sentences.append(cleaned)
                break
    return " ".join(sentences[:3]) or "No significant developments in this category."


def _hf_summarise(text: str, *, max_length: int = 180, min_length: int = 70) -> str:
    if not HF_TOKEN:
        return ""
    payload = {
        # BART accepts roughly 1,024 input tokens. A 3,600-character ceiling
        # leaves room for several article extracts without overflowing the
        # model context window.
        "inputs": text[:3600],
        "parameters": {
            "max_length": max_length,
            "min_length": min_length,
            "do_sample": False,
        },
    }
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    try:
        resp = requests.post(_SUMMARISE_URL, headers=headers, json=payload, timeout=35)
        if resp.status_code == 503:
            # model loading — wait and retry once
            time.sleep(10)
            resp = requests.post(_SUMMARISE_URL, headers=headers, json=payload, timeout=35)
        if resp.ok:
            data = resp.json()
            if isinstance(data, list) and data:
                return data[0].get("summary_text", "")
    except Exception as exc:
        logger.warning("HF summarise failed: %s", exc)
    return ""


def _category_summary(items: list[dict]) -> str:
    """Build a fuller digest without forcing all category news into one summary."""
    article_texts = [
        f"{article['title']}. {article['body'][:650]}".strip()
        for article in items[:8]
    ]
    groups = (article_texts[:4], article_texts[4:8])
    paragraphs = []
    for group in groups:
        if not group:
            continue
        combined = " ".join(group)[:3600]
        paragraph = _hf_summarise(combined)
        if paragraph and paragraph not in paragraphs:
            paragraphs.append(paragraph.strip())

    summary = "\n\n".join(paragraphs)
    # Some inference responses ignore min_length. Keep the category useful by
    # supplementing a very short response with distinct source-led context.
    if len(summary.split()) < 90:
        supplement = _extractive_summary(article_texts[4:] or article_texts)
        if supplement and supplement not in summary:
            summary = f"{summary}\n\n{supplement}".strip()
    return summary or _extractive_summary(article_texts)


def get_intelligence_summary() -> dict:
    """Generate or return cached 24-hour briefing."""
    now = datetime.now(timezone.utc)
    cached = _CACHE.get("intel")
    if cached and (now - cached["at"]).total_seconds() < _CACHE_TTL:
        return cached["data"]

    since = now - timedelta(hours=24)

    from ..models.database import SessionLocal
    from ..models.article import Article
    from ..models.risk_score import RiskScore

    db = SessionLocal()
    try:
        rows = (
            db.query(Article, RiskScore)
            .outerjoin(RiskScore, RiskScore.article_id == Article.id)
            .filter(Article.scraped_at >= since)
            .order_by(RiskScore.severity.desc())
            .all()
        )
    finally:
        db.close()

    articles = [
        {
            "title": art.title,
            "body": art.body or "",
            "url": art.url,
            "source_name": art.source_name,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "category": rs.category if rs else None,
            "severity": rs.severity if rs else None,
            "alert_tier": rs.alert_tier if rs else None,
            "sentiment": rs.sentiment if rs else None,
            "impact_ghs_mid": rs.impact_ghs_mid if rs else None,
        }
        for art, rs in rows
    ]

    total = len(articles)
    tier_counts: dict[str, int] = {"Critical": 0, "Warning": 0, "Watch": 0}
    for a in articles:
        t = a.get("alert_tier")
        if t in tier_counts:
            tier_counts[t] += 1

    if tier_counts["Critical"] >= 2:
        overall_risk, risk_color = "Critical", "red"
    elif tier_counts["Critical"] >= 1 or tier_counts["Warning"] >= 3:
        overall_risk, risk_color = "Elevated", "orange"
    elif tier_counts["Warning"] >= 1:
        overall_risk, risk_color = "Moderate", "yellow"
    else:
        overall_risk, risk_color = "Normal", "green"

    headline = next(
        (a for a in articles if a.get("alert_tier") in ("Critical", "Warning")), None
    )

    by_cat: dict[str, list] = {}
    for a in articles:
        cat = a.get("category") or "other"
        by_cat.setdefault(cat, []).append(a)

    sections = []
    for cat, items in sorted(by_cat.items(), key=lambda x: -len(x[1])):
        if cat == "other":
            continue
        summary_text = _category_summary(items)
        critical_in_cat = sum(1 for a in items if a.get("alert_tier") == "Critical")
        sections.append(
            {
                "category": cat,
                "label": CATEGORY_LABELS.get(cat, cat.replace("_", " ").title()),
                "icon": CATEGORY_ICONS.get(cat, "circle"),
                "article_count": len(items),
                "critical_count": critical_in_cat,
                "summary": summary_text,
                "top_articles": [
                    {
                        "title": a["title"],
                        "source": a["source_name"],
                        "url": a["url"],
                        "tier": a["alert_tier"],
                        "severity": a["severity"],
                        "sentiment": a["sentiment"],
                        "impact_ghs_mid": a["impact_ghs_mid"],
                    }
                    for a in items[:3]
                ],
            }
        )

    result: dict = {
        "generated_at": now.isoformat(),
        "period": "last 24 hours",
        "total_articles": total,
        "tier_counts": tier_counts,
        "overall_risk": overall_risk,
        "risk_color": risk_color,
        "headline": (
            {
                "title": headline["title"],
                "source": headline["source_name"],
                "tier": headline["alert_tier"],
                "severity": headline["severity"],
                "url": headline["url"],
            }
            if headline
            else None
        ),
        "sections": sections,
        "used_llm": bool(HF_TOKEN),
    }

    _CACHE["intel"] = {"data": result, "at": now}
    return result


_TITLE_STOP_WORDS = {
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with",
    "at", "by", "from", "as", "is", "are", "was", "were", "ghana", "says",
}


def _title_tokens(title: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", title.casefold())
    return {word for word in words if len(word) > 2 and word not in _TITLE_STOP_WORDS}


def _cluster_articles(articles: list[dict]) -> list[list[dict]]:
    """Collapse syndicated and near-duplicate headlines into unique events."""
    clusters: list[list[dict]] = []
    cluster_tokens: list[set[str]] = []
    for article in sorted(articles, key=lambda item: item.get("severity") or 0, reverse=True):
        tokens = _title_tokens(article["title"])
        match_index = None
        best_score = 0.0
        for index, existing in enumerate(cluster_tokens):
            union = tokens | existing
            score = len(tokens & existing) / len(union) if union else 0.0
            if score > best_score:
                best_score = score
                match_index = index
        if match_index is not None and best_score >= 0.45:
            clusters[match_index].append(article)
            cluster_tokens[match_index] |= tokens
        else:
            clusters.append([article])
            cluster_tokens.append(tokens)
    return clusters


def _movement(current: int, previous: int) -> dict:
    change = current - previous
    return {
        "current": current,
        "previous": previous,
        "change": change,
        "direction": "up" if change > 0 else "down" if change < 0 else "flat",
    }


def get_hierarchical_intelligence_summary() -> dict:
    """Return a deduplicated executive digest for the relevant 24-hour feed."""
    now = datetime.now(timezone.utc)
    cached = _CACHE.get("hierarchical_intel")
    if cached and (now - cached["at"]).total_seconds() < _CACHE_TTL:
        return cached["data"]

    since = now - timedelta(hours=24)
    previous_since = since - timedelta(hours=24)
    from ..models.database import SessionLocal
    from ..models.article import Article
    from ..models.risk_score import RiskScore

    with SessionLocal() as db:
        rows = (
            db.query(Article, RiskScore)
            .outerjoin(RiskScore, RiskScore.article_id == Article.id)
            .filter(Article.scraped_at >= since)
            .order_by(RiskScore.severity.desc())
            .all()
        )
        previous_rows = (
            db.query(RiskScore.category)
            .join(Article, RiskScore.article_id == Article.id)
            .filter(Article.scraped_at >= previous_since, Article.scraped_at < since)
            .filter(RiskScore.mtn_relevance >= 0.2)
            .all()
        )

    raw_count = len(rows)
    relevant_articles = [
        {
            "title": article.title,
            "body": article.body or "",
            "url": article.url,
            "source_name": article.source_name,
            "published_at": article.published_at.isoformat() if article.published_at else None,
            "category": score.category,
            "severity": score.severity,
            "alert_tier": score.alert_tier,
            "sentiment": score.sentiment,
            "impact_ghs_mid": score.impact_ghs_mid,
            "mtn_relevance": score.mtn_relevance,
        }
        for article, score in rows
        if score is not None and score.mtn_relevance >= 0.2
    ]
    clusters = _cluster_articles(relevant_articles)
    current_counts = Counter(article["category"] for article in relevant_articles)
    previous_counts = Counter(category for (category,) in previous_rows)

    tier_counts = {"Critical": 0, "Warning": 0, "Watch": 0}
    for article in relevant_articles:
        if article["alert_tier"] in tier_counts:
            tier_counts[article["alert_tier"]] += 1
    if tier_counts["Critical"] >= 2:
        overall_risk, risk_color = "Critical", "red"
    elif tier_counts["Critical"] or tier_counts["Warning"] >= 3:
        overall_risk, risk_color = "Elevated", "orange"
    elif tier_counts["Warning"]:
        overall_risk, risk_color = "Moderate", "yellow"
    else:
        overall_risk, risk_color = "Normal", "green"

    by_category: dict[str, list[list[dict]]] = {}
    for cluster in clusters:
        category = cluster[0].get("category") or "other"
        if category != "other":
            by_category.setdefault(category, []).append(cluster)

    sections = []
    for category, category_clusters in sorted(
        by_category.items(), key=lambda item: -sum(len(cluster) for cluster in item[1])
    ):
        representatives = []
        for cluster in category_clusters:
            representative = dict(cluster[0])
            representative["coverage_count"] = len(cluster)
            representative["sources"] = sorted({item["source_name"] for item in cluster if item["source_name"]})
            representatives.append(representative)
        summary_text = _category_summary(representatives)
        movement = _movement(current_counts[category], previous_counts[category])
        sections.append({
            "category": category,
            "label": CATEGORY_LABELS.get(category, category.replace("_", " ").title()),
            "icon": CATEGORY_ICONS.get(category, "circle"),
            "article_count": sum(len(cluster) for cluster in category_clusters),
            "unique_event_count": len(category_clusters),
            "critical_count": sum(1 for article in relevant_articles if article["category"] == category and article["alert_tier"] == "Critical"),
            "summary": summary_text,
            "movement": movement,
            "top_articles": [
                {
                    "title": article["title"],
                    "source": article["source_name"],
                    "url": article["url"],
                    "tier": article["alert_tier"],
                    "severity": article["severity"],
                    "sentiment": article["sentiment"],
                    "impact_ghs_mid": article["impact_ghs_mid"],
                    "coverage_count": article["coverage_count"],
                    "sources": article["sources"],
                }
                for article in representatives[:3]
            ],
        })

    section_seed = " ".join(f"{section['label']}: {section['summary']}" for section in sections[:5])
    executive_summary = _hf_summarise(section_seed, max_length=220, min_length=90) if section_seed else ""
    if not executive_summary:
        themes = "; ".join(
            f"{section['label']} ({section['unique_event_count']} events)"
            for section in sections[:4]
        )
        executive_summary = (
            f"{raw_count} articles were collected in the last 24 hours. "
            f"{len(relevant_articles)} passed MTN relevance scoring and were consolidated into "
            f"{len(clusters)} unique events. Leading themes: {themes or 'no material MTN-specific themes'}."
        )

    leading_categories = [section["category"] for section in sections[:3]]
    actions = []
    if "fx_financial" in leading_categories:
        actions.append("Review FX, liquidity, pricing, and treasury exposure against today’s financial signals.")
    if "regulatory" in leading_categories or "political" in leading_categories:
        actions.append("Assign owners to assess regulatory and policy developments requiring engagement.")
    if "operational" in leading_categories:
        actions.append("Validate network resilience and incident-response readiness against operational themes.")
    if "competitive" in leading_categories or "reputational" in leading_categories:
        actions.append("Review commercial and communications responses to competitive or reputation signals.")
    if not actions:
        actions.append("Continue monitoring; no immediate escalation is indicated by the relevant 24-hour feed.")

    headline = clusters[0][0] if clusters else None
    result = {
        "generated_at": now.isoformat(),
        "period": "last 24 hours",
        "total_articles": raw_count,
        "relevant_articles": len(relevant_articles),
        "unique_events": len(clusters),
        "source_count": len({article["source_name"] for article in relevant_articles if article["source_name"]}),
        "executive_summary": executive_summary,
        "recommended_actions": actions,
        "category_movement": {
            category: _movement(current_counts[category], previous_counts[category])
            for category in set(current_counts) | set(previous_counts)
        },
        "tier_counts": tier_counts,
        "overall_risk": overall_risk,
        "risk_color": risk_color,
        "headline": ({
            "title": headline["title"],
            "source": headline["source_name"],
            "tier": headline["alert_tier"],
            "severity": headline["severity"],
            "url": headline["url"],
        } if headline else None),
        "sections": sections,
        "used_llm": bool(HF_TOKEN),
    }
    _CACHE["hierarchical_intel"] = {"data": result, "at": now}
    return result
