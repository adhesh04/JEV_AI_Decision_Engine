# Jev Decision Lab

**Jev Decision Lab** is a technical Proof-of-Concept (POC) designed to demonstrate the fundamental architectural difference between **Jev (TypeSafe AI SystemOne)** and a **conventional LLM (Groq)** when executing bounded enterprise decisions.

---

## 🏛️ Architectural Overview

```
                      +-----------------------------+
                      |   Enterprise Incident Data  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Understand → Context Engine |
                      |    (Structured JSON State)  |
                      +--------------+--------------+
                                     |
           +-------------------------+-------------------------+
           |                                                   |
           v                                                   v
+-----------------------+                           +-----------------------+
|     TypeSafe Jev      |                           |       Groq LLM        |
|  (SystemOne Engine)   |                           | (Generative Language) |
+-----------+-----------+                           +-----------+-----------+
            |                                                   |
            | Bounded Typed Classification                      | Generative Token Parsing
            | (Probabilities / Confidence)                      | (Json Object Prompting)
            v                                                   v
+-----------------------+                           +-----------------------+
|  Typed Output Vectors |                           |  Text / JSON Output   |
|  Action: RESTART      |                           |  Action: RESTART      |
|  Tokens: 0            |                           |  Tokens: ~340         |
|  Conf: 96.5%          |                           |  Reason: "Because..." |
+-----------------------+                           +-----------------------+
```

### Core Purpose:
* **Jev (TypeSafe AI)**: Designed explicitly for the **Bounded Decision Layer**. Receives structured context, evaluates typed options, and outputs direct deterministic decisions with probability vectors without generating raw prose language.
* **Groq LLM**: Designed for **Language Generation**. Parses prompts, predicts output tokens sequentially, and requires explicit prompt engineering to return JSON structures accompanied by generated reasoning text.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python**: 3.10+ (Python 3.12 recommended)
* **Node.js**: v18+ (Node v20 recommended)

---

### 1. Installation

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install node dependencies
npm install
```

---

### 2. Environment Configuration

Copy `.env.example` to `backend/.env`:

```bash
cp .env.example backend/.env
```

`backend/.env`:
```env
# TypeSafe Jev API Key (Get from https://api.typesafe.ai)
# Signup temporarily paused - JEV_MODE=mock will simulate Jev responses if key is missing.
TYPESAFE_API_KEY=

# Groq API Key (Get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Jev Mode: 'mock' (simulation mode) or 'live' (real TypeSafe API call)
JEV_MODE=mock

# Groq Model Selection
GROQ_MODEL=openai/gpt-oss-20b
```

> **Note on JEV_MODE**: TypeSafe signup is temporarily paused. The POC includes `JEV_MODE=mock` which simulates ultrafast typed evaluation responses while clearly displaying a visual **SIMULATION MODE** badge. When `TYPESAFE_API_KEY` is provided and `JEV_MODE=live`, real live API calls are executed with zero code changes.

---

### 3. Running the Application

#### Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*Backend API server will run at: `http://localhost:8000`*
*Interactive API Docs: `http://localhost:8000/docs`*

#### Start Frontend Application
In a separate terminal window:
```bash
cd frontend
npm run dev
```
*Frontend dashboard will open at: `http://localhost:5173`*

---

## 📊 Evaluation & Calculation Methodology

### 1. Latency Measurement (`Observed API Latency`)
* Measured via `time.perf_counter()` from request initiation to response completion.
* **Formula**: $\Delta t = (t_{\text{complete}} - t_{\text{init}}) \times 1000\text{ ms}$
* **Note**: This measures full end-to-end network & server round-trip latency. It is labeled as *Observed API latency*, not pure model compute latency.

### 2. Token Usage
* **Jev (TypeSafe AI)**: $0\text{ input tokens}$, $0\text{ output tokens}$ (Typed evaluation engine).
* **Groq LLM**: Captures exact `prompt_tokens` and `completion_tokens` returned by the Groq API usage metadata.

