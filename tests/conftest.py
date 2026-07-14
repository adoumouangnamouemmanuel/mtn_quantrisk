"""
conftest.py — runs before any test module is imported.
Sets DB_PATH to a temp file so database.py picks it up at import time.
"""
import os
import sys
import tempfile
from pathlib import Path

# ── Ensure backend is on sys.path ─────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
for p in (str(ROOT), str(BACKEND)):
    if p not in sys.path:
        sys.path.insert(0, p)

# ── Point all app modules to a throwaway temp DB ─────────────────────────────
# This must happen before any `from app.models.database import ...` runs.
_TEST_DB = tempfile.mktemp(suffix=".db", prefix="quantrisk_test_")
os.environ.setdefault("DB_PATH", _TEST_DB)
