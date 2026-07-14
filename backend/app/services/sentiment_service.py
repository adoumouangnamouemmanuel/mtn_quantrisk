"""
Sentiment analysis — uses cardiffnlp/twitter-roberta-base-sentiment-latest via transformers.
Falls back to simple lexicon if transformers/torch not installed.
"""

import logging

logger = logging.getLogger(__name__)

_pipeline = None
_SENTIMENT_AVAILABLE = None


def _get_pipeline():
    global _pipeline, _SENTIMENT_AVAILABLE
    if _SENTIMENT_AVAILABLE is None:
        try:
            from transformers import pipeline
            _pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                truncation=True,
                max_length=512,
            )
            _SENTIMENT_AVAILABLE = True
            logger.info("Sentiment model loaded (cardiffnlp/twitter-roberta-base-sentiment-latest)")
        except Exception as exc:
            _SENTIMENT_AVAILABLE = False
            logger.warning("Transformers sentiment not available (%s) — using lexicon fallback", exc)
    return _pipeline


# ── Lexicon fallback ──────────────────────────────────────────────────────────

_POSITIVE_WORDS = [
    "growth", "profit", "revenue", "record", "increase", "expand", "launch",
    "award", "partnership", "investment", "success", "improve", "strong",
    "positive", "gain", "rise", "milestone", "achieve", "approve",
]
_NEGATIVE_WORDS = [
    "decline", "loss", "drop", "fall", "crisis", "fine", "penalty", "outage",
    "failure", "complaint", "concern", "risk", "threat", "breach", "hack",
    "reduce", "cut", "lay off", "debt", "scandal", "protest", "ban",
]


def _lexicon_sentiment(text: str) -> dict:
    text_lower = text.lower()
    pos = sum(1 for w in _POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in _NEGATIVE_WORDS if w in text_lower)
    if pos > neg:
        label, conf = "positive", min(0.9, 0.5 + pos * 0.05)
    elif neg > pos:
        label, conf = "negative", min(0.9, 0.5 + neg * 0.05)
    else:
        label, conf = "neutral", 0.6
    return {"sentiment": label, "sentiment_confidence": round(conf, 3)}


# ── Main entry point ──────────────────────────────────────────────────────────

def run_sentiment(text: str) -> dict:
    """
    Returns { sentiment: 'positive'|'neutral'|'negative', sentiment_confidence: float }
    """
    pipe = _get_pipeline()
    if pipe:
        try:
            result = pipe(text[:512], truncation=True)[0]
            label_map = {
                "LABEL_0": "negative",
                "LABEL_1": "neutral",
                "LABEL_2": "positive",
                "negative": "negative",
                "neutral": "neutral",
                "positive": "positive",
            }
            label = label_map.get(result["label"].upper(), result["label"].lower())
            return {
                "sentiment": label,
                "sentiment_confidence": round(result["score"], 3),
            }
        except Exception as exc:
            logger.warning("Sentiment inference failed: %s", exc)

    return _lexicon_sentiment(text)
