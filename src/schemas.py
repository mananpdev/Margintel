"""
Pydantic-free schema helpers.

These are plain dicts that match the output contract. Using factory
functions keeps the contract in one place and makes report_builder thin.
"""

from typing import Any


def dataset_summary(
    orders_rows: int,
    returns_rows: int,
    date_start: str,
    date_end: str,
    currency: str,
    notes: list[str],
) -> dict[str, Any]:
    return {
        "orders_rows": orders_rows,
        "returns_rows": returns_rows,
        "date_range": {"start": date_start, "end": date_end},
        "currency": currency,
        "notes": notes,
    }


def profiling_section(
    total_revenue: float,
    total_refunds: float,
    aov: float,
    top_sku_revenue_share: dict[str, float],
    high_return_skus: list[dict],
) -> dict[str, Any]:
    return {
        "total_revenue": round(total_revenue, 2),
        "total_refunds": round(total_refunds, 2),
        "aov": round(aov, 2),
        "top_sku_revenue_share": {
            k: round(v, 4) for k, v in top_sku_revenue_share.items()
        },
        "high_return_skus": high_return_skus,
    }


def returns_intelligence(
    themes: list[dict],
    top_risk_skus: list[dict],
) -> dict[str, Any]:
    return {
        "themes": themes,
        "top_risk_skus": top_risk_skus,
    }


def revenue_dependency_risk(
    risk_level: str,
    signals: list[dict],
    concentration_metrics: dict[str, float],
) -> dict[str, Any]:
    return {
        "risk_level": risk_level,
        "signals": signals,
        "concentration_metrics": {
            k: round(v, 4) for k, v in concentration_metrics.items()
        },
    }


def decision_output(
    ranked_actions: list[dict],
    limitations: list[str],
    next_questions: list[str],
) -> dict[str, Any]:
    return {
        "ranked_actions": ranked_actions,
        "limitations": limitations,
        "next_questions": next_questions,
    }
