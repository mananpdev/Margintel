"""
Central configuration — reads from environment / .env file.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM ──────────────────────────────────────────────────────────────────────
# ── LLM ──────────────────────────────────────────────────────────────────────
_raw_key = os.getenv("OPENAI_API_KEY", "")
# Avoid treating "sk-your-key-here" or similar placeholders as valid keys
if "your-key" in _raw_key.lower() or "placeholder" in _raw_key.lower() or not _raw_key.startswith("sk-"):
    OPENAI_API_KEY = ""
else:
    OPENAI_API_KEY = _raw_key

LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")

# ── Thresholds (deterministic) ───────────────────────────────────────────────
RETURN_RATE_THRESHOLD: float = float(os.getenv("RETURN_RATE_THRESHOLD", "0.10"))
REVENUE_SHARE_THRESHOLD: float = float(os.getenv("REVENUE_SHARE_THRESHOLD", "0.05"))

# Revenue concentration risk thresholds
TOP1_HIGH_THRESHOLD: float = 0.45
TOP1_MEDIUM_THRESHOLD: float = 0.30
TOP3_HIGH_THRESHOLD: float = 0.65

# ── App ──────────────────────────────────────────────────────────────────────
FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
PORT: int = int(os.getenv("PORT", "5000"))
CURRENCY: str = os.getenv("CURRENCY", "CAD")

# ── LLM sampling defaults ───────────────────────────────────────────────────
MAX_REASON_SAMPLES: int = int(os.getenv("MAX_REASON_SAMPLES", "80"))
MAX_ACTIONS: int = 7
