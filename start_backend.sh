#!/usr/bin/env bash
# MTN QuantRisk — Start FastAPI Backend (Git Bash / WSL)
# Run from: mtn_quantrisk/ directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$SCRIPT_DIR/../.conda/python.exe"

if [ ! -f "$PYTHON" ]; then
  echo "ERROR: Conda Python not found at $PYTHON"
  exit 1
fi

echo "Starting MTN QuantRisk API on http://127.0.0.1:8001 ..."
cd "$SCRIPT_DIR"
"$PYTHON" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
