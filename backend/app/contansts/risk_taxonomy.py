"""
MTN QuantRisk - Revenue Risk Measurement for MTN Ghana
Version: 1.0
Date: 2026-05-18

This module quantifies risk as expected revenue loss (GHS/USD).
All six risk categories are expressed in terms of potential reduction
to MTN Ghana's revenue or direct financial loss.

Reference: MTN Ghana annual revenue ~ GHS 12.5 billion (2025 estimate)
           ~ USD 1.56 billion at 8 GHS/USD
"""

from typing import Tuple, Dict, Optional
import re


class MTNRevenueRiskMetrics:
    """Revenue-based risk assessment for MTN Ghana.
    
    Usage:
        rrm = MTNRevenueRiskMetrics()
        loss_ghs, loss_usd, severity, tier = rrm.assess_risk('regulatory', 0.05, 0.7, 0.95)
    """
    
    # MTN Ghana financial baseline (2025 estimates - update as needed)
    MTN_GHANA_ANNUAL_REVENUE_GHS: float = 12.5e9   # GHS 12.5 billion
    MTN_GHANA_ANNUAL_REVENUE_USD: float = 1.56e9   # USD 1.56 billion (at 8 GHS/USD)
    
    # Risk categories
    RISK_CATEGORIES: Tuple[str, ...] = (
        'regulatory', 'competitive', 'fx_financial',
        'operational', 'political', 'reputational'
    )
    
    # Baseline expected revenue loss as % of annual revenue per category (full impact)
    # Derived from historical MTN Ghana incidents and telco industry data
    BASELINE_LOSS_PCT: Dict[str, float] = {
        'regulatory': 0.05,    # 5% revenue loss
        'competitive': 0.03,   # 3%
        'fx_financial': 0.08,  # 8% (FX volatility)
        'operational': 0.04,   # 4%
        'political': 0.06,     # 6%
        'reputational': 0.02,  # 2%
    }
    
    # Alert thresholds based on expected loss in GHS
    WATCH_LOSS_THRESHOLD_GHS: float = 50e6      # GHS 50 million
    WARNING_LOSS_THRESHOLD_GHS: float = 200e6   # GHS 200 million
    
    # Human-readable names and UI colors
    TIER_NAMES: Dict[str, str] = {
        'watch': 'Watch',
        'warning': 'Warning',
        'critical': 'Critical',
    }
    TIER_COLORS: Dict[str, str] = {
        'watch': '#FFB81C',    # MTN Yellow
        'warning': '#F59E0B',  # Orange
        'critical': '#EF4444', # Red
    }
    
    @classmethod
    def assess_risk(
        cls,
        category: str,
        impact_percentage: float,
        probability: float,
        confidence: float = 1.0
    ) -> Tuple[float, float, float, str]:
        """Primary risk assessment function for MTN Ghana revenue.
        
        Args:
            category: One of the 6 risk categories.
            impact_percentage: Expected revenue loss as % of MTN Ghana annual revenue (0-1).
                               E.g., 0.05 = 5% revenue loss.
            probability: Likelihood of occurrence (0-1).
            confidence: AI model confidence (0-1), default 1.0.
        
        Returns:
            Tuple[float, float, float, str]: (loss_ghs, loss_usd, severity, tier)
                loss_ghs: Expected revenue loss in GHS
                loss_usd: Expected revenue loss in USD
                severity: Score 0-10 derived from loss relative to revenue
                tier: 'watch', 'warning', or 'critical'
        
        Example:
            loss_ghs, loss_usd, sev, tier = MTNRevenueRiskMetrics.assess_risk(
                'regulatory', 0.05, 0.7, 0.95
            )
        """
        # Validate inputs
        if category not in cls.RISK_CATEGORIES:
            raise ValueError(f"Unknown category. Valid: {cls.RISK_CATEGORIES}")
        if not 0 <= impact_percentage <= 1:
            raise ValueError("impact_percentage must be between 0 and 1")
        if not 0 <= probability <= 1:
            raise ValueError("probability must be between 0 and 1")
        if not 0 <= confidence <= 1:
            raise ValueError("confidence must be between 0 and 1")
        
        # Effective loss percentage after probability and confidence
        effective_loss_pct = impact_percentage * probability * confidence
        
        # Calculate expected revenue loss
        loss_ghs = cls.MTN_GHANA_ANNUAL_REVENUE_GHS * effective_loss_pct
        loss_usd = cls.MTN_GHANA_ANNUAL_REVENUE_USD * effective_loss_pct
        
        # Derive severity (0-10) based on loss % of revenue
        # Severity = loss_percent * 10, capped at 10
        loss_percent_of_revenue = (loss_ghs / cls.MTN_GHANA_ANNUAL_REVENUE_GHS) * 100
        severity = min(10.0, loss_percent_of_revenue)
        
        # Determine alert tier based on absolute loss in GHS
        if loss_ghs < cls.WATCH_LOSS_THRESHOLD_GHS:
            tier = 'watch'
        elif loss_ghs < cls.WARNING_LOSS_THRESHOLD_GHS:
            tier = 'warning'
        else:
            tier = 'critical'
        
        return loss_ghs, loss_usd, severity, tier
    
    @classmethod
    def assess_risk_from_article(
        cls,
        category: str,
        impact_description: str,
        probability: float,
        confidence: float = 1.0
    ) -> Tuple[float, float, float, str]:
        """Simplified risk assessment using article text description.
        
        Extracts monetary amount (GHS/USD) from description and converts to revenue loss %.
        In production, replace with NLP + BERT extraction.
        
        Args:
            category: Risk category.
            impact_description: Text like "NCA imposes 50M GHS fine".
            probability: Likelihood (0-1).
            confidence: Model confidence (0-1).
        
        Returns:
            Same as assess_risk()
        
        Example:
            data = MTNRevenueRiskMetrics.assess_risk_from_article(
                'regulatory', 'NCA imposes GHS 50 million fine', 0.9, 0.95
            )
        """
        # Extract monetary amount using regex
        # Patterns: "GHS 10M", "10 million GHS", "USD 5M", "50M", etc.
        patterns = [
            r'(?:GHS|GH¢|cedis?)\s*(\d+(?:\.\d+)?)\s*(?:million|M|billion|B)?',
            r'(\d+(?:\.\d+)?)\s*(?:million|M|billion|B)?\s*(?:GHS|GH¢|cedis?)',
            r'(?:USD|\$)\s*(\d+(?:\.\d+)?)\s*(?:million|M|billion|B)?',
            r'(\d+(?:\.\d+)?)\s*(?:million|M|billion|B)?\s*(?:USD|\$)',
        ]
        
        impact_ghs = 0.0
        for pattern in patterns:
            match = re.search(pattern, impact_description, re.IGNORECASE)
            if match:
                amount = float(match.group(1))
                # Check if USD and convert to GHS
                if 'USD' in pattern or '$' in pattern:
                    impact_ghs = amount * 8.0  # assume 8 GHS/USD
                else:
                    impact_ghs = amount
                # Multiply by million/billion if specified
                if 'billion' in impact_description.lower() or 'B' in impact_description.upper():
                    impact_ghs *= 1e9
                elif 'million' in impact_description.lower() or 'M' in impact_description.upper():
                    impact_ghs *= 1e6
                break
        
        # Convert absolute impact to % of annual revenue
        impact_percent = impact_ghs / cls.MTN_GHANA_ANNUAL_REVENUE_GHS
        impact_percent = min(impact_percent, 1.0)  # cap at 100% revenue
        
        return cls.assess_risk(category, impact_percent, probability, confidence)
    
    @classmethod
    def display_risk_brief(
        cls,
        category: str,
        impact_percentage: float,
        probability: float,
        confidence: float = 1.0
    ) -> None:
        """Generate a board-ready risk summary."""
        loss_ghs, loss_usd, severity, tier = cls.assess_risk(
            category, impact_percentage, probability, confidence
        )
        
        print("\n" + "=" * 40)
        print("MTN GHANA REVENUE RISK BRIEF")
        print("=" * 40)
        print(f"Category:          {category}")
        print(f"Expected Revenue Loss: GHS {loss_ghs/1e6:.2f} million "
              f"(USD {loss_usd/1e6:.2f} million)")
        print(f"Severity (0-10):   {severity:.1f}")
        print(f"Alert Tier:        {tier.upper()}")
        print(f"Risk Drivers:      Probability = {probability*100:.0f}%, "
              f"Confidence = {confidence*100:.0f}%")
        print("=" * 40)


