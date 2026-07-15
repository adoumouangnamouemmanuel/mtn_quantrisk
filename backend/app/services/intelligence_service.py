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
from datetime import datetime, timezone, timedelta

import requests

logger = logging.getLogger(__name__)

HF_TOKEN = os.environ.get("HF_TOKEN", "")
_SUMMARISE_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"

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


def _hf_summarise(text: str) -> str:
    if not HF_TOKEN:
        return ""
    payload = {
        "inputs": text[:1200],
        "parameters": {"max_length": 130, "min_length": 40, "do_sample": False},
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
        texts = [f"{a['title']}. {a['body'][:300]}" for a in items[:5]]
        combined = " ".join(texts)[:1200]
        summary_text = _hf_summarise(combined) or _extractive_summary(
            [a["title"] for a in items]
        )
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
