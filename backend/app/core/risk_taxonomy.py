"""
Shared risk taxonomy for the MTN QuantRisk platform.

Six canonical categories used across the NLP classifier, the KPI meta, the
scenario engine and the API responses. Keeping this in one place lets the
frontend import a mirror (`frontend/lib/riskTaxonomy.ts`) and stay in sync.

Legacy category strings are normalised here so callers don't need to know the
history.
"""
from __future__ import annotations

from enum import Enum


class RiskCategory(str, Enum):
    STRATEGIC = "strategic"
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    TECHNOLOGICAL = "technological"
    GOVERNANCE = "governance"
    EXTERNAL = "external"


RISK_CATEGORIES = [c.value for c in RiskCategory]


RISK_CATEGORY_META: dict[str, dict] = {
    RiskCategory.STRATEGIC.value: {
        "label": "Strategic",
        "short": "STR",
        "icon": "Target",
        "color": "#FFD000",
        "description": "Market position, competitive dynamics, subscriber growth, ARPU and product strategy.",
    },
    RiskCategory.FINANCIAL.value: {
        "label": "Financial",
        "short": "FIN",
        "icon": "DollarSign",
        "color": "#4ADE80",
        "description": "Revenue, EBITDA, PAT, margins and FX exposures — the P&L impact layer.",
    },
    RiskCategory.OPERATIONAL.value: {
        "label": "Operational",
        "short": "OPS",
        "icon": "Activity",
        "color": "#FB923C",
        "description": "Network, infrastructure, service continuity, capacity and process execution.",
    },
    RiskCategory.TECHNOLOGICAL.value: {
        "label": "Technological",
        "short": "TECH",
        "icon": "Cpu",
        "color": "#82B1FF",
        "description": "Cyber, IT systems, 4G/5G rollout, data platforms and digital resilience.",
    },
    RiskCategory.GOVERNANCE.value: {
        "label": "Governance",
        "short": "GOV",
        "icon": "Scale",
        "color": "#C084FC",
        "description": "Regulatory, compliance, licensing, policy and political/compliance risk.",
    },
    RiskCategory.EXTERNAL.value: {
        "label": "External",
        "short": "EXT",
        "icon": "Globe",
        "color": "#80DEEA",
        "description": "Macro environment — inflation, policy rate, FX, GDP and global shocks.",
    },
}


# Legacy → new category mapping.
_LEGACY_MAP: dict[str, str] = {
    # KPI categories
    "Financial": "financial",
    "Segment": "strategic",
    "Operational": "operational",
    "External": "external",
    # NLP categories
    "fx_financial": "financial",
    "financial": "financial",
    "regulatory": "governance",
    "political": "governance",
    "competitive": "strategic",
    "operational": "operational",
    "reputational": "governance",
    "technological": "technological",
    "cyber": "technological",
    "macro": "external",
    # Scenario pillars
    "A": "external",
    "B": "governance",
    "C": "technological",
    "D": "strategic",
    "E": "operational",
    "F": "strategic",
    "G": "external",
}


def normalise_category(legacy: str | None) -> str:
    """Map any legacy category string to one of the six canonical categories.

    Unknown values fall back to ``operational`` so callers never have to
    handle a missing mapping at the call site.
    """
    if not legacy:
        return RiskCategory.OPERATIONAL.value
    return _LEGACY_MAP.get(legacy, RiskCategory.OPERATIONAL.value)
