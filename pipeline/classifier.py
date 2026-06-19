# pipeline/classifier.py

import re
from dataclasses import dataclass
from enum import Enum


class DocType(Enum):
    MTN_ANNUAL       = "mtn_annual"
    MTN_INTERIM      = "mtn_interim"
    MTN_GHANA_OPCO   = "mtn_ghana_annual"
    BOG_SUMMARY      = "bog_summary"
    BOG_QUARTERLY    = "bog_quarterly"
    NCA_BULLETIN     = "nca_bulletin"
    UNKNOWN          = "unknown"


@dataclass
class ClassificationResult:
    doc_type  : DocType
    confidence: float   # 0.0 – 1.0
    period    : str     # e.g. "FY2024", "H1 2025", "Q4 2024"
    year      : int
    signals   : list    # Which keywords triggered this classification


SIGNATURES = {
    DocType.MTN_ANNUAL: {
        "required"       : ["year ended 31 december"],
        "required_one_of": ["annual financial results", "annual financial statements"],
        "supporting"     : ["mtn group", "ebitda", "headline earnings", "service revenue"],
        "period_re"      : r"year ended 31 december (\d{4})"
    },
    DocType.MTN_INTERIM: {
        "required"  : ["six months ended", "interim results"],
        "supporting": ["mtn group", "ebitda", "h1", "half year", "headline earnings"],
        "period_re" : r"six months ended (\d{1,2} \w+ \d{4})"
    },
    DocType.MTN_GHANA_OPCO: {
        "required"  : ["scancom plc", "ghana stock exchange"],
        "supporting": ["mtn ghana", "ebitda", "service revenue", "momo"],
        "period_re" : r"(year ended|31 december) (\d{4})"
    },
    DocType.BOG_SUMMARY: {
        "required"  : ["bank of ghana", "summary of economic and financial data"],
        "supporting": ["monetary policy rate", "inflation", "exchange rate", "mobile money"],
        "period_re" : r"(january|february|march|april|may|june|july|august|"
                      r"september|october|november|december)\s+(\d{4})"
    },
    DocType.BOG_QUARTERLY: {
        "required"  : ["bank of ghana", "quarterly statistical bulletin"],
        "supporting": ["deposit money banks", "monetary survey", "fiscal operations"],
        "period_re" : r"quarter (one|two|three|four)[,\s]+(\d{4})"
    },
    DocType.NCA_BULLETIN: {
        "required"  : ["national communications authority", "statistical bulletin"],
        "supporting": ["mobile voice", "mtn", "market share", "data penetration"],
        "period_re" : r"(q[1-4])\s+(\d{4})"
    }
}


def needs_manual_review(result: ClassificationResult) -> bool:
    """True when confidence is too low to proceed without human verification."""
    return result.doc_type == DocType.UNKNOWN or result.confidence < 0.4


def extract_text_sample(pdf_path: str, max_chars: int = 3000) -> str:
    """Extract the first ~max_chars of text from a PDF for classification."""
    import pdfplumber  # type: ignore[import]

    chunks: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text:
                chunks.append(text)
            if sum(len(c) for c in chunks) >= max_chars:
                break
    return "\n".join(chunks)[:max_chars]


def classify_pdf(text_sample: str) -> ClassificationResult:
    """
    Classify based on first ~3000 chars of extracted text.
    Required keywords must ALL be present. Supporting keywords add confidence.
    If confidence < 0.4, flag for manual review - don't proceed blindly.
    """
    text_lower = text_sample.lower()
    best_type, best_score, best_signals, best_period = DocType.UNKNOWN, 0, [], "unknown"

    for doc_type, sig in SIGNATURES.items():
        if not all(kw in text_lower for kw in sig["required"]):
            continue
        one_of = sig.get("required_one_of", [])
        if one_of and not any(kw in text_lower for kw in one_of):
            continue
        signals = list(sig["required"])
        if one_of:
            matched = next(kw for kw in one_of if kw in text_lower)
            signals.append(matched)
        score   = len(sig["required"]) * 2 + (2 if one_of else 0)
        for kw in sig["supporting"]:
            if kw.lower() in text_lower:
                signals.append(kw)
                score += 1
        if score > best_score:
            best_score, best_type, best_signals = score, doc_type, signals
            m = re.search(sig["period_re"], text_lower)
            if m:
                best_period = m.group(0)

    confidence = min(best_score / 10.0, 1.0)
    year_m     = re.search(r"(20\d{2})", best_period)
    year       = int(year_m.group(1)) if year_m else 0

    return ClassificationResult(best_type, confidence, best_period, year, best_signals)


def classify_pdf_file(pdf_path: str) -> ClassificationResult:
    """Classify a PDF by extracting its opening text sample."""
    return classify_pdf(extract_text_sample(pdf_path))
