# Margintel v0.1
> **Intelligent Margin Risk Analysis.** Take structured ecommerce CSV exports → get a machine-usable JSON report with return intelligence, revenue dependency risk, and ranked business actions.

---

## ✦ What It Does

| Layer | How |
|---|---|
| **Deterministic** | pandas stats, threshold math, concentration metrics |
| **LLM Reasoning** | Clusters return reasons, produces ranked decisions with confidence + evidence |

This separation is what makes it **not** a ChatGPT wrapper.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env → add your OPENAI_API_KEY (optional but recommended)
```

### 3. Run the Server

```bash
python app.py
```

Open **http://localhost:5000** for the dashboard UI.

### 4. Smoke Test

```bash
python smoke_test.py
```

### 5. Run Tests

```bash
pytest tests/ -v
```

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Dashboard UI |
| `GET` | `/health` | Health check (returns `llm_available` flag) |
| `POST` | `/v1/runs` | Create a new analysis run (multipart form) |
| `GET` | `/v1/runs/<run_id>` | Get run report or status |
| `GET` | `/v1/runs/<run_id>/download` | Download report as JSON file |

### POST /v1/runs — Form Fields

| Field | Type | Required | Default |
|---|---|---|---|
| `orders_file` | CSV file | ✅ | — |
| `returns_file` | CSV file | ❌ | — |
| `business_goal` | string | ❌ | "Identify margin risks and prioritize fixes" |
| `constraints` | string | ❌ | "" |

### Example (curl)

```bash
curl -X POST http://localhost:5000/v1/runs \
  -F "orders_file=@sample_data/orders.csv" \
  -F "returns_file=@sample_data/returns.csv" \
  -F "business_goal=Identify margin risks and prioritize fixes"
```

---

## 📊 Data Inputs

### orders.csv (required)

| Column | Required | Notes |
|---|---|---|
| `order_id` | ✅ | Unique order identifier |
| `sku` | ✅ | Product SKU |
| `quantity` | ✅ | — |
| `item_price` | ✅ | Unit price |
| `order_date` | ❌ | ISO format preferred |
| `discount_amount` | ❌ | Per-line discount |
| `refund_amount` | ❌ | Enables refund analysis |
| `line_total` | ❌ | If missing: `quantity × item_price - discount_amount` |

### returns.csv (optional — adds significant depth)

| Column | Required | Notes |
|---|---|---|
| `sku` | ✅ | — |
| `order_id` | ❌ | — |
| `return_date` | ❌ | — |
| `return_reason_text` | ❌ | Free text → enables LLM theme clustering |
| `return_amount` | ❌ | — |

---

## 📦 Output Schema

```json
{
  "run_id": "uuid",
  "generated_at": "ISO-8601",
  "dataset_summary": { "orders_rows", "returns_rows", "date_range", "currency", "notes" },
  "profiling": { "total_revenue", "total_refunds", "aov", "top_sku_revenue_share", "high_return_skus" },
  "modules": {
    "returns_intelligence": { "themes", "top_risk_skus" },
    "revenue_dependency_risk": { "risk_level", "signals", "concentration_metrics" }
  },
  "decision_output": { "ranked_actions", "limitations", "next_questions" }
}
```

---

## 🏗 Architecture

```
Client (Browser UI / Postman / curl)
        │
        ▼
Flask API ──────────────────────┐
  ├── Deterministic Profiling   │
  ├── Module A: Returns Analyzer│
  ├── Module B: Revenue Conc.   │
  ├── LLM Interpretation        │
  └── Report Composer + Store   │
        │                       │
        ▼                       │
JSON Report (view / download)   │
────────────────────────────────┘
```

## 📁 Project Structure

```
margin-intel-engine/
├── app.py                      # Flask entry point + routes
├── requirements.txt
├── .env.example
├── smoke_test.py               # End-to-end CLI test
├── sample_data/
│   ├── orders.csv
│   └── returns.csv
├── static/
│   └── index.html              # Dashboard UI
├── src/
│   ├── config.py               # Environment + thresholds
│   ├── schemas.py              # Output contract factories
│   ├── utils/
│   │   ├── csv_loader.py       # CSV parse + normalize
│   │   ├── validators.py       # Column validation
│   │   └── ids.py              # UUID generation
│   ├── services/
│   │   ├── profiler.py         # DataProfiler (deterministic)
│   │   ├── returns_analyzer.py # ReturnsAnalyzer (det. + LLM)
│   │   ├── revenue_dependency.py # RevenueDependencyAnalyzer
│   │   ├── llm_client.py       # OpenAI wrapper + prompts
│   │   └── report_builder.py   # Final report assembly
│   └── storage/
│       └── memory_store.py     # Thread-safe dict store
└── tests/
    ├── test_profiler.py
    └── test_revenue_dependency.py
```

---

## ⚙ Configuration

All config via environment variables (see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | OpenAI key (optional; degrades gracefully) |
| `LLM_MODEL` | `gpt-4o-mini` | Model for LLM prompts |
| `RETURN_RATE_THRESHOLD` | `0.10` | Min return rate to flag |
| `REVENUE_SHARE_THRESHOLD` | `0.05` | Min revenue share to flag |
| `FLASK_DEBUG` | `false` | Flask debug mode |
| `PORT` | `5000` | Server port |
| `CURRENCY` | `CAD` | Currency label in reports |

---

## 📝 License

MIT

---

**Developed by [mananpdev](https://github.com/mananpdev)**
