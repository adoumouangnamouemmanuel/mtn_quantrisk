# tests/test_extractor_tables.py

from pathlib import Path

import pandas as pd
import pytest

from pipeline.extractor.tables import (
    extract_all_tables,
    extract_tables,
    inspect_pdf,
    save_raw_extraction,
)


RAW_PDF_DIR = Path("data/raw_pdfs")
MTN_ANNUAL_PDF = RAW_PDF_DIR / "mtn_annual_fy2024.pdf"


def test_save_raw_extraction_roundtrip(tmp_path):
    df = pd.DataFrame(
        {"Metric": ["Revenue", "EBITDA"], "Value": ["100", "60"]},
    )
    tables = [{
        "page": 1,
        "table_index": 0,
        "rows": len(df),
        "cols": len(df.columns),
        "headers": list(df.columns),
        "dataframe": df,
        "preview": df.head(3).to_dict(),
    }]

    out = tmp_path / "extracted" / "sample.json"
    save_raw_extraction(tables, str(out))

    assert out.exists()
    content = out.read_text(encoding="utf-8")
    assert "Revenue" in content
    assert "EBITDA" in content


@pytest.mark.skipif(
    not MTN_ANNUAL_PDF.exists(),
    reason="MTN FY24 annual PDF not present in data/raw_pdfs/",
)
def test_inspect_mtn_annual_pdf():
    info = inspect_pdf(str(MTN_ANNUAL_PDF))

    assert info["pages"] >= 1
    assert "has_text_layer" in info
    assert "likely_scanned" in info


@pytest.mark.skipif(
    not MTN_ANNUAL_PDF.exists(),
    reason="MTN FY24 annual PDF not present in data/raw_pdfs/",
)
def test_extract_all_tables_mtn_annual_pdf():
    tables = extract_all_tables(str(MTN_ANNUAL_PDF))

    assert len(tables) >= 5
    for table in tables:
        assert table["rows"] >= 1
        assert table["cols"] >= 1
        assert isinstance(table["dataframe"], pd.DataFrame)
        assert table["headers"]


@pytest.mark.skipif(
    not MTN_ANNUAL_PDF.exists(),
    reason="MTN FY24 annual PDF not present in data/raw_pdfs/",
)
def test_extract_tables_with_camelot_fallback():
    tables = extract_tables(str(MTN_ANNUAL_PDF))

    assert len(tables) >= 5
