import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# DB_PATH env var lets Docker mount the DB into a persistent volume.
# Falls back to backend/quantrisk_news.db for local dev.
_DB_PATH = os.environ.get("DB_PATH") or str(
    Path(__file__).resolve().parents[2] / "quantrisk_news.db"
)
DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables if they don't exist."""
    from . import article, risk_score, alert  # noqa: F401 — registers models
    Base.metadata.create_all(bind=engine)
