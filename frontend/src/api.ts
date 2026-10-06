import type {
  Scenario,
  ComparisonResult,
  BenchmarkStatsResponse,
  ExecutionHistoryItem,
  HealthStatus
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch backend health status');
  return res.json();
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios dataset');
  return res.json();
}

export async function runDecision(
  scenarioId?: string,
  customContext?: Record<string, any>
): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/decision/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenarioId,
      custom_context: customContext
    })
  });
  if (!res.ok) throw new Error('Failed to execute decision endpoint');
  return res.json();
}

export async function runBenchmark(
  scenarioIds?: string[],
  runsPerScenario: number = 1
): Promise<{ status: string; total_executions: number; runs_per_scenario: number }> {
  const res = await fetch(`${API_BASE}/benchmark/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_ids: scenarioIds,
      runs_per_scenario: runsPerScenario
    })
  });
  if (!res.ok) throw new Error('Failed to run benchmark');
  return res.json();
}

export async function fetchBenchmarkStats(): Promise<BenchmarkStatsResponse> {
  const res = await fetch(`${API_BASE}/benchmark/stats`);
  if (!res.ok) throw new Error('Failed to fetch benchmark stats');
  return res.json();
}

export async function fetchBenchmarkHistory(): Promise<ExecutionHistoryItem[]> {
  const res = await fetch(`${API_BASE}/benchmark/results`);
  if (!res.ok) throw new Error('Failed to fetch benchmark history');
  return res.json();
}

export async function resetBenchmarkHistory(): Promise<void> {
  const res = await fetch(`${API_BASE}/benchmark/results`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to reset benchmark data');
}