### 3. Cost Calculation
* **Jev**: Fixed $0.0001\text{ USD}$ evaluation unit cost.
* **Groq LLM**: Calculated based on published Groq rates (e.g. `llama-3.3-70b-versatile` at $\$0.59 / 1M$ input, $\$0.79 / 1M$ output tokens):
  $$\text{Cost} = (\text{input\_tokens} \times 0.00000059) + (\text{output\_tokens} \times 0.00000079)$$

### 4. Decision Accuracy & Ground Truth
* Evaluated against 15 predefined reference labels.
* A decision is marked **Correct** if both the `recommended_action` and `incident_severity` match reference labels.
* *Disclaimer*: Reference labels are POC ground truth for demonstration purposes, not a universal industry benchmark.

---

## 📋 The 15 Enterprise Scenarios

### IT Operations
1. **`it-ops-01`**: Critical Payment Service CPU & Error Spike (Expected: `CRITICAL` / `RESTART`)
2. **`it-ops-02`**: Staging Analytics Worker High CPU Spike (Expected: `LOW` / `MONITOR`)
3. **`it-ops-03`**: Production Auth Service Database Latency Incident (Expected: `HIGH` / `INVESTIGATE`)
4. **`it-ops-04`**: Failed Production Checkout Deployment (Expected: `CRITICAL` / `RESTART`)
5. **`it-ops-05`**: Search Indexing Service Minor Degradation (Expected: `MEDIUM` / `INVESTIGATE`)

### Helpdesk
6. **`helpdesk-01`**: High-Priority SAP Finance Month-End Lockout (Expected: `CRITICAL` / `ESCALATE`)
7. **`helpdesk-02`**: Standard Analyst Password Reset Request (Expected: `LOW` / `MONITOR`)
8. **`helpdesk-03`**: Security Phishing & Credential Theft Suspicion (Expected: `HIGH` / `INVESTIGATE`)
9. **`helpdesk-04`**: Business-Critical Salesforce CRM Outage (Expected: `HIGH` / `ESCALATE`)
10. **`helpdesk-05`**: Conflicting KB Evidence VPN Certificate Mismatch (Expected: `MEDIUM` / `INVESTIGATE`)

### Predictive Maintenance
11. **`pred-maint-01`**: Main Turbine Extreme Vibration & High Temp (Expected: `CRITICAL` / `RESTART`)
12. **`pred-maint-02`**: Water Pump 12 Normal Operating Metrics (Expected: `LOW` / `MONITOR`)
13. **`pred-maint-03`**: Compressor 01 Declining Health Trend (Expected: `HIGH` / `INVESTIGATE`)
14. **`pred-maint-04`**: High Failure Probability Conveyor Belt Assembly (Expected: `CRITICAL` / `ESCALATE`)
15. **`pred-maint-05`**: Emergency Generator Critical RUL Warning (Expected: `CRITICAL` / `ESCALATE`)

---

## 🛠️ Project Structure

```
/
├── .env.example
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI application & API endpoints
│       ├── jev_client.py        # TypeSafe Jev API integration & mock handler
│       ├── groq_client.py       # Groq LLM API integration & token/cost tracker
│       ├── benchmark.py         # Benchmark runner & statistical aggregations
│       ├── models.py            # Pydantic data schemas
│       ├── database.py          # SQLite database connection & history persistence
│       └── scenarios.py         # 15 Deterministic enterprise scenarios dataset
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── src/
        ├── App.tsx              # Main application shell
        ├── api.ts               # Frontend HTTP client service
        ├── types.ts             # TypeScript interface definitions
        ├── components/
        │   ├── Navbar.tsx       # Enterprise navigation bar
        │   ├── SimulationBadge.tsx # Visual badge for JEV_MODE=mock simulation
        │   ├── Charts.tsx       # Latency, accuracy, and cost charts
        │   └── MethodologyPanel.tsx # Methodological notes & documentation sources
        └── pages/
            ├── LiveDecisionPage.tsx # Dual panel side-by-side decision comparison
            ├── BenchmarkPage.tsx    # Aggregate trial runner (1, 5, full) & stats
            ├── ScenariosPage.tsx    # Scenario dataset explorer
            └── ResultsPage.tsx      # Database history log & raw JSON inspector
```
