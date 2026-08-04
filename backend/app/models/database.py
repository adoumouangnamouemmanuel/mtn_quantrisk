import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Prefer a supplied database URL (Postgres). Fall back to SQLite for local dev.
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    _DB_PATH = os.environ.get("DB_PATH") or str(
        Path(__file__).resolve().parents[2] / "quantrisk_news.db"
    )
    DATABASE_URL = f"sqlite:///{_DB_PATH}"
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine_kwargs = {"echo": False}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
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
    from . import board_brief  # noqa: F401
    Base.metadata.create_all(bind=engine)
