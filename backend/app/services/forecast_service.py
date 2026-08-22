"""
Event-aware forecasting service.

The previous forecast endpoint only ran a 2-quarter ARIMA and returned a flat
band. This service produces a *real-time* forecast that:

  1. Takes the ARIMA baseline for the KPI (FIN01 today).
  2. Loads recent high-relevance news risk events from the DB.
  3. Maps each event's category + severity to a directional pressure on the
     KPI (e.g. an inflation event pressures nominal revenue up; a regulatory
     fine pressures PAT down).
  4. Blends the event pressure into the baseline with a recency-decayed
     weight, so a fresh Critical event moves the forecast more than an old
     Watch event.
  5. For every forecast point, records the contributing events so the UI can
     drill down into exactly *why* the number is what it is.
  6. Optionally asks the LLM (Anthropic / HF) to write a one-sentence
     narrative tying the events to the KPI move.

The result is still anchored on the trained model (no fabricated random
walk), but it now reflects the live risk picture instead of a stale trend.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone, timedelta

from .data_loader import KPI_META

logger = logging.getLogger(__name__)

# How far back we look for events that can influence a forecast.
EVENT_LOOKBACK_DAYS = 30
# Events older than this are fully decayed (weight → 0).
EVENT_DECAY_DAYS = 21


# ── KPI → event-category pressure map ────────────────────────────────────────
# Each entry: how a 1-point severity (0-10) event in the category moves the
# KPI value, expressed as a fraction of the base value. Negative = downward.
# These are directionally calibrated from the scenario library's elasticities
# and the impact_service base exposures; they are intentionally conservative.
_KPI_EVENT_PRESSURE: dict[str, dict[str, float]] = {
    "FIN01": {  # Service Revenue (nominal GHSm)
        "strategic": -0.004,     # competitive/subscriber pressure
        "financial": 0.002,     # FX pass-through (nominal up)
        "operational": -0.003,   # outage revenue leakage
        "technological": -0.002,
        "governance": -0.005,    # fines / tariff caps
        "external": 0.003,      # inflation lifts nominal revenue
    },
    "FIN03": {  # EBITDA Margin %
        "strategic": -0.06,
        "financial": -0.04,
        "operational": -0.08,
        "technological": -0.03,
        "governance": -0.10,
        "external": -0.05,
    },
    "FIN02": {  # EBITDA
        "strategic": -0.004,
        "financial": 0.001,
        "operational": -0.003,
        "technological": -0.002,
        "governance": -0.004,
        "external": -0.002,
    },
    "SEG03": {  # MoMo Revenue
        "governance": -0.010,   # e-levy
        "strategic": -0.006,
        "technological": -0.003,
    },
    "OPS04": {  # ARPU
        "strategic": -0.004,
        "external": -0.005,    # inflation erodes real ARPU
        "financial": -0.002,
    },
    "EXT01": {"external": 0.020},   # inflation
    "EXT02": {"governance": 0.020},  # policy rate
    "EXT03": {"external": 0.025},   # cedi
}


def _kpi_pressure(kpi_id: str, category: str) -> float:
    """Fractional pressure on the KPI per point of event severity (0-10)."""
    return _KPI_EVENT_PRESSURE.get(kpi_id, {}).get(category, 0.0)


def _decay_weight(event_age_days: float) -> float:
    """Linear decay from 1.0 (today) to 0.0 (EVENT_DECAY_DAYS old)."""
    if event_age_days >= EVENT_DECAY_DAYS:
        return 0.0
    return max(0.0, 1.0 - (event_age_days / EVENT_DECAY_DAYS))


def _load_recent_events(kpi_id: str, limit: int = 50) -> list[dict]:
    """Load recent scored articles relevant to this KPI's risk surface."""
    from ..models.database import SessionLocal
    from ..models.article import Article
    from ..models.risk_score import RiskScore
    from .data_loader import load_base_case

    cutoff = datetime.now(timezone.utc) - timedelta(days=EVENT_LOOKBACK_DAYS)
    base = load_base_case().get(kpi_id, 0.0)

    with SessionLocal() as db:
        rows = (
            db.query(Article, RiskScore)
            .join(RiskScore, RiskScore.article_id == Article.id)
            .filter(RiskScore.mtn_relevance >= 0.25)
            .filter(RiskScore.severity >= 3.0)
            .filter(Article.scraped_at >= cutoff)
            .order_by(Article.scraped_at.desc())
            .limit(limit)
            .all()
        )
        events: list[dict] = []
        for article, score in rows:
            # Normalise the NLP category to the six-category taxonomy.
            from ..core.risk_taxonomy import normalise_category
            category = normalise_category(score.category)
            pressure = _kpi_pressure(kpi_id, category)
            if pressure == 0.0:
                continue  # this event category doesn't move this KPI
            scraped = article.scraped_at
            if scraped.tzinfo is None:
                scraped = scraped.replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - scraped).total_seconds() / 86400
            weight = _decay_weight(age_days)
            if weight == 0.0:
                continue
            severity = float(score.severity or 0.0)
            # Fractional move on the KPI = pressure × severity/10 × weight × relevance.
            move_frac = pressure * (severity / 10.0) * weight * float(
                score.mtn_relevance or 0.0
            )
            move_abs = move_frac * base
            events.append(
                {
                    "articleId": article.id,
                    "title": article.title,
                    "source": article.source_name,
                    "category": category,
                    "severity": round(severity, 2),
                    "mtnRelevance": round(float(score.mtn_relevance or 0.0), 3),
                    "alertTier": score.alert_tier,
                    "scrapedAt": scraped.isoformat(),
                    "ageDays": round(age_days, 1),
                    "decayWeight": round(weight, 3),
                    "pressureDirection": "down" if move_abs < 0 else "up",
                    "pressureAbs": round(move_abs, 2),
                    "pressurePct": round(move_frac * 100, 3),
                    "url": article.url,
                }
            )
        return events


