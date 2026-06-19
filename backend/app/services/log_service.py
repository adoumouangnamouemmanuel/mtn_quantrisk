"""
Logs base-case changes whenever the CSV is updated via upload.
Stored in data/logs/base_case_changes.json.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

LOG_FILE = Path(__file__).resolve().parents[4] / "data/logs/base_case_changes.json"


def _load() -> list:
    if LOG_FILE.exists():
        try:
            return json.loads(LOG_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def _save(entries: list) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOG_FILE.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def log_base_case_change(kpi_id: str, old_value: float, new_value: float, source: str) -> None:
    entries = _load()
    entries.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "kpiId":     kpi_id,
        "oldValue":  old_value,
        "newValue":  new_value,
        "delta":     round(new_value - old_value, 4),
        "deltaPct":  round((new_value - old_value) / old_value * 100, 2) if old_value else 0,
        "source":    source,
    })
    _save(entries)


def get_base_case_logs(limit: int = 100) -> list:
    entries = _load()
    return list(reversed(entries))[:limit]
