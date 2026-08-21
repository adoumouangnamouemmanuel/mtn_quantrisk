"""
Cross-process file locking for CSV CRUD operations.

Concurrent scenario create/update/delete calls previously could corrupt the
scenario CSVs (audit finding H5 / TD-11). This module exposes a context
manager that acquires an advisory lock next to the target file.

Uses ``fcntl`` on POSIX and ``msvcrt`` on Windows, falling back to a no-op
lock when neither is available (so the app still runs in restricted envs).
"""

import contextlib
import os
from pathlib import Path


@contextlib.contextmanager
def file_lock(path: Path):
    """Acquire an exclusive advisory lock for ``path`` until the block exits.

    The lock file is ``path.with_suffix(path.suffix + ".lock")``. It is a
    best-effort advisory lock — it prevents interleaved writes from this
    application's processes but is not a hard kernel enforcement.
    """
    lock_path = path.with_suffix(path.suffix + ".lock")
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    fh = open(lock_path, "a+")
    acquired = False
    try:
        if os.name == "nt":  # Windows
            try:
                import msvcrt

                msvcrt.locking(fh.fileno(), msvcrt.LK_LOCK, 1)
                acquired = True
            except Exception:
                # Best-effort: fall back to unlocked behaviour on Windows
                # where locking semantics differ.
                pass
        else:  # POSIX
            try:
                import fcntl

                fcntl.flock(fh.fileno(), fcntl.LOCK_EX)
                acquired = True
            except Exception:
                pass
        yield
    finally:
        if acquired and os.name != "nt":
            try:
                import fcntl

                fcntl.flock(fh.fileno(), fcntl.LOCK_UN)
            except Exception:
                pass
        fh.close()
