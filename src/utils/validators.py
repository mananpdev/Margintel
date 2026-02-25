"""
Column validation for uploaded CSVs.
Raises ValueError with a clear message on missing required columns.
"""

from __future__ import annotations

import pandas as pd

REQUIRED_ORDER_COLS = {"order_id", "sku", "quantity", "item_price"}
OPTIONAL_ORDER_COLS = {"order_date", "discount_amount", "refund_amount", "line_total"}

REQUIRED_RETURN_COLS = {"sku"}
OPTIONAL_RETURN_COLS = {"order_id", "return_id", "return_date", "return_reason_text", "return_amount"}


class ValidationError(Exception):
    """Raised when a CSV fails structural validation."""


def validate_orders(df: pd.DataFrame) -> list[str]:
    """
    Validate orders DataFrame.
    Returns a list of notes (warnings) about optional columns.
    Raises ValidationError if required columns are missing.
    """
    missing = REQUIRED_ORDER_COLS - set(df.columns)
    if missing:
        raise ValidationError(
            f"orders_file is missing required columns: {sorted(missing)}"
        )

    notes: list[str] = []

    if "order_date" not in df.columns:
        notes.append("order_date column missing — date-range analysis will be skipped.")

    if "line_total" not in df.columns and "discount_amount" not in df.columns:
        notes.append(
            "Neither line_total nor discount_amount found — revenue = quantity × item_price."
        )

    if "refund_amount" not in df.columns:
        notes.append("refund_amount column missing — refund analysis from orders will be skipped.")

    return notes


def validate_returns(df: pd.DataFrame) -> list[str]:
    """
    Validate returns DataFrame.
    Returns notes about optional columns.
    """
    missing = REQUIRED_RETURN_COLS - set(df.columns)
    if missing:
        raise ValidationError(
            f"returns_file is missing required columns: {sorted(missing)}"
        )

    notes: list[str] = []

    if "return_reason_text" not in df.columns:
        notes.append("return_reason_text missing — LLM theme clustering will be skipped.")

    if "return_amount" not in df.columns:
        notes.append("return_amount missing in returns — using count-based return rates only.")

    return notes
