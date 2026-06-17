from pathlib import Path

from classifier import classify_pdf_file, needs_manual_review
from extractor.tables import inspect_pdf, extract_tables, save_raw_extraction

PIPELINE_DIR = Path(__file__).resolve().parent
REPO_ROOT = PIPELINE_DIR.parent
pdf = PIPELINE_DIR / "annual_mtn_25.pdf"

if not pdf.exists():
    raise FileNotFoundError(f"PDF not found: {pdf}")

# Step 1: Pre-flight check
info = inspect_pdf(str(pdf))
print(info)  # pages, has_text_layer, likely_scanned

# Step 2: Classify document type
result = classify_pdf_file(str(pdf))
print(result.doc_type.value)   # e.g. "mtn_annual"
print(result.confidence)       # 0.0 – 1.0
print(result.period)           # e.g. "year ended 31 december 2024"
print(result.year)             # e.g. 2024

if needs_manual_review(result):
    print("Stop — needs human review (confidence < 0.4 or unknown type)")
else:
    # Step 3: Extract tables
    tables = extract_tables(str(pdf))
    print(f"Found {len(tables)} tables")

    # Step 4: Inspect a table
    df = tables[0]["dataframe"]
    print(df.head())

    # Step 5: Save raw JSON audit trail
    out = REPO_ROOT / "data" / "extracted" / "annual_mtn_25.json"
    save_raw_extraction(tables, str(out))