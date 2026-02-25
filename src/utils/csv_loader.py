"""
CSV loading + normalisation.

Handles:
- reading from Flask FileStorage or file path
- date parsing
- numeric coercion
- column name normalisation (strip + lowercase)
"""

from __future__ import annotations

from io import StringIO
from typing import Union

import pandas as pd

from src.utils.validators import validate_orders, validate_returns, ValidationError


def _read_csv(source) -> pd.DataFrame:
    """Read a CSV from a Flask FileStorage object, path string, or StringIO."""
    if isinstance(source, str):
        return pd.read_csv(source)
    # Flask FileStorage — read bytes, decode, wrap in StringIO
    raw = source.read()
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    return pd.read_csv(StringIO(raw))


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase + strip column names."""
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df


def _coerce_numeric(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """Try to cast columns to float; fill NaN with 0."""
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0.0)
    return df


def _coerce_dates(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce")
    return df


def load_orders_csv(source) -> tuple[pd.DataFrame, list[str]]:
    """
    Load & validate orders CSV.
    Returns (DataFrame, notes).
    Raises ValidationError on bad data.
    """
    df = _read_csv(source)
    df = _normalise_columns(df)
    notes = validate_orders(df)

    numeric_cols = ["quantity", "item_price", "discount_amount", "refund_amount", "line_total"]
    df = _coerce_numeric(df, numeric_cols)
    df = _coerce_dates(df, ["order_date"])

    # Compute revenue per row
    if "line_total" in df.columns:
        df["_revenue"] = df["line_total"]
    else:
        discount = df["discount_amount"] if "discount_amount" in df.columns else 0
        df["_revenue"] = df["quantity"] * df["item_price"] - discount

    return df, notes


def load_returns_csv(source) -> tuple[pd.DataFrame, list[str]]:
    """
    Load & validate returns CSV.
    Returns (DataFrame, notes).
    """
    df = _read_csv(source)
    df = _normalise_columns(df)
    notes = validate_returns(df)

    numeric_cols = ["return_amount"]
    df = _coerce_numeric(df, numeric_cols)
    df = _coerce_dates(df, ["return_date"])

    return df, notes
