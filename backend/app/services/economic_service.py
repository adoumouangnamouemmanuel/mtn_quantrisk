"""
Ghana macroeconomic data via World Bank Open Data API.
Completely free — no API key required.
Data is cached in memory for 6 hours to avoid hammering the API.

Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
"""

import logging
import re
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

_CACHE: dict = {}
_CACHE_TTL = 6 * 3600  # 6 hours

_WB_BASE = "https://api.worldbank.org/v2/country/GH/indicator"
_GSS_URL = "https://www.statsghana.gov.gh/"
_BOG_FX_URL = "https://www.bog.gov.gh/treasury-and-the-markets/daily-interbank-fx-rates/"
_MARKET_FX_URL = "https://open.er-api.com/v6/latest/USD"
_HEADERS = {"User-Agent": "MTN-Quantrisk/1.0 (+official macro dashboard)"}

# (indicator_code, label, unit, description)
_INDICATORS = [
    ("FP.CPI.TOTL.ZG",  "inflation",       "% annual",    "CPI inflation — annual %"),
    ("NY.GDP.MKTP.KD.ZG","gdp_growth",     "% annual",    "GDP growth — annual %"),
    ("PA.NUS.FCRF",      "fx_usd_ghs",     "GHS per USD", "Official exchange rate LCU per USD"),
    ("SL.UEM.TOTL.ZS",  "unemployment",    "% labor",     "Unemployment % of total labor force"),
    # Ghana has no observations for GC.DOD.TOTL.GD.ZS. Debt service is the
    # available annual World Bank sovereign debt-burden series for Ghana.
    ("DT.TDS.DPPG.GN.ZS","debt_service", "% GNI",       "Public and publicly guaranteed external debt service % of GNI"),
    ("BX.KLT.DINV.WD.GD.ZS","fdi_inflows","% GDP",       "Foreign direct investment net inflows % GDP"),
]


def _fetch_indicator(code: str, history_years: int = 8) -> list[dict]:
    """Fetch the latest non-null observations for one Ghana WB indicator."""
    try:
        import requests
        url = f"{_WB_BASE}/{code}"
        # An explicit date range is safer than ``mrv`` for lagging indicators:
        # recent World Bank rows may exist but contain null values.
        current_year = datetime.now(timezone.utc).year
        resp = requests.get(
            url,
            params={"format": "json", "date": f"2000:{current_year}", "per_page": 100},
            timeout=15, headers=_HEADERS,
        )
        if resp.status_code != 200:
            logger.warning("World Bank returned HTTP %s for %s", resp.status_code, code)
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
        return sorted(result, key=lambda x: x["year"])[-history_years:]
    except Exception as exc:
        logger.warning("World Bank fetch failed for %s: %s", code, exc)
        return []


def _fetch_gss_current() -> dict[str, dict]:
    """Read current CPI, quarterly GDP and unemployment from the GSS homepage."""
    try:
        import requests
        from bs4 import BeautifulSoup

        response = requests.get(_GSS_URL, timeout=25, headers=_HEADERS)
        response.raise_for_status()
        text = " ".join(BeautifulSoup(response.text, "html.parser").stripped_strings)
        patterns = {
            "inflation": r"CPI\s+Inflation\(YoY\)\s+(-?\d+(?:\.\d+)?)%\s+([A-Za-z]+\s+20\d{2})",
            "gdp_growth": r"GDP\s+Growth\s+by\s+Production\s+Quarterly\s+(-?\d+(?:\.\d+)?)%\s+(20\d{2}\s+Q[1-4])",
            "unemployment": r"UNEMP\s+Unemployment\s+Rate\s+(-?\d+(?:\.\d+)?)%\s+GSS\s+LFS\s*.\s*(Q[1-4]\s+20\d{2})",
        }
        result: dict[str, dict] = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                period = match.group(2)
                result[key] = {
                    "latest": round(float(match.group(1)), 3),
                    "period": period,
                    "year": int(re.search(r"20\d{2}", period).group()),
                    "source": "Ghana Statistical Service",
                    "sourceUrl": _GSS_URL,
                    "frequency": "Monthly" if key == "inflation" else "Quarterly",
                }
        return result
    except Exception as exc:
        logger.warning("GSS current-data fetch failed: %s", exc)
        return {}


def _fetch_bog_fx() -> dict | None:
    """Read the latest verified USD/GHS mid-rate from Bank of Ghana."""
    try:
        import requests
        from bs4 import BeautifulSoup

        response = requests.get(_BOG_FX_URL, timeout=25, headers=_HEADERS)
        response.raise_for_status()
        text = " ".join(BeautifulSoup(response.text, "html.parser").stripped_strings)
        match = re.search(
            r"(\d{1,2}\s+[A-Za-z]{3}\s+20\d{2})\s+US\s+Dollar\s+USDGHS\s+"
            r"\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s+(\d+(?:\.\d+)?)",
            text,
            flags=re.IGNORECASE,
        )
        if not match:
            return None
        value = round(float(match.group(2)), 4)
        if not 1 <= value <= 100:
            raise ValueError(f"implausible USD/GHS rate {value}")
        return {
            "latest": value,
            "period": match.group(1),
            "year": int(match.group(1)[-4:]),
            "source": "Bank of Ghana",
            "sourceUrl": _BOG_FX_URL,
            "frequency": "Daily",
        }
    except Exception as exc:
        logger.warning("Bank of Ghana FX fetch failed: %s", exc)
        return None


