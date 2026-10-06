import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .models import (
    Scenario, ScenarioDecisionRequest, ComparisonResult,
    BenchmarkRunRequest, BenchmarkStatsResponse
)
from .scenarios import get_all_scenarios, get_scenario_by_id
from .database import init_db, get_all_executions, clear_db
from .benchmark import run_single_comparison, run_batch_benchmark, compute_benchmark_statistics

app = FastAPI(
    title="Jev Decision Lab API",
    description="Architectural POC comparing TypeSafe Jev SystemOne vs Groq LLM for bounded enterprise decisions",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health_check():
    jev_key = os.getenv("TYPESAFE_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    jev_mode = os.getenv("JEV_MODE", "mock").lower()

    return {
        "status": "healthy",
        "jev_mode": jev_mode,
        "typesafe_key_configured": bool(jev_key),
        "groq_key_configured": bool(groq_key),
        "groq_model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    }


@app.get("/api/scenarios", response_model=List[Scenario])
def list_scenarios():
    return get_all_scenarios()


@app.get("/api/scenarios/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: str):
    scen = get_scenario_by_id(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scen


@app.post("/api/decision/run", response_model=ComparisonResult)
async def run_decision(req: ScenarioDecisionRequest):
    if req.scenario_id:
        scenario = get_scenario_by_id(req.scenario_id)
        if not scenario:
            raise HTTPException(status_code=404, detail=f"Scenario '{req.scenario_id}' not found")
    elif req.custom_context:
        # Build dynamic scenario from custom context
        scenario = Scenario(
            id="custom-dynamic",
            category="Custom Enterprise Scenario",
            title="User Defined Custom Scenario",
            description="Dynamically provided enterprise context",
            structured_context=req.custom_context,
            expected_decision=Scenario(
                id="dummy", category="", title="", description="",
                structured_context={},
                expected_decision={
                    "severity": "HIGH",
                    "escalate": True,
                    "human_approval_required": True,
                    "recommended_action": "INVESTIGATE"
                }
            ).expected_decision
        )
    else:
        # Default to first scenario
        scenario = get_all_scenarios()[0]

    result = await run_single_comparison(scenario)
    return result


@app.post("/api/benchmark/run")
async def execute_benchmark(req: BenchmarkRunRequest):
    results = await run_batch_benchmark(
        scenario_ids=req.scenario_ids,
        runs_per_scenario=req.runs_per_scenario
    )
    return {
        "status": "success",
        "total_executions": len(results),
        "runs_per_scenario": req.runs_per_scenario,
        "results_summary": [
            {
                "scenario_id": r.scenario_id,
                "jev_latency_ms": r.jev.latency_ms,
                "groq_latency_ms": r.groq.latency_ms,
                "agreement": r.agreement,
                "jev_correct": r.jev_correct,
                "groq_correct": r.groq_correct
            }
            for r in results
        ]
    }


@app.get("/api/benchmark/stats", response_model=BenchmarkStatsResponse)
def get_benchmark_stats():
    return compute_benchmark_statistics()


@app.get("/api/benchmark/results")
def get_benchmark_history():
    return get_all_executions()


@app.delete("/api/benchmark/results")
def reset_benchmark_history():
    clear_db()
    return {"status": "cleared", "message": "Benchmark database reset successfully."}
