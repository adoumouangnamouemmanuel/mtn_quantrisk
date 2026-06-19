# pipeline/extractor/tables.py

import json
import subprocess
from pathlib import Path

import pandas as pd  # type: ignore[import]
import pdfplumber  # type: ignore[import]


def _dedupe_columns(columns: list) -> list[str]:
    """Ensure DataFrame column names are unique after pdfplumber extraction."""
    seen: dict[str, int] = {}
    result: list[str] = []
    for col in columns:
        key = str(col).strip() if col is not None else ""
        if key in seen:
            seen[key] += 1
            result.append(f"{key}_{seen[key]}")
        else:
            seen[key] = 0
            result.append(key)
    return result


def _inspect_pdf_poppler(pdf_path: str) -> dict:
    """Pre-flight via poppler-utils (pdfinfo / pdffonts)."""
    info: dict = {}
    result = subprocess.run(
        ["pdfinfo", pdf_path],
        capture_output=True,
        text=True,
        check=False,
    )
    for line in result.stdout.split("\n"):
        if "Pages:" in line:
            info["pages"] = int(line.split(":")[1].strip())

    fonts = subprocess.run(
        ["pdffonts", pdf_path],
        capture_output=True,
        text=True,
        check=False,
    )
    font_lines = [line for line in fonts.stdout.split("\n") if line.strip()]
    info["has_text_layer"] = len(font_lines) > 2
    info["likely_scanned"] = not info["has_text_layer"]
    return info


def _inspect_pdf_pdfplumber(pdf_path: str) -> dict:
    """Fallback pre-flight when poppler-utils is unavailable."""
    info: dict = {}
    with pdfplumber.open(pdf_path) as pdf:
        info["pages"] = len(pdf.pages)
        sample_text = ""
        for page in pdf.pages[:3]:
            sample_text += page.extract_text() or ""
        info["has_text_layer"] = len(sample_text.strip()) > 50
        info["likely_scanned"] = not info["has_text_layer"]
    return info


def inspect_pdf(pdf_path: str) -> dict:
    """Quick pre-flight: page count + text layer detection."""
    try:
        info = _inspect_pdf_poppler(pdf_path)
        if "pages" in info:
            return info
    except (FileNotFoundError, OSError):
        pass
    return _inspect_pdf_pdfplumber(pdf_path)


def extract_all_tables(pdf_path: str, min_rows: int = 3) -> list:
    """
    Primary extractor: pdfplumber.
    Returns list of dicts with "page", "rows", "cols", "headers", "dataframe".
    """
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            for t_idx, raw in enumerate(page.extract_tables() or []):
                if not raw or len(raw) < min_rows:
                    continue
                header = _dedupe_columns(raw[0])
                df = pd.DataFrame(raw[1:], columns=header).dropna(how="all")
                if len(df) == 0:
                    continue
                tables.append({
                    "page"       : page_num,
                    "table_index": t_idx,
                    "rows"       : len(df),
                    "cols"       : len(df.columns),
                    "headers"    : list(df.columns),
                    "dataframe"  : df,
                    "preview"    : df.head(3).to_dict(),
                })
    return tables


def extract_tables_camelot(pdf_path: str, pages: str = "all") -> list:
    """
    Fallback: camelot - better for borderless tables.
    Try lattice first (ruled), then stream (borderless).
    Use when pdfplumber returns empty or malformed tables.
    """
    import camelot  # type: ignore[import]

    tables = []
    try:
        result = camelot.read_pdf(pdf_path, pages=pages, flavor="lattice")
        if result.n == 0:
            result = camelot.read_pdf(pdf_path, pages=pages, flavor="stream")
        for t in result:
            tables.append({
                "page"      : t.page,
                "accuracy"  : t.accuracy,
                "dataframe" : t.df,
                "headers"   : list(t.df.columns),
            })
    except Exception as e:
        print(f"[WARN] Camelot failed on {pdf_path}: {e}")
    return tables


def extract_tables(pdf_path: str, min_rows: int = 3) -> list:
    """
    Extract tables using pdfplumber, falling back to camelot when empty.
    """
    tables = extract_all_tables(pdf_path, min_rows=min_rows)
    if not tables:
        tables = extract_tables_camelot(pdf_path)
    return tables


def save_raw_extraction(tables: list, output_path: str):
    """Persist raw extraction as JSON for audit trail."""
    serialisable = []
    for t in tables:
        entry = {k: v for k, v in t.items() if k != "dataframe"}
        entry["data"] = t["dataframe"].to_dict(orient="records")
        serialisable.append(entry)
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(serialisable, f, indent=2, default=str)
    print(f"  -> Saved {len(serialisable)} tables to {output_path}")
