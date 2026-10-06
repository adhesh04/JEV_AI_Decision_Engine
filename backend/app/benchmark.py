import uuid
import datetime
import numpy as np
from typing import List, Dict, Any, Optional

from .models import (
    Scenario, ExpectedDecision, JevResponse, GroqResponse,
    ComparisonResult, BenchmarkStatsResponse, ProviderBenchmarkSummary, LatencyStats
)
from .scenarios import get_all_scenarios, get_scenario_by_id
from .jev_client import execute_jev_decision
from .groq_client import execute_groq_decision
from .database import save_execution_result, get_all_executions, clear_db


def check_decision_correctness(actual: Dict[str, Any], expected: ExpectedDecision) -> bool:
    """
    Evaluates whether an actual decision matches ground truth expected reference labels.
    Requires matching recommended action and incident severity.
    """
    actual_action = str(actual.get("recommended_action", "")).upper()
    expected_action = str(expected.recommended_action).upper()
    actual_severity = str(actual.get("incident_severity", "")).upper()
    expected_severity = str(expected.severity).upper()

    return (actual_action == expected_action) and (actual_severity == expected_severity)


def check_decision_agreement(jev: JevResponse, groq: GroqResponse) -> bool:
    """
    Checks if Jev and Groq arrived at matching decisions.
    """
    if jev.error or groq.error:
        return False

    same_action = (jev.recommended_action.upper() == groq.recommended_action.upper())
    same_severity = (jev.incident_severity.upper() == groq.incident_severity.upper())
    return same_action and same_severity


async def run_single_comparison(
    scenario: Scenario,
    run_batch_id: Optional[str] = None
) -> ComparisonResult:
    """
    Runs both TypeSafe Jev and Groq on a given scenario and persists results.
    """
    batch_id = run_batch_id or str(uuid.uuid4())
    now_iso = datetime.datetime.utcnow().isoformat()

    # Execute Jev and Groq in parallel or sequential
    jev_res = await execute_jev_decision(
        context=scenario.structured_context,
        expected=scenario.expected_decision
    )
    groq_res = await execute_groq_decision(
        context=scenario.structured_context
    )

    jev_decision_dict = {
        "incident_severity": jev_res.incident_severity,
        "escalate": jev_res.escalate,
        "human_approval_required": jev_res.human_approval_required,
        "recommended_action": jev_res.recommended_action
    }

    groq_decision_dict = {
        "incident_severity": groq_res.incident_severity,
        "escalate": groq_res.escalate,
        "human_approval_required": groq_res.human_approval_required,
        "recommended_action": groq_res.recommended_action,
        "reason": groq_res.reason
    }

    jev_correct = False
    if not jev_res.error:
        jev_correct = check_decision_correctness(jev_decision_dict, scenario.expected_decision)
        save_execution_result(
            run_batch_id=batch_id,
            timestamp=now_iso,
            scenario_id=scenario.id,
            provider=jev_res.provider,
            model=jev_res.model,
            latency_ms=jev_res.latency_ms,
            input_tokens=jev_res.input_tokens,
            output_tokens=jev_res.output_tokens,
            total_tokens=jev_res.total_tokens,
            estimated_cost=jev_res.estimated_cost,
            decision=jev_decision_dict,
            confidence=jev_res.avg_confidence,
            expected_decision=scenario.expected_decision.model_dump(),
            correct=jev_correct,
            raw_response=jev_res.raw_response,
            is_simulated=jev_res.is_simulated
        )

    groq_correct = False
    if not groq_res.error:
        groq_correct = check_decision_correctness(groq_decision_dict, scenario.expected_decision)
        save_execution_result(
            run_batch_id=batch_id,
            timestamp=now_iso,
            scenario_id=scenario.id,
            provider=groq_res.provider,
            model=groq_res.model,
            latency_ms=groq_res.latency_ms,
            input_tokens=groq_res.input_tokens,
            output_tokens=groq_res.output_tokens,
            total_tokens=groq_res.total_tokens,
            estimated_cost=groq_res.estimated_cost,
            decision=groq_decision_dict,
            confidence=1.0,
            expected_decision=scenario.expected_decision.model_dump(),
            correct=groq_correct,
            raw_response=groq_res.raw_response,
            is_simulated=groq_res.is_simulated
        )

    agreement = check_decision_agreement(jev_res, groq_res)

    return ComparisonResult(
        scenario_id=scenario.id,
        scenario_title=scenario.title,
        category=scenario.category,
        timestamp=now_iso,
        structured_context=scenario.structured_context,
        expected=scenario.expected_decision,
        jev=jev_res,
        groq=groq_res,
        agreement=agreement,
        jev_correct=jev_correct,
        groq_correct=groq_correct
    )


