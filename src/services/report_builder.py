"""
ReportBuilder — assembles the final JSON report from all module outputs.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from src.config import CURRENCY
from src.schemas import dataset_summary, decision_output


def build_report(
    run_id: str,
    profiling: dict,
    returns_signals: dict,
    dependency: dict,
    decision: dict,
    orders_rows: int,
    returns_rows: int,
    notes: list[str],
) -> dict[str, Any]:
    """
    Compose the final report matching the output contract.
    """

    # Clean internal keys from profiling, but keep sku_revenue for charts
    clean_profiling = {k: v for k, v in profiling.items() if not k.startswith("_")}
    # Expose per-SKU revenue for frontend visualisation
    sku_rev = profiling.get("_sku_revenue", {})
    if sku_rev:
        clean_profiling["sku_revenue_breakdown"] = {
            str(k): round(float(v), 2) for k, v in sku_rev.items()
        }

    report = {
        "run_id": run_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_summary": dataset_summary(
            orders_rows=orders_rows,
            returns_rows=returns_rows,
            date_start=profiling.get("_date_start", ""),
            date_end=profiling.get("_date_end", ""),
            currency=CURRENCY,
            notes=notes,
        ),
        "profiling": clean_profiling,
        "modules": {
            "returns_intelligence": returns_signals,
            "revenue_dependency_risk": dependency,
        },
        "decision_output": decision_output(
            ranked_actions=decision.get("ranked_actions", []),
            limitations=decision.get("limitations", []),
            next_questions=decision.get("next_questions", []),
        ),
    }

    return report
