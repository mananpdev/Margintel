"""
In-memory run store for v0.1.

Thread-safe dict backed by a Lock. Swap for Redis / Postgres later.
"""

from __future__ import annotations

import threading
from typing import Any

_lock = threading.Lock()
_runs: dict[str, dict[str, Any]] = {}


def store_run(run_id: str, data: dict[str, Any]) -> None:
    with _lock:
        _runs[run_id] = data


def get_run(run_id: str) -> dict[str, Any] | None:
    with _lock:
        return _runs.get(run_id)


def list_runs() -> list[str]:
    with _lock:
        return list(_runs.keys())
