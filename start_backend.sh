#!/usr/bin/env bash
# MTN QuantRisk — Start FastAPI Backend (Git Bash / WSL)
# Run from: mtn_quantrisk/ directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try local conda environment first, fallback to system python
PYTHON="$SCRIPT_DIR/../.conda/python.exe"
if [ ! -f "$PYTHON" ]; then
  PYTHON="python"
fi

if ! command -v "$PYTHON" &> /dev/null; then
  echo "ERROR: Python executable not found on PATH or at local .conda env"
  exit 1
fi

echo "Starting MTN QuantRisk API on http://127.0.0.1:8001 ..."
cd "$SCRIPT_DIR"
"$PYTHON" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
