"""Tiny helper for run IDs."""

import uuid


def new_run_id() -> str:
    return str(uuid.uuid4())
