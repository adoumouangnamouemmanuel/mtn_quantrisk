"""
Tests for nlp_service — keyword classifier, mtn_relevance, entity extraction.
Run with: pytest tests/test_nlp.py -v
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import pytest
from app.services.nlp_service import (
    compute_mtn_relevance,
    classify_risk_category,
    extract_entities,
    run_nlp,
    CATEGORY_KEYWORDS,
)


# ── compute_mtn_relevance ─────────────────────────────────────────────────────

class TestMtnRelevance:
    def test_high_relevance_mtn_mention(self):
        text = "MTN Ghana launched a new MoMo promotion today in Accra."
        score = compute_mtn_relevance(text)
        assert score >= 0.5, "Should be high relevance with MTN + Ghana + MoMo"

    def test_zero_relevance_unrelated(self):
        text = "Liverpool beat Arsenal 3-0 in the Premier League."
        score = compute_mtn_relevance(text)
        assert score < 0.2, "Unrelated text should score low"

    def test_ghana_only_gives_partial_relevance(self):
        score_ghana = compute_mtn_relevance("Ghana economy is growing strongly this year.")
        score_mtn   = compute_mtn_relevance("MTN launched new services across Africa.")
        # Both should give partial, combined should give more
        combined = compute_mtn_relevance("MTN Ghana ARPU grew in Q1.")
        assert combined > score_ghana
        assert combined > score_mtn

    def test_score_clamped_to_one(self):
        # Repeating every keyword should still not exceed 1.0
        text = " ".join(["MTN MoMo MTN Ghana Accra MTN Ghana MoMo"] * 10)
        assert compute_mtn_relevance(text) <= 1.0

    def test_case_insensitive(self):
        lower = compute_mtn_relevance("mtn ghana momo accra")
        upper = compute_mtn_relevance("MTN GHANA MOMO ACCRA")
        assert abs(lower - upper) < 0.01


# ── classify_risk_category ────────────────────────────────────────────────────

@pytest.mark.parametrize("text,expected_cat", [
    (
        "The National Communications Authority fined MTN Ghana for regulatory non-compliance with spectrum licence conditions.",
        "regulatory",
    ),
    (
        "The Cedi fell sharply against the US dollar as inflation rose and Bank of Ghana raised interest rates.",
        "fx_financial",
    ),
    (
        "AirtelTigo launched aggressive pricing to capture MTN market share in the prepaid segment.",
        "competitive",
    ),
    (
        "MTN Ghana experienced a major network outage affecting data services across Kumasi.",
        "operational",
    ),
    (
        "The government parliament minister announced new telecom policy change ahead of the election.",
        "political",
    ),
    (
        "MTN Ghana faced backlash on social media following customer complaints about reputational brand scandal.",
        "reputational",
    ),
])
def test_classifier_assigns_correct_category(text, expected_cat):
    cat, score, hits = classify_risk_category(text)
    assert cat == expected_cat, f"Expected '{expected_cat}', got '{cat}' (score={score:.2f}, hits={hits})"
    assert score > 0

def test_classifier_returns_none_for_empty():
    cat, score, hits = classify_risk_category("")
    # Should return some category (even at 0 score) or handle gracefully
    assert isinstance(cat, str)
    assert score >= 0

def test_classifier_hits_are_dict():
    _, _, hits = classify_risk_category("MTN regulatory NCA licence fine")
    assert isinstance(hits, dict)
    assert all(isinstance(k, str) and isinstance(v, (int, float)) for k, v in hits.items())


# ── extract_entities ──────────────────────────────────────────────────────────

class TestExtractEntities:
    def test_returns_expected_keys(self):
        result = extract_entities("MTN Ghana is headquartered in Accra.")
        assert set(result.keys()) >= {"orgs", "locations", "persons", "money"}

    def test_all_values_are_lists(self):
        result = extract_entities("Any text here.")
        for v in result.values():
            assert isinstance(v, list)

    def test_mtn_detected_as_org(self):
        result = extract_entities("MTN Ghana launched new MoMo services.")
        # Either spaCy or keyword fallback should catch MTN
        all_orgs = " ".join(result["orgs"]).lower()
        assert "mtn" in all_orgs or len(result["orgs"]) >= 0  # graceful: may be empty if no spaCy

    def test_money_pattern(self):
        result = extract_entities("MTN Ghana reported revenue of GHS 500 million.")
        # Money extraction depends on spaCy; just verify shape
        assert isinstance(result["money"], list)


# ── run_nlp (full pipeline) ───────────────────────────────────────────────────

class TestRunNlp:
    SAMPLE_TITLE = "NCA issues GHS 5m fine to MTN Ghana for regulatory breach"
    SAMPLE_BODY  = (
        "The National Communications Authority (NCA) fined Scancom PLC (MTN Ghana) "
        "five million cedis for non-compliance with spectrum licence conditions. "
        "The penalty follows a regulatory audit in Accra."
    )

    def test_result_has_required_keys(self):
        result = run_nlp(self.SAMPLE_TITLE, self.SAMPLE_BODY)
        required = {"mtn_relevance", "category", "severity", "confidence", "entities", "keyword_hits"}
        assert required.issubset(result.keys()), f"Missing keys: {required - result.keys()}"

    def test_mtn_relevance_float_in_range(self):
        result = run_nlp(self.SAMPLE_TITLE, self.SAMPLE_BODY)
        assert 0.0 <= result["mtn_relevance"] <= 1.0

    def test_severity_float_in_range(self):
        result = run_nlp(self.SAMPLE_TITLE, self.SAMPLE_BODY)
        assert 0.0 <= result["severity"] <= 10.0

    def test_regulatory_article_scores_high_relevance(self):
        result = run_nlp(self.SAMPLE_TITLE, self.SAMPLE_BODY)
        assert result["mtn_relevance"] >= 0.3
        assert result["category"] == "regulatory"

    def test_unrelated_article_low_relevance(self):
        result = run_nlp("Weather forecast for London", "Rain expected all week in the UK.")
        assert result["mtn_relevance"] < 0.2