# -------------------------------------------------------------------------
# EXAMPLE USAGE (run this file directly to test)
# -------------------------------------------------------------------------
if __name__ == "__main__":
    print("\n--- EXAMPLE 1: Regulatory Fine ---")
    loss_ghs, loss_usd, sev, tier = MTNRevenueRiskMetrics.assess_risk(
        'regulatory', 0.05, 0.7, 0.95
    )
    print(f"Regulatory risk: Expected loss GHS {loss_ghs/1e6:.2f}M, "
          f"USD {loss_usd/1e6:.2f}M | Severity {sev:.1f} | Tier: {tier.upper()}")
    
    print("\n--- EXAMPLE 2: FX Risk (8% revenue loss, 85% prob) ---")
    loss_ghs, loss_usd, sev, tier = MTNRevenueRiskMetrics.assess_risk(
        'fx_financial', 0.08, 0.85, 0.90
    )
    print(f"FX risk: Expected loss GHS {loss_ghs/1e6:.2f}M, "
          f"USD {loss_usd/1e6:.2f}M | Severity {sev:.1f} | Tier: {tier.upper()}")
    
    print("\n--- EXAMPLE 3: Competitive Threat ---")
    MTNRevenueRiskMetrics.display_risk_brief('competitive', 0.03, 0.50, 0.85)
    
    print("\n--- EXAMPLE 4: From News Article ---")
    loss_ghs, loss_usd, sev, tier = MTNRevenueRiskMetrics.assess_risk_from_article(
        'regulatory', 'NCA Ghana imposes GHS 50 million fine on MTN', 0.90, 0.95
    )
    print(f"Article-based: Expected loss GHS {loss_ghs/1e6:.2f}M, "
          f"USD {loss_usd/1e6:.2f}M | Severity {sev:.1f} | Tier: {tier.upper()}")