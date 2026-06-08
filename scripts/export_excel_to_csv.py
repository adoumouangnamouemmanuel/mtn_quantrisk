import pandas as pd
from pathlib import Path

WB_PATH = "docs/mtn/MTN-Ghana-KRI-Framework 1 (1).xlsx"
OUT_DIR = Path("data/structured")
OUT_DIR.mkdir(parents=True, exist_ok=True)

SHEETS = [
    "Annual", "HalfYearly", "Quarterly",
    "Segments_Annual", "Segments_Quarterly",
    "Operational_Annual", "Operational_Quarterly",
    "Leading_Indicators", "Macro_Context",
    "Derived_Ratios", "Base Case", "KRI Register",
    "Scenario Library"   # Foureira adds this in Task 1.1
]

print("Script started...")
for sheet in SHEETS:
    try:
        df = pd.read_excel(WB_PATH, sheet_name=sheet, header=1)
        out_path = OUT_DIR / f"{sheet.lower().replace(' ', '_')}.csv"
        df.to_csv(out_path, index=False)
        print(f"✓ {sheet}: {len(df)} rows → {out_path}")
    except Exception as e:
        print(f"✗ {sheet}: {e}")
print("All done!")