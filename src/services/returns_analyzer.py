"""
ReturnsAnalyzer — two modes:

  Mode A : returns.csv exists with free-text reasons → deterministic stats + LLM clustering
  Mode B : no returns.csv but refund_amount exists in orders → purely deterministic refund flags
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from src.config import RETURN_RATE_THRESHOLD, REVENUE_SHARE_THRESHOLD, MAX_REASON_SAMPLES
from src.schemas import returns_intelligence


def analyze_returns(
    orders_df: pd.DataFrame,
    returns_df: pd.DataFrame | None,
    profiling: dict,
    llm=None,
) -> dict[str, Any]:
    """
    Produce the returns_intelligence block.

    Parameters
    ----------
    orders_df   : cleaned orders
    returns_df  : cleaned returns (may be None)
    profiling   : output of profiler.profile_orders
    llm         : LLMClient instance (optional; needed for theme clustering)
    """

    sku_rev: dict = profiling.get("_sku_revenue", {})
    total_revenue = profiling.get("total_revenue", 1.0)

    themes: list[dict] = []
    top_risk_skus: list[dict] = []

    if returns_df is not None and len(returns_df) > 0:
        top_risk_skus = _mode_a_stats(orders_df, returns_df, sku_rev, total_revenue)

        # LLM clustering of reason text
        if llm and "return_reason_text" in returns_df.columns:
            themes = _cluster_reasons(returns_df, llm)
    else:
        # Mode B: refund-based
        top_risk_skus = _mode_b_stats(orders_df, sku_rev, total_revenue)

    return returns_intelligence(themes=themes, top_risk_skus=top_risk_skus)


# ── Mode A: returns CSV present ──────────────────────────────────────────────

def _mode_a_stats(
    orders_df: pd.DataFrame,
    returns_df: pd.DataFrame,
    sku_rev: dict,
    total_revenue: float,
) -> list[dict]:
    order_sku_counts = orders_df.groupby("sku")["order_id"].nunique()
    return_sku_counts = returns_df.groupby("sku").size()

    results: list[dict] = []
    for sku in return_sku_counts.index:
        orders_count = order_sku_counts.get(sku, 0)
        if orders_count == 0:
            continue
        return_rate = float(return_sku_counts[sku]) / orders_count
        revenue = float(sku_rev.get(sku, 0))
        revenue_share = revenue / total_revenue if total_revenue else 0

        if return_rate >= RETURN_RATE_THRESHOLD and revenue_share >= REVENUE_SHARE_THRESHOLD:
            results.append({
                "sku": str(sku),
                "return_rate": round(return_rate, 4),
                "revenue": round(revenue, 2),
                "impact_estimate": round(return_rate * revenue, 2),
                "evidence": [
                    f"return_rate={round(return_rate, 4)}",
                    f"revenue_share={round(revenue_share, 4)}",
                ],
            })

    results.sort(key=lambda x: x["impact_estimate"], reverse=True)
    return results[:10]


# ── Mode B: refund amounts only ──────────────────────────────────────────────

def _mode_b_stats(
    orders_df: pd.DataFrame,
    sku_rev: dict,
    total_revenue: float,
) -> list[dict]:
    if "refund_amount" not in orders_df.columns:
        return []

    sku_refunds = orders_df.groupby("sku")["refund_amount"].sum()
    results: list[dict] = []

    for sku, refund_total in sku_refunds.items():
        if refund_total <= 0:
            continue
        revenue = float(sku_rev.get(sku, 0))
        if revenue == 0:
            continue
        refund_rate = float(refund_total) / revenue
        revenue_share = revenue / total_revenue if total_revenue else 0

        if refund_rate >= RETURN_RATE_THRESHOLD and revenue_share >= REVENUE_SHARE_THRESHOLD:
            results.append({
                "sku": str(sku),
                "return_rate": round(refund_rate, 4),
                "revenue": round(revenue, 2),
                "impact_estimate": round(float(refund_total), 2),
                "evidence": [
                    f"refund_rate={round(refund_rate, 4)} (from refund_amount)",
                    f"revenue_share={round(revenue_share, 4)}",
                ],
            })

    results.sort(key=lambda x: x["impact_estimate"], reverse=True)
    return results[:10]


# ── LLM theme clustering ────────────────────────────────────────────────────

def _cluster_reasons(returns_df: pd.DataFrame, llm) -> list[dict]:
    """
    Build reason sample and call the LLM for clustering.
    """

    # Aggregate top reasons
    reason_counts = (
        returns_df.groupby(["sku", "return_reason_text"])
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(MAX_REASON_SAMPLES)
    )

    sample = [
        {"sku": row["sku"], "reason": row["return_reason_text"], "count": int(row["count"])}
        for _, row in reason_counts.iterrows()
    ]

    if not sample:
        return []

    return llm.cluster_return_reasons(sample)
