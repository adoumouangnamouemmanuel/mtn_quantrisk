"""
Handles PDF and CSV uploads.
- CSV: validates columns, updates base_case.csv, logs changes.
- PDF: extracts tables with pdfplumber, then uses Claude API to map
  extracted text to KPI values; falls back to raw extraction if no API key.
"""
import os
import json
import tempfile
from pathlib import Path

import pandas as pd

from .data_loader import BASE_CASE_CSV, clear_scenario_cache, load_base_case
from .log_service import log_base_case_change

UPLOAD_DIR = Path(__file__).resolve().parents[4] / "data/uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

KPI_NAMES = {
    "FIN01": "Service Revenue",  "FIN02": "EBITDA",         "FIN03": "EBITDA Margin",
    "FIN04": "PAT",              "FIN05": "PAT Margin",     "FIN06": "Revenue Growth YoY",
    "SEG01": "Data Revenue",     "SEG03": "MoMo Revenue",   "OPS01": "Total Subscribers",
    "OPS04": "ARPU",             "OPS07": "4G Coverage",    "EXT01": "Inflation",
    "EXT02": "BoG Policy Rate",  "EXT03": "Cedi/USD",
}


# ── CSV upload ─────────────────────────────────────────────────────────────────

def process_csv_upload(file_bytes: bytes, filename: str) -> dict:
    """
    Accept a CSV with columns KPI_ID and FY25_Base_Value (minimum).
    Updates base_case.csv and logs every changed value.
    Returns a summary of changes made.
    """
    save_path = UPLOAD_DIR / filename
    save_path.write_bytes(file_bytes)

    try:
        df_new = pd.read_csv(save_path, encoding="utf-8-sig")
    except Exception as e:
        raise ValueError(f"Could not parse CSV: {e}")

    df_new.columns = [c.strip() for c in df_new.columns]
    if "KPI_ID" not in df_new.columns or "FY25_Base_Value" not in df_new.columns:
        raise ValueError("CSV must contain columns: KPI_ID, FY25_Base_Value")

    # Load existing base case
    df_base = pd.read_csv(BASE_CASE_CSV, encoding="utf-8-sig")
    df_base.columns = [c.strip() for c in df_base.columns]

    changes = []
    old_values = load_base_case()

    for _, row in df_new.iterrows():
        kid = str(row["KPI_ID"]).strip()
        try:
            new_val = float(row["FY25_Base_Value"])
        except (ValueError, TypeError):
            continue

        mask = df_base["KPI_ID"].astype(str).str.strip() == kid
        if not mask.any():
            continue

        old_val = float(old_values.get(kid, 0.0))
        if abs(new_val - old_val) < 1e-6:
            continue

        df_base.loc[mask, "FY25_Base_Value"] = new_val
        log_base_case_change(kid, old_val, new_val, source=f"csv_upload:{filename}")
        changes.append({
            "kpiId":    kid,
            "kpiName":  KPI_NAMES.get(kid, kid),
            "oldValue": old_val,
            "newValue": new_val,
            "deltaPct": round((new_val - old_val) / old_val * 100, 2) if old_val else 0,
        })

    if changes:
        df_base.to_csv(BASE_CASE_CSV, index=False, encoding="utf-8-sig")
        load_base_case.cache_clear()

    return {"filename": filename, "changesApplied": len(changes), "changes": changes}


# ── PDF upload ─────────────────────────────────────────────────────────────────

def _extract_pdf_tables(pdf_path: Path) -> str:
    """Extract all text and tables from a PDF as a single string."""
    try:
        import pdfplumber
        lines = []
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                if text.strip():
                    lines.append(text)
                for table in (page.extract_tables() or []):
                    for row in table:
                        lines.append(" | ".join(str(c or "").strip() for c in row))
        return "\n".join(lines)
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def _llm_extract_kpis(text: str, filename: str) -> list[dict]:
    """
    Send extracted PDF text to Claude and ask it to identify KPI values.
    Returns list of {kpiId, kpiName, value, unit, confidence}.
    Falls back to empty list if no API key or call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return []

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        kpi_list = "\n".join(f"- {kid}: {name}" for kid, name in KPI_NAMES.items())
        prompt = f"""You are a financial data extraction assistant for MTN Ghana.
Below is text extracted from the document "{filename}".
Extract the FY2025 (or most recent) values for the following KPIs where found.
Return ONLY a JSON array — no explanation, no markdown.

KPIs to find:
{kpi_list}

Output format (array of objects):
[{{"kpiId":"FIN01","kpiName":"Service Revenue","value":24400,"unit":"GHSm","confidence":"high"}}]

If a KPI is not found, omit it. Confidence: high/medium/low.

--- DOCUMENT TEXT ---
{text[:8000]}
--- END ---
"""
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception:
        return []


def process_pdf_upload(file_bytes: bytes, filename: str) -> dict:
    """
    Save the PDF, extract tables, run LLM extraction, save extracted JSON.
    Returns extracted KPI candidates (user can review before applying).
    """
    save_path = UPLOAD_DIR / filename
    save_path.write_bytes(file_bytes)

    text = _extract_pdf_tables(save_path)

    # Save raw text for audit
    raw_path = UPLOAD_DIR / (filename + ".extracted.txt")
    raw_path.write_text(text[:50000], encoding="utf-8")

    kpi_candidates = _llm_extract_kpis(text, filename)

    # Save extracted JSON
    json_path = Path(__file__).resolve().parents[4] / "data/extracted" / (filename + ".json")
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(kpi_candidates, indent=2), encoding="utf-8")

    return {
        "filename":      filename,
        "pagesExtracted": text.count("\n"),
        "kpiCandidates": kpi_candidates,
        "llmUsed":       bool(os.environ.get("ANTHROPIC_API_KEY")),
        "extractedPath": str(json_path),
    }


def apply_pdf_candidates(candidates: list[dict], source: str) -> dict:
    """
    Apply LLM-extracted KPI values to base_case.csv after user confirmation.
    """
    df_base = pd.read_csv(BASE_CASE_CSV, encoding="utf-8-sig")
    df_base.columns = [c.strip() for c in df_base.columns]
    old_values = load_base_case()
    changes = []

    for c in candidates:
        kid = str(c.get("kpiId", "")).strip()
        try:
            new_val = float(c["value"])
        except (ValueError, TypeError, KeyError):
            continue
        mask = df_base["KPI_ID"].astype(str).str.strip() == kid
        if not mask.any():
            continue
        old_val = float(old_values.get(kid, 0.0))
        df_base.loc[mask, "FY25_Base_Value"] = new_val
        log_base_case_change(kid, old_val, new_val, source=source)
        changes.append({"kpiId": kid, "oldValue": old_val, "newValue": new_val})

    if changes:
        df_base.to_csv(BASE_CASE_CSV, index=False, encoding="utf-8-sig")
        load_base_case.cache_clear()

    return {"changesApplied": len(changes), "changes": changes}


# ── XGBoost retrain ─────────────────────────────────────────────────────────

def retrain_xgboost() -> dict:
    """Trigger XGBoost model retraining. Returns metrics."""
    import subprocess, sys
    proj_root = Path(__file__).resolve().parents[4]
    script = proj_root / "models/train_impact_model.py"
    if not script.exists():
        raise FileNotFoundError("train_impact_model.py not found")

    result = subprocess.run(
        [sys.executable, str(script)],
        capture_output=True, text=True, cwd=str(proj_root), timeout=300,
    )
    return {
        "success": result.returncode == 0,
        "stdout":  result.stdout[-3000:] if result.stdout else "",
        "stderr":  result.stderr[-1000:] if result.stderr else "",
    }
