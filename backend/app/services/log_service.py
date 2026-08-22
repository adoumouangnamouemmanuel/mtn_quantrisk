"""
Logs base-case changes to SQLite whenever the base CSV is updated
(audit finding H9). Previously stored in a JSON file with no concurrency
control; the legacy file is still read for pre-migration entries.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from ..models.database import SessionLocal
from ..models.feedback import BaseCaseChangeLog

LOG_FILE = Path(__file__).resolve().parents[3] / "data/logs/base_case_changes.json"


def _load_legacy() -> list:
    if LOG_FILE.exists():
        try:
            return json.loads(LOG_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def log_base_case_change(kpi_id: str, old_value: float, new_value: float, source: str) -> None:
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "kpiId": kpi_id,
        "oldValue": old_value,
        "newValue": new_value,
        "delta": round(new_value - old_value, 4),
        "deltaPct": round((new_value - old_value) / old_value * 100, 2) if old_value else 0,
        "source": source,
    }
    with SessionLocal() as db:
        db.add(
            BaseCaseChangeLog(
                id=entry["id"],
                kpi_id=kpi_id,
                old_value=old_value,
                new_value=new_value,
                delta=entry["delta"],
                delta_pct=entry["deltaPct"],
                source=source,
            )
        )
        db.commit()


def get_base_case_logs(limit: int = 100) -> list:
    rows: list[dict] = []
    with SessionLocal() as db:
        records = (
            db.query(BaseCaseChangeLog)
            .order_by(BaseCaseChangeLog.timestamp.desc())
            .limit(limit)
            .all()
        )
        rows = [r.to_dict() for r in records]

    if len(rows) < limit:
        legacy = _load_legacy()
        for entry in reversed(legacy):
            if len(rows) >= limit:
                break
            rows.append(entry)
    return rows
