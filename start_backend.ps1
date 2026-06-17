# MTN QuantRisk — Start FastAPI Backend
# Run this script from the mtn_quantrisk/ directory

$PYTHON = (Resolve-Path "$PSScriptRoot\..\.conda\python.exe").Path

if (-not (Test-Path $PYTHON)) {
    Write-Error "Conda Python not found at $PYTHON"
    exit 1
}

Write-Host "Starting MTN QuantRisk API on http://127.0.0.1:8001 ..."
Set-Location $PSScriptRoot
& $PYTHON -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
