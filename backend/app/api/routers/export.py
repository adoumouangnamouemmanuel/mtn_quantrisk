"""Export endpoints — PDF board briefs and Excel KRI/scenario data."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from ...core.rbac import require_role
from ...services.export_service import (
    export_kri_excel,
    export_brief_pdf,
    export_scenario_comparison_excel,
)
from ...services.scenario_service import get_scenario_by_id, apply_scenario

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get(
    "/kri-excel",
    dependencies=[Depends(require_role("risk_manager", "cro", "admin"))],
)
def download_kri_excel(period: str | None = None):
    """Download the KRI register as an Excel file."""
    try:
        content = export_kri_excel(period)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=kri_register.xlsx"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/brief-pdf",
    dependencies=[Depends(require_role("risk_manager", "cro", "admin"))],
)
def download_brief_pdf(brief_id: str | None = None):
    """Download a board brief as a PDF document."""
    try:
        content = export_brief_pdf(brief_id)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=board_brief.pdf"},
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/scenario-comparison-excel",
    dependencies=[Depends(require_role("analyst", "risk_manager", "cro", "admin"))],
)
def download_scenario_comparison_excel(
    scenario_a_id: str,
    scenario_b_id: str,
    severity_multiplier: float = 1.0,
):
    """Download a scenario comparison as an Excel file."""
    sc_a = get_scenario_by_id(scenario_a_id)
    sc_b = get_scenario_by_id(scenario_b_id)
    if not sc_a:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_a_id} not found")
    if not sc_b:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_b_id} not found")

    try:
        results_a = apply_scenario(scenario_a_id, severity_multiplier)
        results_b = apply_scenario(scenario_b_id, severity_multiplier)
        content = export_scenario_comparison_excel(sc_a, sc_b, results_a, results_b)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=compare_{scenario_a_id}_vs_{scenario_b_id}.xlsx"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
