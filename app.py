"""
Margintel v0.1

Flask API that takes structured ecommerce CSV exports and produces a
machine-usable JSON report with return intelligence, revenue dependency
risk, and ranked actions.
"""

from __future__ import annotations

import logging

from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS

from src.config import FLASK_DEBUG, PORT
from src.utils.ids import new_run_id
from src.utils.csv_loader import load_orders_csv, load_returns_csv
from src.utils.validators import ValidationError
from src.services.profiler import profile_orders
from src.services.returns_analyzer import analyze_returns
from src.services.revenue_dependency import analyze_dependency
from src.services.llm_client import LLMClient
from src.services.report_builder import build_report
from src.storage.memory_store import store_run, get_run

import json

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("margintel")

# ── App ──────────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder="static")
CORS(app)
llm = LLMClient()


# ═════════════════════════════════════════════════════════════════════════════
# Endpoints
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/")
def index():
    """Serve the dashboard UI."""
    return send_from_directory("static", "index.html")


@app.get("/health")
def health():
    """Health check."""
    return jsonify({"ok": True, "llm_available": llm.available})


@app.post("/v1/runs")
def create_run():
    """
    POST /v1/runs
    Multipart form-data:
      - orders_file   (CSV, required)
      - returns_file  (CSV, optional)
      - business_goal (string, optional)
      - constraints   (string, optional)
    """
    run_id = new_run_id()
    logger.info("RUN %s — started", run_id)

    # ── Validate uploads ─────────────────────────────────────────────────
    orders_file = request.files.get("orders_file")
    if not orders_file:
        return jsonify({"error": "orders_file is required"}), 400

    returns_file = request.files.get("returns_file")
    business_goal = request.form.get(
        "business_goal", "Identify margin risks and prioritize fixes"
    )
    constraints = request.form.get("constraints", "")

    # ── Load & validate CSVs ─────────────────────────────────────────────
    all_notes: list[str] = []
    try:
        orders_df, order_notes = load_orders_csv(orders_file)
        all_notes.extend(order_notes)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 422

    returns_df = None
    returns_rows = 0
    if returns_file:
        try:
            returns_df, return_notes = load_returns_csv(returns_file)
            all_notes.extend(return_notes)
            returns_rows = len(returns_df)
        except ValidationError as exc:
            return jsonify({"error": str(exc)}), 422

    orders_rows = len(orders_df)
    logger.info("RUN %s — loaded %d orders, %d returns", run_id, orders_rows, returns_rows)

    # ── Step 1: Deterministic profiling ──────────────────────────────────
    store_run(run_id, {"status": "processing"})

    profiling = profile_orders(orders_df, returns_df)
    logger.info("RUN %s — profiling done", run_id)

    # ── Step 2: Returns analysis ─────────────────────────────────────────
    returns_signals = analyze_returns(orders_df, returns_df, profiling, llm=llm)
    logger.info("RUN %s — returns analysis done", run_id)

    # ── Step 3: Revenue dependency ───────────────────────────────────────
    dependency = analyze_dependency(orders_df, profiling)
    logger.info("RUN %s — revenue dependency done", run_id)

    # ── Step 4: LLM decision output ──────────────────────────────────────
    decision = llm.rank_actions(
        business_goal=business_goal,
        constraints=constraints,
        profiling=profiling,
        modules={
            "returns_intelligence": returns_signals,
            "revenue_dependency_risk": dependency,
        },
    )
    logger.info("RUN %s — decision output done", run_id)

    # ── Assemble final report ────────────────────────────────────────────
    report = build_report(
        run_id=run_id,
        profiling=profiling,
        returns_signals=returns_signals,
        dependency=dependency,
        decision=decision,
        orders_rows=orders_rows,
        returns_rows=returns_rows,
        notes=all_notes,
    )

    store_run(run_id, {"status": "done", "report": report})
    logger.info("RUN %s — complete ✓", run_id)

    return jsonify({"run_id": run_id, "status": "done"})


@app.get("/v1/runs/<run_id>")
def get_run_report(run_id: str):
    """GET /v1/runs/<run_id> — returns the full report or status."""
    data = get_run(run_id)
    if not data:
        return jsonify({"error": "not_found"}), 404
    return jsonify(data)


@app.get("/v1/runs/<run_id>/download")
def download_run_report(run_id: str):
    """GET /v1/runs/<run_id>/download — download report.json."""
    data = get_run(run_id)
    if not data:
        return jsonify({"error": "not_found"}), 404
    if data.get("status") != "done":
        return jsonify({"error": "run_not_complete", "status": data.get("status")}), 409

    report_json = json.dumps(data["report"], indent=2, default=str)
    return Response(
        report_json,
        mimetype="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=report_{run_id}.json"
        },
    )


# ═════════════════════════════════════════════════════════════════════════════
# Error handlers
# ═════════════════════════════════════════════════════════════════════════════

@app.errorhandler(422)
def unprocessable(e):
    return jsonify({"error": str(e)}), 422


@app.errorhandler(500)
def internal_error(e):
    logger.exception("Unhandled error")
    return jsonify({"error": "internal_server_error"}), 500


# ═════════════════════════════════════════════════════════════════════════════
# Entry point
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=PORT)
