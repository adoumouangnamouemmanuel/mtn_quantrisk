from collections import defaultdict

from ..models.board_brief import BoardBriefRecord
from ..models.database import SessionLocal
from .scenario_service import get_all_kpis, get_scenario_by_id


MONETARY_KPIS = {"FIN01", "FIN02", "FIN04", "SEG01", "SEG03"}


def list_board_briefs() -> list[dict]:
    with SessionLocal() as db:
        records = db.query(BoardBriefRecord).order_by(BoardBriefRecord.generated_at.desc()).all()
        return [record.to_dict() for record in records]


def generate_board_brief(scenario_ids: list[str]) -> dict:
    if not scenario_ids:
        raise ValueError("Select at least one scenario")

    scenarios = []
    for scenario_id in dict.fromkeys(scenario_ids):
        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")
        scenarios.append(scenario)

    q1_kpis = {kpi["id"]: kpi for kpi in get_all_kpis("2026Q1")}
    combined_impacts = defaultdict(list)
    monetary_impact = 0.0
    for scenario in scenarios:
        for impact in scenario["kpiImpacts"]:
            kpi_id = impact["kpiId"]
            base = float(q1_kpis.get(kpi_id, {}).get("fy25Value", 0.0))
            impact_type = impact["type"]
            impact_value = float(impact["value"])
            if impact_type == "pct":
                delta = base * impact_value / 100
            elif impact_type == "delta":
                delta = impact_value
            else:
                delta = impact_value - base
            combined_impacts[kpi_id].append((scenario["name"], impact_type, impact_value))
            if kpi_id in MONETARY_KPIS:
                monetary_impact += abs(delta)

    key_kpi_impacts = []
    for kpi_id, impacts in combined_impacts.items():
        details = "; ".join(
            f"{name}: {value:+g}{'%' if impact_type == 'pct' else ''}"
            for name, impact_type, value in impacts
        )
        key_kpi_impacts.append({"kpiId": kpi_id, "narrative": f"Q1 2026 base-case impact — {details}."})

    names = [scenario["name"] for scenario in scenarios]
    impacted_label = ", ".join(list(combined_impacts)[:5]) or "the monitored KPI set"
    actions = ["Review the affected KPI thresholds and accountable owners"]
    if any(kpi in combined_impacts for kpi in {"FIN01", "FIN02", "FIN03", "EXT03"}):
        actions.append("Review FX hedging and tariff-repricing triggers")
    if any(kpi in combined_impacts for kpi in {"SEG01", "SEG03", "OPS01", "OPS04"}):
        actions.append("Validate commercial mitigations and customer-retention actions")
    actions.append("Present the scenario assumptions and mitigations at the next risk review")

    record = BoardBriefRecord(
        title=f"Q1 2026 Scenario Brief: {', '.join(names)}",
        scenario_ids=[scenario["id"] for scenario in scenarios],
        severity_score=round(max(float(scenario["severity"]) for scenario in scenarios), 1),
        estimated_impact={"currency": "GHS", "magnitude": round(monetary_impact, 1), "unit": "M"},
        executive_summary=(
            f"Scenario analysis of {', '.join(names)} against the reported Q1 2026 base case identifies "
            f"material movement in {impacted_label}. Modelled gross exposure across monetary KPIs is "
            f"approximately GHS {monetary_impact:,.1f} million before management actions, diversification "
            "effects, or probability weighting."
        ),
        key_kpi_impacts=key_kpi_impacts,
        calibration_notes="Calculated from the repository scenario library and reported Q1 2026 KPI snapshot.",
        recommended_actions=actions,
        key_entities=sorted({scenario["owner"] for scenario in scenarios}),
    )
    with SessionLocal() as db:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record.to_dict()