def _fetch_market_fx() -> dict | None:
    """Fallback current USD/GHS market reference rate (daily, keyless)."""
    try:
        import requests

        response = requests.get(_MARKET_FX_URL, timeout=15, headers=_HEADERS)
        response.raise_for_status()
        payload = response.json()
        value = round(float(payload.get("rates", {}).get("GHS")), 4)
        if payload.get("result") != "success" or not 1 <= value <= 100:
            raise ValueError("invalid USD/GHS market-rate response")
        timestamp = int(payload.get("time_last_update_unix") or 0)
        observed = datetime.fromtimestamp(timestamp, timezone.utc) if timestamp else datetime.now(timezone.utc)
        return {
            "latest": value,
            "period": observed.strftime("%d %b %Y"),
            "year": observed.year,
            "source": "ExchangeRate-API market reference",
            "sourceUrl": "https://www.exchangerate-api.com/",
            "frequency": "Daily",
            "description": "Current USD/GHS market reference rate; Bank of Ghana preferred when available",
        }
    except Exception as exc:
        logger.warning("Current market FX fetch failed: %s", exc)
        return None


def get_ghana_economics(force_refresh: bool = False) -> dict:
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
    if not force_refresh and _CACHE.get("data") and now - _CACHE.get("fetched_at", 0) < _CACHE_TTL:
        return _CACHE["data"]

    indicators: dict = {}
    # Limit concurrency to avoid a six-request burst while keeping a forced
    # refresh from blocking for several consecutive upstream timeouts.
    with ThreadPoolExecutor(max_workers=3) as pool:
        histories = list(pool.map(lambda item: _fetch_indicator(item[0], history_years=8), _INDICATORS))

    for (code, key, unit, desc), history in zip(_INDICATORS, histories):
        if history:
            latest = history[-1]
            indicators[key] = {
                "latest":  latest["value"],
                "year":    latest["year"],
                "unit":    unit,
                "description": desc,
                "history": history,
                "period": str(latest["year"]),
                "source": "World Bank Open Data",
                "sourceUrl": "https://data.worldbank.org/country/ghana",
                "frequency": "Annual",
            }
        else:
            # A partial upstream failure must not erase a previously good card.
            stale = _CACHE.get("data", {}).get("indicators", {}).get(key)
            indicators[key] = stale or {
                "latest": None, "year": None, "unit": unit,
                "description": desc, "history": [],
                "period": None, "source": "World Bank Open Data",
                "sourceUrl": "https://data.worldbank.org/country/ghana",
                "frequency": "Annual",
            }

    current = _fetch_gss_current()
    current_fx = _fetch_bog_fx() or _fetch_market_fx()
    if current_fx:
        current["fx_usd_ghs"] = current_fx
    for key, override in current.items():
        if key in indicators:
            indicators[key].update(override)

    result = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "source": "Ghana Statistical Service, Bank of Ghana & World Bank Open Data",
        "country": "Ghana",
        "indicators": indicators,
    }
    available = sum(indicator["latest"] is not None for indicator in indicators.values())
    if available:
        _CACHE["data"] = result
        _CACHE["fetched_at"] = now
    elif _CACHE.get("data"):
        logger.warning("World Bank refresh returned no observations; serving stale cache")
        return _CACHE["data"]
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
    fx_history = inds.get("fx_usd_ghs", {}).get("history", [])
    fx_frequency = inds.get("fx_usd_ghs", {}).get("frequency")

    # Simple rule-based risk signals
    inflation_risk = (
        "Unavailable" if inflation is None
        else "Critical" if inflation > 20
        else "Warning" if inflation > 12
        else "Watch" if inflation > 8
        else "Normal"
    )
    growth_risk = (
        "Unavailable" if gdp is None
        else "Critical" if gdp < 0
        else "Warning" if gdp < 2
        else "Normal"
    )
    # Only compare observations of the same frequency. A daily BoG value must
    # not be compared with the previous annual World Bank observation.
    previous_fx = fx_history[-2]["value"] if fx_frequency == "Annual" and len(fx_history) > 1 else None
    fx_change = ((fx / previous_fx) - 1) * 100 if fx is not None and previous_fx else None
    fx_risk = (
        "Unavailable" if fx is None or fx_change is None
        else "Critical" if fx_change > 20
        else "Warning" if fx_change > 10
        else "Watch" if fx_change > 5
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
        "fx_risk":        fx_risk,
        "summary":        " | ".join(parts) if parts else "World Bank data unavailable",
        "raw": data,
    }
