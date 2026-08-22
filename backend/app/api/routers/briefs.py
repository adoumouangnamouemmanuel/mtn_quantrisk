"""Board brief, feedback, base-case log, and upload/retrain endpoints."""
import os

from fastapi import APIRouter, HTTPException, Query, UploadFile, File

from ...schemas import (
    FeedbackInput,
    ApplyPdfCandidatesInput,
)
from ...services.log_service import get_base_case_logs
from ...services.feedback_service import submit_feedback, get_feedback
from ...services.brief_service import list_board_briefs, generate_board_brief
from ...services.upload_service import (
    process_csv_upload,
    process_pdf_upload,
    apply_pdf_candidates,
    retrain_xgboost,
)

router = APIRouter(prefix="/api", tags=["briefs"])


# ── Board briefs ──────────────────────────────────────────────────────────────
# Briefs are generated on demand via POST /api/briefs/generate and stored in
# the database. The list endpoint returns only persisted briefs — there is no
# hardcoded mock data here (audit C5 / TD-13).

@router.get("/briefs")
def list_briefs():
    return list_board_briefs()


@router.post("/briefs/generate")
def generate_brief(payload: dict):
    try:
        return generate_board_brief(payload.get("scenarioIds", []))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ── Feedback ───────────────────────────────────────────────────────────────────

@router.post("/feedback", status_code=201)
def post_feedback(body: FeedbackInput):
    return submit_feedback(
        page=body.page,
        feedback_type=body.feedbackType,
        rating=body.rating,
        message=body.message,
        context=body.context,
    )


@router.get("/feedback")
def list_feedback(limit: int = Query(default=50, ge=1, le=200)):
    return get_feedback(limit=limit)


# ── Base-case logs ────────────────────────────────────────────────────────────

@router.get("/logs/base-case")
def base_case_logs(limit: int = Query(default=100, ge=1, le=500)):
    return get_base_case_logs(limit=limit)


# ── Upload ─────────────────────────────────────────────────────────────────────

def _safe_filename(raw: str | None, extension: str) -> str:
    """Reduce an uploaded filename to its basename and validate the extension."""
    name = os.path.basename(raw or "").strip()
    if not name or name in {".", ".."}:
        raise HTTPException(status_code=400, detail="A valid filename is required")
    if not name.lower().endswith(extension):
        raise HTTPException(status_code=400, detail=f"Only {extension} files are accepted")
    return name


@router.post("/upload/csv")
async def upload_csv(file: UploadFile = File(...)):
    filename = _safe_filename(file.filename, ".csv")
    contents = await file.read()
    try:
        return process_csv_upload(contents, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    filename = _safe_filename(file.filename, ".pdf")
    contents = await file.read()
    try:
        return process_pdf_upload(contents, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@router.post("/upload/pdf/apply")
def apply_pdf(body: ApplyPdfCandidatesInput):
    return apply_pdf_candidates(
        [c.model_dump() for c in body.candidates],
        source=f"pdf_upload:{body.filename}",
    )


# ── Retrain ───────────────────────────────────────────────────────────────────

@router.post("/retrain")
def retrain():
    try:
        return retrain_xgboost()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
