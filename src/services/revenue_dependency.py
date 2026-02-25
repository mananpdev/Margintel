"""
RevenueDependencyAnalyzer — pure deterministic.

Computes top-1 / top-3 / top-5 revenue concentration and flags risk level.
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from src.config import TOP1_HIGH_THRESHOLD, TOP1_MEDIUM_THRESHOLD, TOP3_HIGH_THRESHOLD
from src.schemas import revenue_dependency_risk


def analyze_dependency(
    orders_df: pd.DataFrame,
    profiling: dict,
) -> dict[str, Any]:
    """
    Produce the revenue_dependency_risk block.
    Uses the pre-computed _sku_revenue from profiling.
    """

    sku_rev: dict = profiling.get("_sku_revenue", {})
    if not sku_rev:
        return revenue_dependency_risk(
            risk_level="low",
            signals=[],
            concentration_metrics={"top1": 0.0, "top3": 0.0, "top5": 0.0},
        )

    # Sort descending
    sorted_revs = sorted(sku_rev.values(), reverse=True)
    total = sum(sorted_revs) or 1.0

    top1 = sorted_revs[0] / total if len(sorted_revs) >= 1 else 0.0
    top3 = sum(sorted_revs[:3]) / total if len(sorted_revs) >= 3 else sum(sorted_revs) / total
    top5 = sum(sorted_revs[:5]) / total if len(sorted_revs) >= 5 else sum(sorted_revs) / total

    concentration = {"top1": top1, "top3": top3, "top5": top5}

    # ── Risk classification ──────────────────────────────────────────────
    signals: list[dict] = []
    risk_level = "low"

    if top1 > TOP1_HIGH_THRESHOLD:
        risk_level = "high"
        signals.append({
            "signal": "top1_share_over_45pct",
            "value": round(top1, 4),
            "threshold": TOP1_HIGH_THRESHOLD,
        })
    elif top1 > TOP1_MEDIUM_THRESHOLD or top3 > TOP3_HIGH_THRESHOLD:
        risk_level = "medium"
        if top1 > TOP1_MEDIUM_THRESHOLD:
            signals.append({
                "signal": "top1_share_over_30pct",
                "value": round(top1, 4),
                "threshold": TOP1_MEDIUM_THRESHOLD,
            })
        if top3 > TOP3_HIGH_THRESHOLD:
            signals.append({
                "signal": "top3_share_over_65pct",
                "value": round(top3, 4),
                "threshold": TOP3_HIGH_THRESHOLD,
            })

    return revenue_dependency_risk(
        risk_level=risk_level,
        signals=signals,
        concentration_metrics=concentration,
    )