def _aggregate_event_pressure(events: list[dict]) -> dict[str, float]:
    """Sum the directional pressure of all events, split by direction."""
    up = sum(e["pressureAbs"] for e in events if e["pressureDirection"] == "up")
    down = sum(abs(e["pressureAbs"]) for e in events if e["pressureDirection"] == "down")
    return {"up": round(up, 2), "down": round(down, 2), "net": round(up - down, 2)}


def _llm_narrative(kpi_id: str, baseline_points: list[dict], events: list[dict]) -> str | None:
    """Ask the LLM for a one-sentence explanation of the forecast adjustment.

    Uses the provider-agnostic LLM client with cost/latency controls.
    Returns None when no provider is configured or the call fails.
    """
    if not events:
        return None
    try:
        from ..core.llm_client import get_llm_client

        client = get_llm_client()
        kpi_name = KPI_META.get(kpi_id, {}).get("name", kpi_id)
        event_brief = "\n".join(
            f"- [{e['category']}] sev {e['severity']}: {e['title'][:90]} "
            f"(pressure {e['pressureDirection']} {abs(e['pressurePct']):.2f}%)"
            for e in events[:8]
        )
        prompt = (
            f"You are a risk analyst at MTN Ghana. A forecast for {kpi_name} ({kpi_id}) "
            f"was adjusted by these live news events:\n{event_brief}\n\n"
            "In one clear sentence, explain the dominant direction of the adjustment "
            "and the single most important driver. Do not invent numbers. "
            "Return only the sentence."
        )
        resp = client.complete(prompt, max_tokens=160)
        return resp.text or None
    except Exception as exc:
        logger.debug("LLM forecast narrative failed: %s", exc)
        return None


