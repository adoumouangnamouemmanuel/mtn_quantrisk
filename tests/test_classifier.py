# tests/test_classifier.py

import pytest

from pipeline.classifier import (
    DocType,
    classify_pdf,
    needs_manual_review,
)


MTN_ANNUAL_TEXT = """
MTN Group Limited
Unaudited condensed consolidated interim annual financial results
for the year ended 31 December 2024

MTN Group is pleased to present its annual financial results.
Service revenue grew strongly across our markets. EBITDA margin
remained robust. Headline earnings per share increased year-on-year.
"""

MTN_INTERIM_TEXT = """
MTN Group Limited
Condensed consolidated interim results
for the six months ended 30 June 2025

MTN Group reports its H1 2025 interim results.
EBITDA increased across key markets. Half year service revenue
grew with headline earnings improving on the prior period.
"""

MTN_GHANA_OPCO_TEXT = """
Scancom PLC (MTN Ghana)
Annual report filed with the Ghana Stock Exchange
for the year ended 31 December 2024

MTN Ghana service revenue and MoMo revenue both grew.
EBITDA margin remained strong in our largest opco market.
"""

BOG_SUMMARY_TEXT = """
Bank of Ghana
Summary of Economic and Financial Data
January 2025

Monetary policy rate held at 28.0%. Inflation declined to 5.4%.
Exchange rate averaged 11.6 GHS/USD. Mobile money transactions
continued to expand across the financial system.
"""

BOG_QUARTERLY_TEXT = """
Bank of Ghana
Quarterly Statistical Bulletin
Quarter Four, 2024

Deposit money banks reported stable liquidity. Monetary survey
data shows broad money growth. Fiscal operations remained within
target for the reporting quarter.
"""

NCA_BULLETIN_TEXT = """
National Communications Authority
Statistical Bulletin
Q4 2024

Mobile voice subscriptions grew. MTN maintained market share leadership.
Data penetration increased across all mobile network operators.
"""


@pytest.mark.parametrize(
    "text,expected_type,expected_year,min_confidence",
    [
        (MTN_ANNUAL_TEXT, DocType.MTN_ANNUAL, 2024, 0.6),
        (MTN_INTERIM_TEXT, DocType.MTN_INTERIM, 2025, 0.6),
        (MTN_GHANA_OPCO_TEXT, DocType.MTN_GHANA_OPCO, 2024, 0.6),
        (BOG_SUMMARY_TEXT, DocType.BOG_SUMMARY, 2025, 0.6),
        (BOG_QUARTERLY_TEXT, DocType.BOG_QUARTERLY, 2024, 0.6),
        (NCA_BULLETIN_TEXT, DocType.NCA_BULLETIN, 2024, 0.6),
    ],
    ids=[
        "mtn_annual",
        "mtn_interim",
        "mtn_ghana_opco",
        "bog_summary",
        "bog_quarterly",
        "nca_bulletin",
    ],
)
def test_classify_known_document_types(text, expected_type, expected_year, min_confidence):
    result = classify_pdf(text)

    assert result.doc_type == expected_type
    assert result.confidence >= min_confidence
    assert result.year == expected_year
    assert result.signals
    assert not needs_manual_review(result)


def test_classify_unknown_document():
    result = classify_pdf("Generic corporate brochure with no matching keywords.")

    assert result.doc_type == DocType.UNKNOWN
    assert result.confidence == 0.0
    assert result.year == 0
    assert needs_manual_review(result)


def test_classify_low_confidence_partial_match():
    # Only one required keyword present for MTN annual — should not match
    result = classify_pdf("annual financial results without the december period marker.")

    assert result.doc_type == DocType.UNKNOWN
    assert needs_manual_review(result)


def test_classify_prefers_stronger_signature():
    # Contains MTN Group supporting terms but should still resolve to BoG summary
    result = classify_pdf(BOG_SUMMARY_TEXT + "\nMTN Group inflation commentary.")

    assert result.doc_type == DocType.BOG_SUMMARY
    assert result.year == 2025


def test_classify_mtn_annual_financial_statements_variant():
    text = """
    MTN Group Limited
    Annual Financial Statements
    for the year ended 31 December 2025
    """
    result = classify_pdf(text)

    assert result.doc_type == DocType.MTN_ANNUAL
    assert result.year == 2025
    assert result.confidence >= 0.4


def test_classify_extracts_period_string():
    result = classify_pdf(MTN_ANNUAL_TEXT)

    assert "2024" in result.period
    assert "year ended 31 december" in result.period
