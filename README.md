# Margintel (AI Margin Intelligence Engine v0.1.1)

> **Margintel** is an industrial-grade intelligence engine that converts raw ecommerce transaction layers into machine-usable strategic roadmaps.

---

## ✦ The Intelligence Architecture

Margintel separates deterministic financial truth from strategic generative reasoning. This dual-layer approach ensures that every AI recommendation is anchored in validated statistical signals.

### 🔍 Analytic Modules

#### 1. DataProfiler (Deterministic Core)
- **Revenue Baseline**: Establishes Gross Contribution, AOV, and SKU-level distribution.
- **Concentration Modeling**: Computes Top-1, Top-3, and Top-5 SKU revenue share to identify Single Point of Failure (SPOF) risks.
- **Anomaly Detection**: Identifies High-Return SKUs by correlating return rates against revenue impact.

#### 2. ReturnsAnalyzer (Hybrid Logic)
- **Mode A (Semantic)**: Uses LLM clustering to group free-text `return_reason_text` into prioritized themes.
- **Mode B (Deterministic)**: Falls back to analyzing `refund_amount` patterns if semantic reasons are unavailable.
- **Severity Scoring**: Themes are assigned a severity (1-5) based on potential systematic impact.

#### 3. Revenue Dependency & Concentration
- **Risk Classification**: Automatically flags concentration risk levels (`low`, `medium`, `high`) based on Top-SKU thresholds.
- **Signal Vectoring**: Produces specific signals like `top1_share_over_45pct` to inform downstream action ranking.

#### 4. LLM Interpreter (Decision Layer)
- **Strategic Synthesis**: Ingests all profiling signals and clusters to produce ranked actions.
- **Context Awareness**: Tailors output based on user-provided `business_goal` and `constraints`.
- **Evidence-Based**: Every action includes list of specific metrics/signals used for reasoning.

---

## 📡 API v1 Interface

Margintel uses an **Asynchronous Pipeline** to ensure the API remains responsive during complex LLM synthesis.

### Endpoints

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/health` | 200 | Returns system status and `llm_available` flag. |
| `POST` | `/v1/runs` | 202 | Accepts CSV files. Starts background thread. Returns `run_id`. |
| `GET` | `/v1/runs` | 200 | Returns summary index of all history items stored in memory. |
| `GET` | `/v1/runs/<id>` | 200 | Returns progress telemetry, status, and full report when ready. |
| `GET` | `/v1/runs/<id>/download` | 200 | Triggers `application/json` download with proper headers. |

### The Telemetry Pipeline
While a run is `processing`, clients can poll for these real-time progress steps:
1. `Synchronizing data streams` (Data ingestion & validation)
2. `Executing contribution models` (Profiling & Stats)
3. `Correlating return signatures` (Returns analysis & clustering)
4. `Mapping revenue dependency risk` (Concentration analysis)
5. `Synthesizing LLM intelligence` (LLM Decision ranking)
6. `Finalizing strategic report` (Report assembly)

---

## 🖥 The Dashboard (UX/UI)

A high-performance, dark-themed interface built for data-intensive workflows.

### ✦ Visual Intelligence
- **Interactive Background**: A fluid cyan-indigo spotlight system built with `framer-motion` springs.
- **Loading Skeletons**: Pulsing placeholder components maintain layout stability during analysis.
- **Data Visualization**: Recharts integration for Revenue Distribution (Pie) and Concentration Bars.
- **Independant Scrolling**: Multi-pane layout allows independent scrolling of inputs and results.

### ✦ Operation & Productivity
- **History Index**: Hydrates on mount from the backend, allowing access to previous runs even after page refreshes.
- **Advanced Parameters**: Toggleable panel to specify a custom `Business Goal` or `Constraints`.
- **Hotkeys**:
  - `Ctrl + Enter`: Execute Analysis
  - `Escape`: Reset/Clear current report view
- **Reliability**: Integrated Error Boundaries prevent UI crashes if data payloads contain anomalies. 
- **Blob-Stream Export**: Uses fetch-blob to ensure reliable file saving across all modern browsers.

---

## � Data Schema & Validation

### Required Columns (Orders)
| Column | Type | Description |
|---|---|---|
| `order_id` | String | Unique transaction ID |
| `sku` | String | Product identifier |
| `quantity` | Number | Items sold |
| `item_price` | Number | Unit price |

### Optional Enrichment Columns
| Column | Layer | Influence |
|---|---|---|
| `order_date` | Orders | Enables date-range summary |
| `refund_amount` | Orders | Enables Mode-B refund analysis |
| `discount_amount`| Orders | Refines gross contribution accuracy |
| `line_total` | Orders | Direct revenue source (overrides compute) |
| `return_reason_text`| Returns| Enables semantic theme clustering |
| `return_amount` | Returns| Enables Mode-A return-count analysis |

---

## � System Architecture

```
margin-intel-engine/
├── app.py                      # Flask Server (Async Pipeline Entry)
├── src/
│   ├── config.py               # Config & Thresholds (0.10 return rate, etc)
│   ├── schemas.py              # Output Contract Factory
│   ├── services/
│   │   ├── profiler.py         # Calculation Logic
│   │   ├── llm_client.py       # OpenAI Prompts (System & User messages)
│   │   └── report_builder.py   # Final JSON Assembly
│   ├── utils/
│   │   ├── csv_loader.py       # Float/Date Coercion & Normalization
│   │   └── validators.py       # Structural Integrity Checks
│   └── storage/
│       └── memory_store.py     # Thread-safe metadata store
└── frontend/
    ├── vite.config.js          # API Proxying & Build setup
    └── src/
        ├── App.jsx             # State, Telemetry Polling, History Logic
        ├── index.css           # CSS Variables & Tailwind-grade utilities
        └── components/         # Atomic UI components
```

---

## ⚙ Configuration Values

Defined in `.env`, utilized by `src/config.py`:

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | (empty) | Enables LLM semantic clustering & ranking |
| `LLM_MODEL` | `gpt-4o-mini`| Target model for reasoning |
| `RETURN_RATE_THRESHOLD`| `0.10` | Sensitivity for high-return SKU flags |
| `CURRENCY` | `CAD` | Labeling for all financial metrics |
| `MAX_ACTIONS` | `7` | Maximum actions returned by decision model |
| `MAX_REASON_SAMPLES` | `80` | Max return reasons sent for clustering |

---

## 📝 License / Copyright

© 2026 Margintel Inc. Codebase is MIT licensed.
