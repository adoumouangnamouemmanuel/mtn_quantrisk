"""
Stores user feedback on predictions and alerts in SQLite (audit finding H9).

Previously feedback was appended to a JSON file with no concurrency control.
The JSON file remains as a fallback read source so historical entries are not
lost, but all new writes go to the ``feedback`` table.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from ..models.database import SessionLocal
from ..models.feedback import Feedback

# Legacy file kept only so the list endpoint can surface pre-migration data.
FEEDBACK_FILE = Path(__file__).resolve().parents[3] / "data/logs/feedback.json"


def _load_legacy() -> list:
    if FEEDBACK_FILE.exists():
        try:
            return json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def submit_feedback(
    page: str,
    feedback_type: str,
    rating: str,
    message: str,
    context: dict | None = None,
) -> dict:
    entry = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "page": page,
        "type": feedback_type,
        "rating": rating,
        "message": message,
        "context": context or {},
    }
    with SessionLocal() as db:
        record = Feedback(
            id=entry["id"],
            page=page,
            feedback_type=feedback_type,
            rating=rating,
            message=message,
            context=context or {},
        )
        db.add(record)
        db.commit()
        return entry


def get_feedback(limit: int = 50) -> list:
    rows: list[dict] = []
    with SessionLocal() as db:
        records = (
            db.query(Feedback)
            .order_by(Feedback.timestamp.desc())
            .limit(limit)
            .all()
        )
        rows = [r.to_dict() for r in records]

    # Backfill from the legacy JSON file if the DB has fewer rows than
    # requested (covers feedback submitted before the migration).
    if len(rows) < limit:
        legacy = _load_legacy()
        needed = limit - len(rows)
        for entry in reversed(legacy):
            if len(rows) >= limit:
                break
            rows.append(entry)
    return rows
