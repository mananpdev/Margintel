"""
LLMClient — wraps OpenAI SDK for structured JSON output.

Two prompts:
  1. cluster_return_reasons  — theme clustering
  2. rank_actions            — decision & action ranking

Falls back gracefully when API key is missing (returns empty/placeholder data).
"""

from __future__ import annotations

import json
import logging
from typing import Any

from src.config import OPENAI_API_KEY, LLM_MODEL, MAX_ACTIONS

logger = logging.getLogger(__name__)


class LLMClient:
    """Thin wrapper around OpenAI Chat Completions for structured JSON."""

    def __init__(self):
        self._client = None
        if OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=OPENAI_API_KEY)
                logger.info("OpenAI client initialized (model=%s)", LLM_MODEL)
            except Exception as exc:
                logger.warning("OpenAI client init failed: %s", exc)
        else:
            logger.info("No OPENAI_API_KEY set — LLM features disabled")

    @property
    def available(self) -> bool:
        return self._client is not None

    # ── Prompt 1: Return Reason Theme Clustering ─────────────────────────

    def cluster_return_reasons(self, sample: list[dict]) -> list[dict]:
        """
        Cluster return reasons into 5-8 themes.
        Returns: list of theme dicts.
        """
        if not self.available:
            logger.info("LLM unavailable — skipping reason clustering.")
            return []

        system_msg = (
            "You are a data operations analyst. "
            "You must output valid JSON only. No extra text."
        )

        user_msg = (
            "Cluster the following return reasons into 5-8 themes. "
            "For each theme provide:\n"
            "- theme (short label)\n"
            "- examples (2-3 short phrases)\n"
            "- skus_affected (list of SKUs)\n"
            "- severity (1-5) where 5 means likely systematic product/fulfillment issue.\n\n"
            "INPUT JSON:\n"
            f'{{"top_reasons_sample": {json.dumps(sample)}}}\n\n'
            "OUTPUT JSON SCHEMA:\n"
            '{"themes": [{"theme":"", "examples":["",""], "skus_affected":[""], "severity": 1}]}'
        )

        raw = self._call(system_msg, user_msg)
        if not raw:
            logger.warning("cluster_return_reasons: LLM returned empty response")
            return []
        parsed = self._parse_json(raw)
        themes = parsed.get("themes", [])
        logger.info("cluster_return_reasons: got %d themes", len(themes))
        return themes

    # ── Prompt 2: Decision & Action Ranking ──────────────────────────────

    def rank_actions(
        self,
        business_goal: str,
        constraints: str,
        profiling: dict,
        modules: dict,
    ) -> dict[str, Any]:
        """
        Produce ranked actions, limitations, next questions.
        """
        if not self.available:
            logger.info("LLM unavailable — returning placeholder decision output.")
            return _placeholder_decision()

        # Strip internal keys from profiling before sending
        clean_profiling = {k: v for k, v in profiling.items() if not k.startswith("_")}

        input_payload = {
            "business_goal": business_goal,
            "constraints": constraints,
            "profiling": clean_profiling,
            "modules": modules,
        }

        system_msg = (
            "You are an AI workflow engine that produces machine-usable decisions. "
            "Output valid JSON only."
        )

        user_msg = (
            f"Given this profiling summary and detected signals, produce {MAX_ACTIONS} ranked actions.\n"
            "Rules:\n"
            "- Each action must include evidence_used referencing specific signals or metrics.\n"
            "- Use expected_impact in {low,medium,high}.\n"
            "- confidence is 0.0-1.0.\n"
            "- Include limitations and next_questions.\n\n"
            f"INPUT JSON:\n{json.dumps(input_payload, default=str)}\n\n"
            "OUTPUT JSON SCHEMA:\n"
            '{"ranked_actions": [{"rank": 1, "action_type": "data_fix|business_experiment|further_analysis", '
            '"title": "", "why_it_matters": "", "how_to_execute": ["",""], '
            '"success_metric": "", "expected_impact": "low|medium|high", '
            '"confidence": 0.0, "evidence_used": ["",""]}], '
            '"limitations": ["",""], "next_questions": ["",""]}'
        )

        raw = self._call(system_msg, user_msg)
        parsed = self._parse_json(raw)

        return {
            "ranked_actions": parsed.get("ranked_actions", []),
            "limitations": parsed.get("limitations", []),
            "next_questions": parsed.get("next_questions", []),
        }

    # ── internals ────────────────────────────────────────────────────────

    def _call(self, system_msg: str, user_msg: str) -> str:
        if not self._client:
            return ""
        try:
            logger.info("LLM call starting (model=%s)...", LLM_MODEL)
            resp = self._client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                max_tokens=4096,
                response_format={"type": "json_object"},
            )
            result = resp.choices[0].message.content or ""
            logger.info("LLM call success (%d chars)", len(result))
            return result
        except Exception as exc:
            logger.error("LLM API call failed: %s", exc)
            return ""

    @staticmethod
    def _parse_json(raw: str) -> dict:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.error("LLM returned invalid JSON: %s…", raw[:200])
            return {}


# ── Fallback when no API key ─────────────────────────────────────────────────

def _placeholder_decision() -> dict[str, Any]:
    return {
        "ranked_actions": [
            {
                "rank": 1,
                "action_type": "further_analysis",
                "title": "Configure OpenAI API key to enable LLM-powered action ranking",
                "why_it_matters": "Without an LLM, the engine can only provide deterministic metrics.",
                "how_to_execute": [
                    "Set OPENAI_API_KEY in your .env file",
                    "Restart the server",
                ],
                "success_metric": "LLM decision output populates with ranked actions",
                "expected_impact": "high",
                "confidence": 1.0,
                "evidence_used": ["OPENAI_API_KEY not set"],
            }
        ],
        "limitations": [
            "LLM unavailable — decision output is a placeholder",
            "Set OPENAI_API_KEY to unlock full analysis",
        ],
        "next_questions": [
            "What LLM model do you want to use? (default: gpt-4o-mini)"
        ],
    }
