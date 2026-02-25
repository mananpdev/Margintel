import logging
import threading
from typing import Tuple, List, Optional
from flask import request
from src.utils.ids import new_run_id
from src.utils.csv_loader import load_orders_csv, load_returns_csv
from src.utils.validators import ValidationError
from src.storage.memory_store import store_run, update_progress
from src.services.profiler import profile_orders
from src.services.returns_analyzer import analyze_returns
from src.services.revenue_dependency import analyze_dependency
from src.services.report_builder import build_report

logger = logging.getLogger(__name__)

class RunService:
    """
    Expert-level service layer to encapsulate the lifecycle of an analysis run.
    Decouples HTTP handling from core business logic.
    """
    
    def __init__(self, llm_client):
        self.llm = llm_client

    def start_analysis_pipeline(
        self, 
        orders_file, 
        returns_file=None, 
        business_goal: str = "", 
        constraints: str = ""
    ) -> Tuple[str, Optional[str]]:
        """
        Parses inputs, initializes state, and kicks off the background engine.
        Returns: (run_id, error_message)
        """
        run_id = new_run_id()
        all_notes = []
        
        try:
            # 1. IO & Validation Layer
            orders_df, order_notes = load_orders_csv(orders_file)
            all_notes.extend(order_notes)
            
            returns_df = None
            returns_rows = 0
            if returns_file:
                returns_df, return_notes = load_returns_csv(returns_file)
                all_notes.extend(return_notes)
                returns_rows = len(returns_df)
            
            orders_rows = len(orders_df)
            
        except ValidationError as e:
            logger.warning("Validation failed for run %s: %s", run_id, e)
            return "", str(e)
        except Exception as e:
            logger.error("System error during ingestion for run %s: %s", run_id, e)
            return "", "Internal processing error during file ingestion."

        # 2. State Initialization
        store_run(run_id, {"status": "processing"})
        update_progress(run_id, 5, "Synchronizing data streams")
        
        # 3. Background Thread Injection
        # Note: In a larger app, we would use Celery/Redis here.
        thread = threading.Thread(
            target=self._execute_pipeline,
            args=(run_id, orders_df, returns_df, business_goal, constraints, 
                  orders_rows, returns_rows, all_notes),
            daemon=True
        )
        thread.start()
        
        return run_id, None

    def _execute_pipeline(self, run_id, orders_df, returns_df, goal, constraints, o_rows, r_rows, notes):
        """The core intelligence loop."""
        try:
            # Step A: Deterministic Reconstruction
            update_progress(run_id, 15, "Executing contribution models")
            profiling = profile_orders(orders_df, returns_df)
            
            # Step B: Semantic Vectorization
            update_progress(run_id, 35, "Correlating return signatures")
            returns_signals = analyze_returns(orders_df, returns_df, profiling, llm=self.llm)
            
            # Step C: Risk Mapping
            update_progress(run_id, 55, "Mapping revenue dependency risk")
            dependency = analyze_dependency(orders_df, profiling)
            
            # Step D: Neural Synthesis
            update_progress(run_id, 75, "Synthesizing LLM intelligence")
            decision = self.llm.rank_actions(
                business_goal=goal,
                constraints=constraints,
                profiling=profiling,
                modules={
                    "returns_intelligence": returns_signals,
                    "revenue_dependency_risk": dependency,
                }
            )
            
            # Step E: Report Assembly
            update_progress(run_id, 95, "Finalizing strategic report")
            report = build_report(
                run_id=run_id,
                profiling=profiling,
                returns_signals=returns_signals,
                dependency=dependency,
                decision=decision,
                orders_rows=o_rows,
                returns_rows=r_rows,
                notes=notes
            )
            
            store_run(run_id, {"status": "done", "report": report})
            update_progress(run_id, 100, "Analysis complete")
            logger.info("Pipeline execution SUCCESS for run %s", run_id)

        except Exception as e:
            logger.exception("Pipeline CRASHED for run %s", run_id)
            store_run(run_id, {"status": "error", "error": str(e)})
            update_progress(run_id, 0, f"Critical System Error: {str(e)[:50]}")
