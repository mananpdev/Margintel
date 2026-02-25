"""
AI Margin Intelligence Engine v0.1

Flask API that takes structured ecommerce CSV exports and produces a
machine-usable JSON report with return intelligence, revenue dependency
risk, and ranked actions.

Pipeline runs asynchronously in a background thread. Clients poll
GET /v1/runs/<run_id> for status and progress updates.
"""

from __future__ import annotations

import json
import logging
import threading

from flask import Flask, request, jsonify, Response
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
from src.storage.memory_store import (
    store_run, get_run, list_runs_summary,
)
from src.services.run_service import RunService

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("margin-intel")

# ── App ──────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
llm = LLMClient()
run_service = RunService(llm)


# ═════════════════════════════════════════════════════════════════════════════
# Pipeline (runs in background thread)
# ═════════════════════════════════════════════════════════════════════════════

# Logic moved to src.services.run_service.RunService


# ═════════════════════════════════════════════════════════════════════════════
# Endpoints
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/")
def index():
    """API root — directs users to the React frontend."""
    return jsonify({"api": "Margin Intelligence Engine v0.1", "ui": "http://localhost:5173"})


@app.get("/health")
def health():
    """Health check."""
    return jsonify({"ok": True, "llm_available": llm.available})


@app.post("/v1/runs")
def create_run():
    """
    POST /v1/runs
    Standardized entry for multi-part dataset ingestion.
    """
    orders_file = request.files.get("orders_file")
    if not orders_file:
        return jsonify({"error": "Dataset ingestion requires orders_file (CSV)"}), 400

    returns_file = request.files.get("returns_file")
    business_goal = request.form.get("business_goal", "Maximize contribution margin")
    constraints = request.form.get("constraints", "")

    run_id, error = run_service.start_analysis_pipeline(
        orders_file=orders_file,
        returns_file=returns_file,
        business_goal=business_goal,
        constraints=constraints
    )

    if error:
        return jsonify({"error": error}), 422

    return jsonify({"run_id": run_id, "status": "processing"}), 202


@app.get("/v1/runs")
def list_runs():
    """GET /v1/runs — returns a summary list of all completed runs."""
    return jsonify({"runs": list_runs_summary()})


@app.get("/v1/runs/<run_id>")
def get_run_report(run_id: str):
    """GET /v1/runs/<run_id> — returns the full report, status, and progress."""
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
