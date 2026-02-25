# Margintel | The AI Margin Intelligence Engine (v1.0)

> **Margintel** is an industrial-grade intelligence layer that converts raw, messy ecommerce transaction streams into high-fidelity strategic roadmaps. It bridges the gap between **deterministic financial reconcilation** and **generative strategic synthesis**.

---

## 📖 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [The "Obsidian" Architecture](#-the-obsidian-architecture)
3. [Deep Dive: Intelligence Modules](#-deep-dive-intelligence-modules)
4. [Data Contract & Ingestion](#-data-contract--ingestion)
5. [The Obsidian UI Experience](#-the-obsidian-ui-experience)
6. [API Specification (v1)](#-api-specification-v1)
7. [Getting Started (DevOps)](#-getting-started-devops)
8. [The 24-Month Roadmap](#-the-24-month-roadmap)

---

## ✦ Executive Summary

In modern retail, merchants are "Data Rich but Insight Poor." They have thousands of returns and millions in revenue, but the **"Leakage Hotspots"**—the specific SKUs and reasons causing margin bleed—are often buried.

**Margintel** solves this by running every transaction through a dual-logic engine. It doesn't just tell you how much you sold; it tells you **why** your margins are shrinking and **exactly** what to do about it, backed by verifiable data signatures.

---

## 🏛 The "Obsidian" Architecture

As a developer with 25 years of experience, I've seen that AI only works in production when it's anchored to a **Deterministic Core**. The Margintel "Obsidian" design splits the workload into two distinct phases:

### Phase A: The Deterministic Core (Truth)
Before any AI even looks at your data, the **Profiler** and **Dependency** modules execute O(n) vectorized operations using Pandas. 
- **Goal**: Establish the "Ground Truth."
- **Output**: Revenue concentration, return rates, and AOV benchmarks.

### Phase B: The Generative Synthesis (Strategy)
Once the "Truth" is established, these signals are fed into a **Neural Swarm** (powered by GPT-4o).
- **Goal**: Translate metrics into human-executable initiatives.
- **Output**: Ranked actions with confidence scores and execution blueprints.

---

## 🔍 Deep Dive: Intelligence Modules

### 1. Neural Ingestion (`src/utils/csv_loader.py`)
Most CSVs are messy. Our ingestion layer uses **Fuzzy Synonym Mapping**. If your file says `SKU_ID` instead of `sku`, or `Price_Each` instead of `item_price`, the engine automatically maps these to the internal intelligence schema.

### 2. Leakage Vectoring (`src/services/profiler.py`)
We don't just calculate a return rate. We calculate **Margin Risk Velocity**.
- **The Metric**: `(Return Rate * Refund Volume) / Total Revenue`. 
- **The Purpose**: High-return items that are *also* high-revenue are prioritized as "Flashpoints."

### 3. Returns Intelligence (`src/services/returns_analyzer.py`)
This module performs **Semantic Vectorization** on return reason text.
- **Problem**: "Item too small" and "Size was tiny" are the same problem but different words.
- **Solution**: The LLM clusters these into **Neural Themes** (e.g., "Sizing Inconsistency") and provides an "Affected Node" list.

### 4. Strategic Decisioning (`src/services/llm_client.py`)
This is the "Brain." It takes user goals (e.g., "Maximize Q4 Profit") and maps them against the detected risks. It produces **Execution Blueprints** that include:
- **Evidence Used**: Exactly which metrics triggered this advice.
- **Confidence Index**: A 0.0-1.0 rating of the LLM's certainty based on data density.

---

## 📊 Data Contract & Ingestion

To run a synthesis, the engine requires a `Dataset Summary`. While the ingestion is fuzzy, the following vectors are required:

| Field | Purpose | Sample |
| :--- | :--- | :--- |
| `order_id` | Transaction Identity | `ORD-9981` |
| `sku` | Product Identification | `PRD-BLUE-LG` |
| `quantity` | Volume Calculation | `2` |
| `item_price` | Revenue Anchoring | `45.00` |
| `return_reason_text` | (Optional) Semantic Cluster | "Product arrived damaged" |

---

## 🖥 The Obsidian UI Experience

The frontend is a high-performance **Dark Grid** optimized for decision velocity.

*   **Silk Motion Physics**: Using a custom Quintic-Bezier curve `[0.23, 1, 0.32, 1]`, every card and modal materializes with zero friction.
*   **Hardware Acceleration**: All UI transitions utilize `transform: translateZ(0)` to ensure a locked 60 FPS during data heavy rendering.
*   **Deep Dive Drills**: Click on any chart or metric to open an "Intelligence Node" modal. These modals pull direct evidence from the raw transaction layer.

---

## 📡 API Specification (v1)

The API is built for high-throughput and observability.

### Endpoints
- `POST /v1/runs`: Stateless ingestion. Returns `run_id`.
- `GET /v1/runs/<id>`: Polling hook. Returns `progress` (0.0 - 1.0) and `status`.
- `GET /v1/runs`: Historical registry of previous analysis cycles.

### Resiliency
The API includes an **Exponential Backoff Decorator**. If the OpenAI API is under load, the engine will automatically retry with a delay of `1s -> 2s -> 4s`, ensuring your analysis doesn't crash during peak hours.

---

## ⚙ Getting Started (DevOps)

### Required Stack
- **Backend**: Python 3.10+
- **Frontend**: Node.js 18+ (Vite)
- **Intelligence**: OpenAI API Key (GPT-4o default)

### Setup In 2 Minutes
1.  **Clone & Configure**:
    ```bash
    git clone https://github.com/mananpdev/margin-intel-engine
    cp .env.example .env # Add your OPENAI_API_KEY
    ```
2.  **Start Intelligence Engine**:
    ```bash
    pip install -r requirements.txt
    python app.py
    ```
3.  **Start Control Panel**:
    ```bash
    cd frontend && npm install && npm run dev
    ```

---

## 🗺 The 24-Month Roadmap

### Phase 2: Persistence Layer
Migration from in-memory `MemoryStore` to **PostgreSQL + Redis**. This will enable user accounts and cross-period comparisons.

### Phase 3: The Agent Swarm
Replacement of the single-prompt LLM with a **Multi-Agent Orchestrator**:
- **Agent A (The Auditor)**: Verifies statistical math.
- **Agent B (The Strategist)**: Proposes market-specific actions.
- **Agent C (The Writer)**: Formats findings into a professional PDF summary.

---

© 2026 Margintel Inc. | Premium Intelligence for the Modern Merchant.
