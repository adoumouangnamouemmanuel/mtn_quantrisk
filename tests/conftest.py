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
# ``mktemp`` is deprecated and raises on Python 3.13+; use ``mkstemp`` and
# close the fd so the path is a usable file for SQLite.
_TEST_FD, _TEST_DB = tempfile.mkstemp(suffix=".db", prefix="quantrisk_test_")
os.close(_TEST_FD)
os.environ.setdefault("DB_PATH", _TEST_DB)
