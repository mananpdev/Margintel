"""
DataProfiler — deterministic metrics used by all downstream modules.

Inputs:  orders DataFrame (with pre-computed `_revenue` column)
Outputs: profiling dict matching the output schema.
"""

from __future__ import annotations

import pandas as pd
import numpy as np

from src.schemas import profiling_section


def profile_orders(
    orders_df: pd.DataFrame,
    returns_df: pd.DataFrame | None = None,
) -> dict:
    """
    Compute deterministic profiling metrics.

    Parameters
    ----------
    orders_df : pd.DataFrame
        Must already have `_revenue` column (added by csv_loader).
    returns_df : pd.DataFrame | None
        Optional returns data.

    Returns
    -------
    dict  matching schemas.profiling_section
    """

    total_revenue = float(orders_df["_revenue"].sum())
    total_orders = int(orders_df["order_id"].nunique())
    aov = total_revenue / total_orders if total_orders else 0.0

    # ── Refund totals ────────────────────────────────────────────────────
    total_refunds = 0.0
    if "refund_amount" in orders_df.columns:
        total_refunds = float(orders_df["refund_amount"].sum())

    # ── Per-SKU revenue ──────────────────────────────────────────────────
    sku_rev = (
        orders_df.groupby("sku")["_revenue"]
        .sum()
        .sort_values(ascending=False)
    )
    total_for_share = sku_rev.sum() if sku_rev.sum() > 0 else 1.0
    cumulative_shares = sku_rev.cumsum() / total_for_share

    top_sku_revenue_share = {
        "top1": float(cumulative_shares.iloc[0]) if len(cumulative_shares) >= 1 else 0.0,
        "top3": float(cumulative_shares.iloc[min(2, len(cumulative_shares) - 1)]),
        "top5": float(cumulative_shares.iloc[min(4, len(cumulative_shares) - 1)]),
    }

    # ── High-return SKUs ─────────────────────────────────────────────────
    high_return_skus = _compute_high_return_skus(orders_df, returns_df, sku_rev)

    # ── Date range ───────────────────────────────────────────────────────
    date_start, date_end = "", ""
    if "order_date" in orders_df.columns:
        valid_dates = orders_df["order_date"].dropna()
        if len(valid_dates):
            date_start = str(valid_dates.min().date())
            date_end = str(valid_dates.max().date())

    return {
        **profiling_section(
            total_revenue=total_revenue,
            total_refunds=total_refunds,
            aov=aov,
            top_sku_revenue_share=top_sku_revenue_share,
            high_return_skus=high_return_skus,
        ),
        "_sku_revenue": sku_rev.to_dict(),   # internal, stripped before output
        "_date_start": date_start,
        "_date_end": date_end,
        "_total_orders": total_orders,
    }


def _compute_high_return_skus(
    orders_df: pd.DataFrame,
    returns_df: pd.DataFrame | None,
    sku_rev: pd.Series,
) -> list[dict]:
    """
    Identify SKUs with elevated return / refund rates relative to revenue.
    """
    results: list[dict] = []

    if returns_df is not None and len(returns_df) > 0:
        # Count-based return rate
        order_sku_counts = orders_df.groupby("sku")["order_id"].nunique()
        return_sku_counts = returns_df.groupby("sku").size()

        for sku in return_sku_counts.index:
            orders_count = order_sku_counts.get(sku, 0)
            if orders_count == 0:
                continue
            return_rate = float(return_sku_counts[sku]) / orders_count
            revenue = float(sku_rev.get(sku, 0))
            estimated_margin_risk = return_rate * revenue
            results.append({
                "sku": str(sku),
                "return_rate": round(return_rate, 4),
                "revenue": round(revenue, 2),
                "estimated_margin_risk": round(estimated_margin_risk, 2),
            })

    elif "refund_amount" in orders_df.columns:
        # Fallback: refund-based
        sku_refunds = orders_df.groupby("sku")["refund_amount"].sum()
        for sku in sku_refunds.index:
            revenue = float(sku_rev.get(sku, 0))
            if revenue == 0:
                continue
            refund_share = float(sku_refunds[sku]) / revenue
            results.append({
                "sku": str(sku),
                "return_rate": round(refund_share, 4),  # actually refund rate
                "revenue": round(revenue, 2),
                "estimated_margin_risk": round(float(sku_refunds[sku]), 2),
            })

    # Sort by estimated margin risk descending, keep top 20
    results.sort(key=lambda x: x["estimated_margin_risk"], reverse=True)
    return results[:20]