async def run_batch_benchmark(
    scenario_ids: Optional[List[str]] = None,
    runs_per_scenario: int = 1
) -> List[ComparisonResult]:
    """
    Executes multiple benchmark runs across selected or all scenarios.
    """
    all_scenarios = get_all_scenarios()
    if scenario_ids:
        target_scenarios = [s for s in all_scenarios if s.id in scenario_ids]
    else:
        target_scenarios = all_scenarios

    batch_id = str(uuid.uuid4())
    results: List[ComparisonResult] = []

    for _ in range(runs_per_scenario):
        for scenario in target_scenarios:
            comp = await run_single_comparison(scenario, run_batch_id=batch_id)
            results.append(comp)

    return results


def calculate_latency_stats(latencies: List[float]) -> LatencyStats:
    if not latencies:
        return LatencyStats()

    arr = np.array(latencies)
    avg_val = float(np.mean(arr))
    median_val = float(np.median(arr))
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))
    p95_val = float(np.percentile(arr, 95)) if len(latencies) >= 5 else None

    return LatencyStats(
        avg=round(avg_val, 2),
        median=round(median_val, 2),
        p95=round(p95_val, 2) if p95_val is not None else None,
        min=round(min_val, 2),
        max=round(max_val, 2)
    )


def compute_benchmark_statistics() -> BenchmarkStatsResponse:
    """
    Reads all historical executions from SQLite database and computes benchmark stats.
    """
    executions = get_all_executions()

    jev_runs = [e for e in executions if "TypeSafe" in e["provider"] or "Jev" in e["provider"]]
    groq_runs = [e for e in executions if "Groq" in e["provider"]]

    # Process Jev Summary
    jev_latencies = [e["latency_ms"] for e in jev_runs if e["latency_ms"] > 0]
    jev_correct_count = sum(1 for e in jev_runs if e["correct"])
    jev_total_cost = sum(e["estimated_cost"] for e in jev_runs)
    jev_tokens = sum(e["total_tokens"] for e in jev_runs)

    jev_summary = ProviderBenchmarkSummary(
        provider="TypeSafe Jev",
        total_runs=len(jev_runs),
        correct_runs=jev_correct_count,
        accuracy=round(jev_correct_count / len(jev_runs), 4) if jev_runs else 0.0,
        latency=calculate_latency_stats(jev_latencies),
        avg_cost=round(jev_total_cost / len(jev_runs), 6) if jev_runs else 0.0,
        total_cost=round(jev_total_cost, 6),
        total_tokens=jev_tokens
    )

    # Process Groq Summary
    groq_latencies = [e["latency_ms"] for e in groq_runs if e["latency_ms"] > 0]
    groq_correct_count = sum(1 for e in groq_runs if e["correct"])
    groq_total_cost = sum(e["estimated_cost"] for e in groq_runs)
    groq_tokens = sum(e["total_tokens"] for e in groq_runs)

    groq_summary = ProviderBenchmarkSummary(
        provider="Groq",
        total_runs=len(groq_runs),
        correct_runs=groq_correct_count,
        accuracy=round(groq_correct_count / len(groq_runs), 4) if groq_runs else 0.0,
        latency=calculate_latency_stats(groq_latencies),
        avg_cost=round(groq_total_cost / len(groq_runs), 6) if groq_runs else 0.0,
        total_cost=round(groq_total_cost, 6),
        total_tokens=groq_tokens
    )

    # Calculate Agreement across matching batch/scenario runs
    agreement_count = 0
    disagreement_count = 0

    # Group by (run_batch_id, scenario_id)
    paired_runs: Dict[str, Dict[str, Any]] = {}
    for e in executions:
        key = f"{e['run_batch_id']}_{e['scenario_id']}"
        if key not in paired_runs:
            paired_runs[key] = {}
        if "Jev" in e["provider"]:
            paired_runs[key]["jev"] = e
        elif "Groq" in e["provider"]:
            paired_runs[key]["groq"] = e

    for pair in paired_runs.values():
        if "jev" in pair and "groq" in pair:
            j_dec = pair["jev"]["decision"]
            g_dec = pair["groq"]["decision"]
            if j_dec and g_dec:
                j_act = str(j_dec.get("recommended_action", "")).upper()
                g_act = str(g_dec.get("recommended_action", "")).upper()
                j_sev = str(j_dec.get("incident_severity", "")).upper()
                g_sev = str(g_dec.get("incident_severity", "")).upper()

                if (j_act == g_act) and (j_sev == g_sev):
                    agreement_count += 1
                else:
                    disagreement_count += 1

    total_pairs = agreement_count + disagreement_count
    agreement_rate = round(agreement_count / total_pairs, 4) if total_pairs > 0 else 0.0

    scenarios = get_all_scenarios()

    return BenchmarkStatsResponse(
        total_scenarios=len(scenarios),
        total_executions=len(executions),
        runs_per_scenario=1,
        jev_summary=jev_summary,
        groq_summary=groq_summary,
        decision_agreement_rate=agreement_rate,
        agreement_count=agreement_count,
        disagreement_count=disagreement_count
    )
