"""
Tests for DataProfiler.
"""

import pandas as pd
import pytest

from src.services.profiler import profile_orders


def _make_orders_df():
    """Minimal test fixture."""
    return pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5],
        "sku": ["A", "A", "B", "B", "C"],
        "quantity": [1, 2, 1, 3, 5],
        "item_price": [10.0, 10.0, 20.0, 20.0, 5.0],
        "discount_amount": [0, 0, 5, 0, 0],
        "_revenue": [10.0, 20.0, 15.0, 60.0, 25.0],
        "refund_amount": [0, 10.0, 0, 0, 0],
        "order_date": pd.to_datetime([
            "2025-01-01", "2025-01-02", "2025-01-03",
            "2025-01-04", "2025-01-05",
        ]),
    })


class TestProfileOrders:

    def test_total_revenue(self):
        df = _make_orders_df()
        result = profile_orders(df)
        assert result["total_revenue"] == 130.0

    def test_total_refunds(self):
        df = _make_orders_df()
        result = profile_orders(df)
        assert result["total_refunds"] == 10.0

    def test_aov(self):
        df = _make_orders_df()
        result = profile_orders(df)
        # 5 unique orders, 130 total revenue → AOV = 26
        assert result["aov"] == 26.0

    def test_top_sku_revenue_share_keys(self):
        df = _make_orders_df()
        result = profile_orders(df)
        share = result["top_sku_revenue_share"]
        assert "top1" in share
        assert "top3" in share
        assert "top5" in share

    def test_top1_share_is_correct(self):
        df = _make_orders_df()
        result = profile_orders(df)
        # SKU B: 75 / 130 ≈ 0.5769
        assert abs(result["top_sku_revenue_share"]["top1"] - 75 / 130) < 0.01

    def test_date_range(self):
        df = _make_orders_df()
        result = profile_orders(df)
        assert result["_date_start"] == "2025-01-01"
        assert result["_date_end"] == "2025-01-05"

    def test_high_return_skus_with_returns_df(self):
        orders_df = _make_orders_df()
        returns_df = pd.DataFrame({
            "sku": ["A", "A", "B"],
        })
        result = profile_orders(orders_df, returns_df)
        assert len(result["high_return_skus"]) > 0

    def test_no_date_column(self):
        df = _make_orders_df().drop(columns=["order_date"])
        result = profile_orders(df)
        assert result["_date_start"] == ""
        assert result["_date_end"] == ""
