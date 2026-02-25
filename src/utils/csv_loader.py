"""
CSV loading + normalisation.

Handles:
- reading from Flask FileStorage or file path
- fuzzy column mapping (handling different naming conventions)
- date parsing
- numeric coercion
- column name normalisation (strip + lowercase)
"""

from __future__ import annotations

from io import StringIO
from typing import Union

import pandas as pd

from src.utils.validators import validate_orders, validate_returns, ValidationError


# Maps our internal keys to common synonyms found in Shopify, Amazon, WooCommerce, etc.
SYNONYMS = {
    "sku": ["product_sku", "item_id", "product_id", "variant_sku", "article_number", "sku_id", "product_ref", "stockcode"],
    "order_id": ["order_number", "transaction_id", "reference", "ref", "order_no", "order_id", "id", "invoiceno"],
    "quantity": ["qty", "units", "count", "quantity_ordered", "amount_sold", "units_sold"],
    "item_price": ["price", "unit_price", "unitprice", "base_price", "selling_price", "mrp", "item_cost"],
    "order_date": ["date", "created_at", "transaction_date", "timestamp", "sold_at", "invoicedate"],
    "discount_amount": ["discount", "rebate", "savings", "total_discount"],
    "refund_amount": ["refunded", "returns_value", "total_refund"],
    "line_total": ["total", "subtotal", "order_total", "grand_total", "row_total"],
    "return_reason_text": ["reason", "comment", "customer_comment", "note", "why", "return_reason", "reason_for_return"],
    "return_amount": ["refund", "refund_value", "amount_returned", "return_value"]
}


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
    """Lowercase + strip column names and handle fuzzy mapping."""
    # Phase 1: Basic cleaning
    df.columns = [str(c).strip().lower().replace(" ", "_").replace(".", "_") for c in df.columns]
    
    # Phase 2: Fuzzy mapping
    mapping = {}
    current_cols = set(df.columns)
    
    for canonical, list_of_synonyms in SYNONYMS.items():
        # If we already have the canonical column, skip
        if canonical in current_cols:
            continue
            
        # Check if any synonym exists in the current columns
        for syn in list_of_synonyms:
            if syn in current_cols:
                mapping[syn] = canonical
                break # Map only the first match
                
    if mapping:
        df = df.rename(columns=mapping)
        
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
    # In some datasets (like UCI Online Retail), returns are negative quantity lines
    if "quantity" in df.columns and "item_price" in df.columns:
        # Create a virtual refund column if it doesn't exist to capture negative lines
        if "refund_amount" not in df.columns:
            # If quantity is negative, we treat it as a refund of the absolute value
            df["refund_amount"] = df.apply(
                lambda x: abs(x["quantity"] * x["item_price"]) if x["quantity"] < 0 else 0, axis=1
            )
            # Then we zero out the negative quantity so it doesn't double-subtract in revenue
            df.loc[df["quantity"] < 0, "quantity"] = 0

    if "line_total" in df.columns and df["line_total"].sum() > 0:
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
