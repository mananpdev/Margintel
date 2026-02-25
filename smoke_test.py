"""
Smoke test — start the Flask app in-process and run a full pipeline test.

Usage:
    python smoke_test.py
"""

import json
import sys
import os

# Ensure the project root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app import app


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample_data")


def run_smoke_test():
    print("=" * 60)
    print("  Margintel — Smoke Test")
    print("=" * 60)

    client = app.test_client()

    # ── 1. Health check ──────────────────────────────────────────────
    print("\n[1/4] Health check …")
    resp = client.get("/health")
    assert resp.status_code == 200
    health = resp.get_json()
    print(f"       ✓  status={resp.status_code}  llm_available={health.get('llm_available')}")

    # ── 2. Submit run with both CSVs ─────────────────────────────────
    print("\n[2/4] Submitting run (orders + returns) …")
    with open(os.path.join(SAMPLE_DIR, "orders.csv"), "rb") as of, \
         open(os.path.join(SAMPLE_DIR, "returns.csv"), "rb") as rf:
        resp = client.post(
            "/v1/runs",
            data={
                "orders_file": (of, "orders.csv"),
                "returns_file": (rf, "returns.csv"),
                "business_goal": "Identify margin risks and prioritize fixes",
                "constraints": "2-week sprint, no new tools",
            },
            content_type="multipart/form-data",
        )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.data}"
    run_data = resp.get_json()
    run_id = run_data["run_id"]
    print(f"       ✓  run_id={run_id}  status={run_data['status']}")

    # ── 3. Retrieve report ───────────────────────────────────────────
    print("\n[3/4] Retrieving report …")
    resp = client.get(f"/v1/runs/{run_id}")
    assert resp.status_code == 200
    full = resp.get_json()
    report = full.get("report", full)
    print(f"       ✓  report keys: {list(report.keys())}")

    # ── 4. Validate schema structure ─────────────────────────────────
    print("\n[4/4] Validating output schema …")
    errors = []

    def check(path, obj, key):
        if key not in obj:
            errors.append(f"Missing: {path}.{key}")

    check("report", report, "run_id")
    check("report", report, "generated_at")
    check("report", report, "dataset_summary")
    check("report", report, "profiling")
    check("report", report, "modules")
    check("report", report, "decision_output")

    if "dataset_summary" in report:
        ds = report["dataset_summary"]
        for k in ["orders_rows", "returns_rows", "date_range", "currency", "notes"]:
            check("dataset_summary", ds, k)

    if "profiling" in report:
        pf = report["profiling"]
        for k in ["total_revenue", "total_refunds", "aov", "top_sku_revenue_share", "high_return_skus"]:
            check("profiling", pf, k)

    if "modules" in report:
        mods = report["modules"]
        check("modules", mods, "returns_intelligence")
        check("modules", mods, "revenue_dependency_risk")

        if "returns_intelligence" in mods:
            ri = mods["returns_intelligence"]
            check("returns_intelligence", ri, "themes")
            check("returns_intelligence", ri, "top_risk_skus")

        if "revenue_dependency_risk" in mods:
            rd = mods["revenue_dependency_risk"]
            check("revenue_dependency_risk", rd, "risk_level")
            check("revenue_dependency_risk", rd, "signals")
            check("revenue_dependency_risk", rd, "concentration_metrics")

    if "decision_output" in report:
        do = report["decision_output"]
        check("decision_output", do, "ranked_actions")
        check("decision_output", do, "limitations")
        check("decision_output", do, "next_questions")

    if errors:
        print("       ✗  Schema validation errors:")
        for e in errors:
            print(f"          - {e}")
        sys.exit(1)
    else:
        print("       ✓  All schema fields present")

    # ── Summary ──────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  SMOKE TEST PASSED ✓")
    print("=" * 60)

    # Pretty-print report excerpt
    print("\n── Report Excerpt ──")
    summary = {
        "run_id": report.get("run_id"),
        "generated_at": report.get("generated_at"),
        "total_revenue": report.get("profiling", {}).get("total_revenue"),
        "total_refunds": report.get("profiling", {}).get("total_refunds"),
        "aov": report.get("profiling", {}).get("aov"),
        "revenue_risk_level": report.get("modules", {}).get("revenue_dependency_risk", {}).get("risk_level"),
        "high_return_skus_count": len(report.get("profiling", {}).get("high_return_skus", [])),
        "top_risk_skus_count": len(report.get("modules", {}).get("returns_intelligence", {}).get("top_risk_skus", [])),
        "ranked_actions_count": len(report.get("decision_output", {}).get("ranked_actions", [])),
    }
    print(json.dumps(summary, indent=2))

    # ── 5. Download endpoint ─────────────────────────────────────────
    print("\n── Download endpoint ──")
    resp = client.get(f"/v1/runs/{run_id}/download")
    assert resp.status_code == 200
    assert "attachment" in resp.headers.get("Content-Disposition", "")
    print(f"       ✓  Download works, Content-Disposition set")

    print()


if __name__ == "__main__":
    run_smoke_test()
