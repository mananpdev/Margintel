"""
Smoke test — start the Flask app in-process and run a full pipeline test.
Updated for async pipeline (v0.1.1).

Usage:
    python smoke_test.py
"""

import json
import sys
import os
import time

# Ensure the project root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app import app


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample_data")


def run_smoke_test():
    print("=" * 60)
    print("  AI Margin Intelligence Engine — Smoke Test")
    print("=" * 60)

    client = app.test_client()

    # ── 1. Health check ──────────────────────────────────────────────
    print("\n[1/5] Health check …")
    resp = client.get("/health")
    assert resp.status_code == 200
    health = resp.get_json()
    print(f"       ✓  status={resp.status_code}  llm_available={health.get('llm_available')}")

    # ── 2. Submit run ────────────────────────────────────────────────
    print("\n[2/5] Submitting async run (orders + returns) …")
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
    # Now returns 202 accepted
    assert resp.status_code == 202, f"Expected 202, got {resp.status_code}: {resp.data}"
    run_data = resp.get_json()
    run_id = run_data["run_id"]
    print(f"       ✓  run_id={run_id}  status={run_data['status']} (HTTP 202)")

    # ── 3. Poll for completion ───────────────────────────────────────
    print("\n[3/5] Polling for pipeline completion …")
    max_retries = 60
    report = None
    for i in range(max_retries):
        resp = client.get(f"/v1/runs/{run_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        
        status = data.get("status")
        progress = data.get("progress", {})
        pct = progress.get("pct", 0)
        label = progress.get("label", "Initializing")
        
        sys.stdout.write(f"\r       →  [{pct:3}%] {label:40}")
        sys.stdout.flush()

        if status == "done":
            report = data.get("report")
            print("\n       ✓  Pipeline complete.")
            break
        elif status == "error":
            print(f"\n       ✗  Pipeline error: {data.get('error')}")
            sys.exit(1)
        
        time.sleep(1)
    else:
        print("\n       ✗  Timed out waiting for pipeline.")
        sys.exit(1)

    # ── 4. Retrieve list endpoint ────────────────────────────────────
    print("\n[4/5] Verifying run list endpoint …")
    resp = client.get("/v1/runs")
    assert resp.status_code == 200
    list_data = resp.get_json()
    runs = list_data.get("runs", [])
    found = any(r["id"] == run_id for r in runs)
    print(f"       ✓  Found {len(runs)} items in history index. Current run present: {found}")

    # ── 5. Validate schema structure ─────────────────────────────────
    print("\n[5/5] Validating output schema …")
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
    }
    print(json.dumps(summary, indent=2))

    # ── Download endpoint ──
    print("\n── Download endpoint ──")
    resp = client.get(f"/v1/runs/{run_id}/download")
    assert resp.status_code == 200
    assert "attachment" in resp.headers.get("Content-Disposition", "")
    print(f"       ✓  Download works, Content-Disposition set")
    print()


if __name__ == "__main__":
    run_smoke_test()