def _persist_forecast_adjustment(
    kpi_id: str,
    point: dict,
    events: list[dict],
    pressure: dict,
    narrative: str | None,
    llm_used: bool,
) -> None:
    """Persist a single forecast adjustment point to SQLite."""
    try:
        from ..models.database import SessionLocal
        from ..models.forecast_adjustment import ForecastAdjustment

        record = ForecastAdjustment(
            kpi_id=kpi_id,
            date=point["date"],
            baseline_p50=point.get("p50", 0.0),
            adjusted_p50=point.get("p50", 0.0),
            adjustment_abs=point.get("adjustmentAbs", 0.0),
            adjustment_pct=point.get("adjustmentPct", 0.0),
            event_count=len(events),
            aggregate_pressure=pressure,
            events=events,
            narrative=narrative,
            llm_used=llm_used,
        )
        with SessionLocal() as db:
            db.add(record)
            db.commit()
    except Exception as exc:
        logger.debug("Failed to persist forecast adjustment: %s", exc)


def build_event_adjusted_forecast(
    kpi_id: str,
    baseline_points: list[dict],
) -> dict:
    """Augment an ARIMA baseline forecast with live event pressure + drill-down.

    ``baseline_points`` is the list of daily forecast dicts from the existing
    ARIMA endpoint (date, median/p50, p05, p95, isHistorical). Each point is
    annotated with the per-point event adjustment and the contributing events.
    """
    base = load_base_case_value(kpi_id)
    events = _load_recent_events(kpi_id)
    pressure = _aggregate_event_pressure(events)

    # The net pressure is applied as a fraction of the base value, spread
    # across the forward horizon with a gentle ramp (events fully priced in
    # by ~30 days, then sustained).
    net_abs = pressure["net"]
    horizon = len(baseline_points)

    enriched: list[dict] = []
    llm_used = bool(os.environ.get("ANTHROPIC_API_KEY"))

    for i, pt in enumerate(baseline_points):
        if pt.get("isHistorical"):
            enriched.append({**pt, "events": [], "adjustmentAbs": 0.0, "adjustmentPct": 0.0})
            continue
        # Ramp: linear to full by day 30, then flat.
        ramp = min(1.0, (i + 1) / 30.0) if horizon > 0 else 1.0
        adj_abs = round(net_abs * ramp, 2)
        adj_pct = round((adj_abs / base) * 100, 3) if base else 0.0
        adjusted_median = round(pt["p50"] + adj_abs, 2)
        # Widen the band proportional to the number of active events.
        event_count_factor = 1.0 + min(0.5, len(events) * 0.02)
        spread = (pt["p95"] - pt["p05"]) / 2 if pt["p95"] and pt["p05"] else adjusted_median * 0.10
        widened = spread * event_count_factor
        enriched.append(
            {
                **pt,
                "p50": adjusted_median,
                "median": adjusted_median,
                "p05": round(adjusted_median - widened, 2),
                "p95": round(adjusted_median + widened, 2),
                "adjustmentAbs": adj_abs,
                "adjustmentPct": adj_pct,
                "events": [e for e in events if e.get("ageDays", 99) < EVENT_DECAY_DAYS],
            }
        )

    narrative = _llm_narrative(kpi_id, baseline_points, events)
    if not narrative:
        # Deterministic fallback summary.
        if events:
            top = max(events, key=lambda e: abs(e["pressureAbs"]))
            direction = "downward" if top["pressureDirection"] == "down" else "upward"
            narrative = (
                f"Adjusted {direction} by {abs(top['pressurePct']):.2f}% — "
                f"top driver: {top['title'][:80]} ({top['category']}, sev {top['severity']})."
            )
        else:
            narrative = "No qualifying live events; forecast follows the trained ARIMA baseline."

    llm_used = llm_used and narrative is not None

    # Persist sampled adjustment points to SQLite (every 7th non-zero point)
    for idx, pt in enumerate(enriched):
        if pt.get("adjustmentAbs", 0) != 0 and idx % 7 == 0:
            _persist_forecast_adjustment(kpi_id, pt, pt.get("events", []), pressure, narrative, llm_used)

    return {
        "kpiId": kpi_id,
        "baselineModel": "ARIMA(2,1,1)",
        "eventAdjusted": True,
        "eventCount": len(events),
        "aggregatePressure": pressure,
        "narrative": narrative,
        "llmUsed": llm_used,
        "points": enriched,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def load_base_case_value(kpi_id: str) -> float:
    from .data_loader import load_base_case
    return float(load_base_case().get(kpi_id, 0.0))
