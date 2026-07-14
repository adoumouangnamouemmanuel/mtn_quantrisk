"""
NLP service — spaCy NER + keyword-based risk classifier.
spaCy is optional: if not installed/model not downloaded, falls back to keyword-only.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# ── spaCy (optional) ──────────────────────────────────────────────────────────

_nlp = None

def _get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy en_core_web_sm loaded")
        except Exception as exc:
            logger.warning("spaCy not available (%s) — using keyword-only NER", exc)
            _nlp = False
    return _nlp if _nlp else None


# ── MTN relevance ─────────────────────────────────────────────────────────────

MTN_KEYWORDS = [
    "MTN", "MoMo", "MTN Ghana", "MTN Group", "mobile money",
    "mtn.com.gh", "MTN Nigeria", "Y'ello", "MTNN",
]

GHANA_KEYWORDS = [
    "Ghana", "Accra", "Kumasi", "Cedi", "GHS", "NCA", "Bank of Ghana",
    "BoG", "AirtelTigo", "Vodafone Ghana", "telecom Ghana",
]


def compute_mtn_relevance(text: str) -> float:
    """
    Returns 0.0–1.0 based on how many MTN/Ghana keywords appear.
    Hard minimum 0.1 for any Ghana article (we scrape Ghana-focused sources).
    """
    text_lower = text.lower()
    mtn_hits = sum(1 for kw in MTN_KEYWORDS if kw.lower() in text_lower)
    ghana_hits = sum(1 for kw in GHANA_KEYWORDS if kw.lower() in text_lower)
    # MTN hits count more than generic Ghana hits
    score = min(1.0, (mtn_hits * 0.35) + (ghana_hits * 0.1) + 0.1)
    return round(score, 3)


# ── Risk category classifier ──────────────────────────────────────────────────

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "regulatory": [
        "NCA", "licence", "license", "regulation", "regulatory", "compliance",
        "fine", "spectrum", "tariff", "mandate", "authority", "NCA Ghana",
        "Communications Authority", "telecom regulation", "SIM registration",
        "mobile number portability", "interconnect",
    ],
    "competitive": [
        "Vodafone", "AirtelTigo", "Airtel", "Tigo", "market share",
        "subscriber loss", "competition", "competitor", "price war",
        "price cut", "promotional", "churn", "new entrant", "market leader",
    ],
    "fx_financial": [
        "cedi", "GHS", "exchange rate", "depreciation", "appreciation",
        "inflation", "interest rate", "Bank of Ghana", "BoG", "forex",
        "currency", "devaluation", "monetary policy", "IMF", "debt",
        "fiscal deficit", "GDP", "economic growth",
    ],
    "operational": [
        "outage", "network failure", "downtime", "infrastructure", "tower",
        "equipment", "maintenance", "disruption", "service interruption",
        "fibre cut", "power outage", "generator", "technical fault",
        "network upgrade", "4G", "5G rollout",
    ],
    "political": [
        "election", "government", "parliament", "minister", "ministry",
        "president", "NDC", "NPP", "political", "coup", "protest",
        "stability", "policy change", "budget", "taxation",
    ],
    "reputational": [
        "scandal", "complaint", "backlash", "protest", "controversy",
        "criticism", "social media", "reputation", "brand damage",
        "customer service", "customer dissatisfaction", "fraud", "scam",
        "data breach", "security breach",
    ],
}

CATEGORY_WEIGHTS = {
    "regulatory": 1.2,
    "fx_financial": 1.1,
    "competitive": 1.0,
    "operational": 0.9,
    "political": 0.9,
    "reputational": 0.8,
}


def classify_risk_category(text: str) -> tuple[str, float, dict]:
    """
    Returns (category, raw_score_0_to_10, keyword_hits_per_category).
    raw_score is based on keyword hits × category weight, normalised to 0–10.
    """
    text_lower = text.lower()
    hits: dict[str, int] = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw.lower() in text_lower)
        hits[cat] = count

    if not any(hits.values()):
        return "operational", 1.0, hits  # default low-signal

    scores = {cat: count * CATEGORY_WEIGHTS.get(cat, 1.0) for cat, count in hits.items()}
    best_cat = max(scores, key=lambda c: scores[c])
    raw_score = min(10.0, scores[best_cat] * 1.5)
    return best_cat, round(raw_score, 2), hits


# ── spaCy NER ─────────────────────────────────────────────────────────────────

def extract_entities(text: str) -> dict:
    """
    Returns { orgs: [...], money: [...], locations: [...], persons: [...] }
    Uses spaCy if available, otherwise keyword matching.
    """
    nlp = _get_nlp()
    if nlp:
        try:
            doc = nlp(text[:5000])  # cap at 5000 chars for speed
            return {
                "orgs":      [ent.text for ent in doc.ents if ent.label_ == "ORG"][:10],
                "money":     [ent.text for ent in doc.ents if ent.label_ == "MONEY"][:10],
                "locations": [ent.text for ent in doc.ents if ent.label_ in ("GPE", "LOC")][:10],
                "persons":   [ent.text for ent in doc.ents if ent.label_ == "PERSON"][:10],
            }
        except Exception as exc:
            logger.warning("spaCy NER failed: %s", exc)

    # Keyword fallback
    text_lower = text.lower()
    orgs = [kw for kw in ["MTN", "NCA", "Bank of Ghana", "Vodafone", "AirtelTigo", "GRA", "IMF"]
            if kw.lower() in text_lower]
    return {"orgs": orgs, "money": [], "locations": [], "persons": []}


# ── Main entry point ──────────────────────────────────────────────────────────

def run_nlp(title: str, body: str) -> dict:
    """
    Full NLP pass on an article. Returns dict ready for RiskScore creation:
    {
      mtn_relevance, category, severity, confidence, entities, keyword_hits
    }
    """
    full_text = f"{title} {body}"
    mtn_relevance = compute_mtn_relevance(full_text)
    category, severity, keyword_hits = classify_risk_category(full_text)
    entities = extract_entities(full_text)

    # Confidence = normalised keyword hit count for best category
    best_hits = keyword_hits.get(category, 0)
    confidence = min(1.0, best_hits * 0.15 + 0.2)

    return {
        "mtn_relevance": mtn_relevance,
        "category": category,
        "severity": severity,
        "confidence": round(confidence, 3),
        "entities": entities,
        "keyword_hits": keyword_hits,
    }
