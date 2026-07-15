"""
Ghana macroeconomic data via World Bank Open Data API.
Completely free — no API key required.
Data is cached in memory for 6 hours to avoid hammering the API.

Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
"""

import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

_CACHE: dict = {}
_CACHE_TTL = 6 * 3600  # 6 hours

_WB_BASE = "https://api.worldbank.org/v2/country/GH/indicator"

# (indicator_code, label, unit, description)
_INDICATORS = [
    ("FP.CPI.TOTL.ZG",  "inflation",       "% annual",    "CPI inflation — annual %"),
    ("NY.GDP.MKTP.KD.ZG","gdp_growth",     "% annual",    "GDP growth — annual %"),
    ("PA.NUS.FCRF",      "fx_usd_ghs",     "GHS per USD", "Official exchange rate LCU per USD"),
    ("SL.UEM.TOTL.ZS",  "unemployment",    "% labor",     "Unemployment % of total labor force"),
    ("GC.DOD.TOTL.GD.ZS","public_debt",    "% GDP",       "Central government debt % GDP"),
    ("BX.KLT.DINV.WD.GD.ZS","fdi_inflows","% GDP",       "Foreign direct investment net inflows % GDP"),
]


def _fetch_indicator(code: str, mrv: int = 5) -> list[dict]:
    """Fetch last `mrv` observations for a single WB indicator for Ghana."""
    try:
        import requests
        url = f"{_WB_BASE}/{code}"
        resp = requests.get(url, params={"format": "json", "mrv": mrv, "per_page": mrv}, timeout=25)
        if resp.status_code != 200:
            return []
        payload = resp.json()
        if not isinstance(payload, list) or len(payload) < 2:
            return []
        rows = payload[1] or []
        result = []
        for row in rows:
            val = row.get("value")
            if val is None:
                continue
            result.append({
                "year":  int(row["date"]),
                "value": round(float(val), 3),
            })
        return sorted(result, key=lambda x: x["year"])
    except Exception as exc:
        logger.warning("World Bank fetch failed for %s: %s", code, exc)
        return []


def get_ghana_economics() -> dict:
    """
    Returns latest Ghana macro indicators from the World Bank.
    Result is cached for 6 hours. Falls back to empty dict per indicator on failure.

    Shape:
    {
      "lastUpdated": "ISO datetime",
      "source": "World Bank Open Data",
      "indicators": {
        "inflation":    { "latest": 8.2, "year": 2023, "unit": "% annual", "history": [...] },
        "gdp_growth":   { ... },
        "fx_usd_ghs":   { ... },
        "unemployment": { ... },
        "public_debt":  { ... },
        "fdi_inflows":  { ... },
      }
    }
    """
    now = time.time()
    if _CACHE.get("data") and now - _CACHE.get("fetched_at", 0) < _CACHE_TTL:
        return _CACHE["data"]

    indicators: dict = {}
    for code, key, unit, desc in _INDICATORS:
        history = _fetch_indicator(code, mrv=8)
        if history:
            latest = history[-1]
            indicators[key] = {
                "latest":  latest["value"],
                "year":    latest["year"],
                "unit":    unit,
                "description": desc,
                "history": history,
            }
        else:
            indicators[key] = {"latest": None, "year": None, "unit": unit, "description": desc, "history": []}

    result = {
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "source": "World Bank Open Data (api.worldbank.org)",
        "country": "Ghana",
        "indicators": indicators,
    }
    _CACHE["data"] = result
    _CACHE["fetched_at"] = now
    logger.info("Ghana macro data refreshed from World Bank")
    return result


def get_risk_context_from_economics() -> dict:
    """
    Converts latest Ghana macro data into risk context signals for the dashboard.
    Returns { inflation_risk, fx_risk, growth_risk, summary_text }
    """
    data = get_ghana_economics()
    inds = data.get("indicators", {})

    inflation = inds.get("inflation", {}).get("latest")
    gdp       = inds.get("gdp_growth", {}).get("latest")
    fx        = inds.get("fx_usd_ghs", {}).get("latest")

    # Simple rule-based risk signals
    inflation_risk = (
        "Critical" if inflation and inflation > 20
        else "Warning" if inflation and inflation > 12
        else "Watch" if inflation and inflation > 8
        else "Normal"
    )
    growth_risk = (
        "Critical" if gdp is not None and gdp < 0
        else "Warning" if gdp is not None and gdp < 2
        else "Normal"
    )

    parts = []
    if inflation:
        parts.append(f"Ghana inflation {inflation:.1f}%")
    if gdp is not None:
        parts.append(f"GDP growth {gdp:.1f}%")
    if fx:
        parts.append(f"GHS/USD {fx:.2f}")

    return {
        "inflation_risk": inflation_risk,
        "growth_risk":    growth_risk,
        "summary":        " | ".join(parts) if parts else "World Bank data unavailable",
        "raw": data,
    }
