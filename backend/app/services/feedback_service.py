"""
Stores user feedback on predictions and alerts.
Stored in data/logs/feedback.json.
"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

FEEDBACK_FILE = Path(__file__).resolve().parents[4] / "data/logs/feedback.json"


def _load() -> list:
    if FEEDBACK_FILE.exists():
        try:
            return json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def _save(entries: list) -> None:
    FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    FEEDBACK_FILE.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def submit_feedback(
    page: str,
    feedback_type: str,
    rating: str,
    message: str,
    context: dict | None = None,
) -> dict:
    entries = _load()
    entry = {
        "id":          str(uuid.uuid4())[:8],
        "timestamp":   datetime.now(timezone.utc).isoformat(),
        "page":        page,
        "type":        feedback_type,   # wrong_prediction | false_alert | inaccurate | other
        "rating":      rating,          # positive | negative
        "message":     message,
        "context":     context or {},
    }
    entries.append(entry)
    _save(entries)
    return entry


def get_feedback(limit: int = 50) -> list:
    entries = _load()
    return list(reversed(entries))[:limit]
