"""
Tests for RevenueDependencyAnalyzer.
"""

import pandas as pd
import pytest

from src.services.revenue_dependency import analyze_dependency


def _make_profiling(sku_revenue: dict) -> dict:
    """Build a minimal profiling dict with _sku_revenue."""
    return {"_sku_revenue": sku_revenue}


def _make_orders_df(sku_revenue: dict) -> pd.DataFrame:
    """Build a dummy orders DataFrame (not used directly by analyze_dependency)."""
    rows = []
    for sku, rev in sku_revenue.items():
        rows.append({"order_id": f"ord-{sku}", "sku": sku, "_revenue": rev})
    return pd.DataFrame(rows)


class TestRevenueDependency:

    def test_low_risk_even_distribution(self):
        # 10 SKUs at 10% each → top1=10%, top3=30% → well below thresholds
        rev = {f"SKU-{i}": 10.0 for i in range(10)}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        assert result["risk_level"] == "low"

    def test_high_risk_single_dominant_sku(self):
        rev = {"A": 50.0, "B": 10.0, "C": 10.0, "D": 10.0, "E": 10.0, "F": 10.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        assert result["risk_level"] == "high"

    def test_medium_risk_top1_over_30pct(self):
        rev = {"A": 35.0, "B": 25.0, "C": 20.0, "D": 10.0, "E": 10.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        assert result["risk_level"] == "medium"

    def test_medium_risk_top3_over_65pct(self):
        rev = {"A": 25.0, "B": 25.0, "C": 20.0, "D": 15.0, "E": 15.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        # top3 = 70/100 = 0.70 > 0.65 → medium
        assert result["risk_level"] == "medium"

    def test_concentration_metrics_sum(self):
        rev = {"A": 50.0, "B": 30.0, "C": 20.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        metrics = result["concentration_metrics"]
        # With only 3 SKUs, top5 should equal 1.0
        assert abs(metrics["top5"] - 1.0) < 0.01

    def test_single_sku(self):
        rev = {"A": 100.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        assert result["risk_level"] == "high"
        assert result["concentration_metrics"]["top1"] == 1.0

    def test_two_skus(self):
        rev = {"A": 60.0, "B": 40.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        assert result["concentration_metrics"]["top1"] == 0.6

    def test_empty_profiling_sku_revenue(self):
        result = analyze_dependency(pd.DataFrame(), _make_profiling({}))
        assert result["risk_level"] == "low"
        assert result["concentration_metrics"]["top1"] == 0.0

    def test_signals_contain_value_and_threshold(self):
        rev = {"A": 50.0, "B": 10.0, "C": 10.0, "D": 10.0, "E": 10.0, "F": 10.0}
        result = analyze_dependency(_make_orders_df(rev), _make_profiling(rev))
        for signal in result["signals"]:
            assert "value" in signal
            assert "threshold" in signal
            assert "signal" in signal
