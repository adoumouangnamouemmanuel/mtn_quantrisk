"""
Financial impact estimation — converts category + severity + mtn_relevance
into GHS exposure range (min / mid / max).
"""

# Base exposure in GHS (millions) per risk category — reviewed with MTN business
CATEGORY_BASE_EXPOSURE_GHSm = {
    "regulatory":   120.0,   # licence fines, tariff changes → large base
    "fx_financial": 200.0,   # Cedi moves hit entire cost base
    "competitive":   80.0,   # subscriber/ARPU pressure
    "operational":   60.0,   # network outage revenue leakage
    "political":     50.0,   # policy uncertainty
    "reputational":  40.0,   # brand damage, churn trigger
}

DEFAULT_BASE = 60.0   # fallback for unknown category


def estimate_impact(
    category: str,
    severity: float,      # 0.0–10.0
    mtn_relevance: float, # 0.0–1.0
    confidence: float,    # 0.0–1.0
) -> dict:
    """
    Returns { impact_ghs_min, impact_ghs_mid, impact_ghs_max } in GHS millions.
    Formula: mid = base × (severity/10) × mtn_relevance × confidence
    """
    base = CATEGORY_BASE_EXPOSURE_GHSm.get(category, DEFAULT_BASE)
    mid = base * (severity / 10.0) * mtn_relevance * max(confidence, 0.2)
    return {
        "impact_ghs_min": round(mid * 0.30, 2),
        "impact_ghs_mid": round(mid, 2),
        "impact_ghs_max": round(mid * 2.50, 2),
    }


def compute_alert_tier(severity: float, mtn_relevance: float) -> str | None:
    """
    Returns 'Critical' / 'Warning' / 'Watch' / None based on severity.
    Only escalates when mtn_relevance is meaningful (≥ 0.25).
    """
    if mtn_relevance < 0.25:
        return None
    if severity >= 7.5:
        return "Critical"
    if severity >= 5.0:
        return "Warning"
    if severity >= 3.0:
        return "Watch"
    return None
