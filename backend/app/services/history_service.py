"""
Generates deterministic historical time-series anchored to real base-case values.

Strategy: grow a relative index with seeded random noise, then scale the entire
series so the final point equals the actual FY25 base-case value from the CSV.
That way the charts always end exactly on the real number while looking realistic.
"""
import random
from datetime import date
from .data_loader import load_base_case, FRONTEND_KPIS

# KPIs where higher = worse (they spiked UP during FY22 Ghana macro crisis)
_CRISIS_SPIKE = {"EXT01", "EXT02", "EXT03"}
# KPIs where FY22 was a stress period (dipped)
_CRISIS_DIP = {"FIN01", "FIN02", "FIN03", "FIN04", "FIN05", "SEG01", "SEG03"}


def _seed(kpi_id: str, suffix: str) -> int:
    return abs(hash(kpi_id + suffix)) % (2**31)


def get_quarterly(kpi_id: str) -> list:
    """
    Returns 24 quarterly data points: FY20Q1 → FY25Q4.
    Final value = real base-case FY25 value.
    """
    base = load_base_case()
    val = float(base.get(kpi_id, 0.0))
    if val == 0.0:
        return []

    rng = random.Random(_seed(kpi_id, "quarterly"))
    current = 0.50  # relative index starts at 50% of final

    raw: list[tuple[str, float]] = []

    for year in range(2020, 2026):
        for q in range(1, 5):
            # FY22 macro crisis inflection (Q3-Q4 2022)
            if year == 2022 and q in (3, 4):
                if kpi_id in _CRISIS_SPIKE:
                    current *= rng.uniform(1.20, 1.45)
                elif kpi_id in _CRISIS_DIP:
                    current *= rng.uniform(0.80, 0.90)

            # Gradual recovery in FY23
            if year == 2023 and kpi_id in _CRISIS_DIP:
                current *= rng.uniform(1.00, 1.06)
            elif year == 2023 and kpi_id in _CRISIS_SPIKE:
                current *= rng.uniform(0.96, 1.02)  # easing
            else:
                current *= rng.uniform(0.97, 1.07)

            raw.append((f"FY{str(year)[2:]}Q{q}", current))

    # Scale so last point = real base case value
    scale = val / raw[-1][1]
    return [
        {"quarter": lbl, "value": float(round(v * scale, 4))}
        for lbl, v in raw
    ]


def _month_label(end_date: date, months_back: int) -> str:
    """Return 'Jan 2023' style label for (end_date - months_back months)."""
    total_months = end_date.year * 12 + (end_date.month - 1) - months_back
    y, m = divmod(total_months, 12)
    return date(y, m + 1, 1).strftime("%b %Y")


def get_monthly(kpi_id: str, n_months: int = 36) -> list:
    """
    Returns n_months of monthly data ending at Dec 2025.
    Final value = real base-case FY25 value.
    """
    base = load_base_case()
    val = float(base.get(kpi_id, 0.0))
    if val == 0.0:
        return []

    rng = random.Random(_seed(kpi_id, "monthly"))
    current = 0.82  # start at 82% of final

    raw: list[float] = []
    end = date(2025, 12, 1)

    for i in range(n_months):
        # EXT KPIs were elevated in early window (FY22-23 crisis)
        if kpi_id in _CRISIS_SPIKE and i < 15:
            current *= rng.uniform(1.001, 1.025)
        elif kpi_id in _CRISIS_DIP and i < 10:
            current *= rng.uniform(0.985, 1.010)
        else:
            current *= rng.uniform(0.985, 1.030)
        raw.append(current)

    # Scale so last point = real base case
    scale = val / raw[-1]
    labels = [_month_label(end, n_months - 1 - i) for i in range(n_months)]

    return [
        {"month": lbl, "value": float(round(raw[i] * scale, 4))}
        for i, lbl in enumerate(labels)
    ]
