"""
In-memory run store for v0.1.

Thread-safe dict backed by a Lock. Swap for Redis / Postgres later.
Now supports progress tracking and run listing with metadata.
"""

from __future__ import annotations

import threading
from datetime import datetime, timezone
from typing import Any

_lock = threading.Lock()
_runs: dict[str, dict[str, Any]] = {}


def store_run(run_id: str, data: dict[str, Any]) -> None:
    with _lock:
        existing = _runs.get(run_id, {})
        existing.update(data)
        _runs[run_id] = existing


def get_run(run_id: str) -> dict[str, Any] | None:
    with _lock:
        return _runs.get(run_id)


def update_progress(run_id: str, pct: int, label: str) -> None:
    """Update the progress of a running analysis."""
    with _lock:
        if run_id in _runs:
            _runs[run_id]["progress"] = {"pct": pct, "label": label}


def list_runs() -> list[str]:
    with _lock:
        return list(_runs.keys())


def list_runs_summary() -> list[dict]:
    """Return a list of completed runs with metadata (no full report)."""
    with _lock:
        results = []
        for run_id, data in _runs.items():
            if data.get("status") != "done":
                continue
            report = data.get("report", {})
            results.append({
                "id": run_id,
                "status": "done",
                "generated_at": report.get("generated_at", ""),
                "orders_rows": report.get("dataset_summary", {}).get("orders_rows", 0),
                "returns_rows": report.get("dataset_summary", {}).get("returns_rows", 0),
                "total_revenue": report.get("profiling", {}).get("total_revenue", 0),
            })
        return results
