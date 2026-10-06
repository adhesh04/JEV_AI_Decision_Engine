export interface ExpectedDecision {
  severity: string;
  escalate: boolean;
  human_approval_required: boolean;
  recommended_action: string;
}

export interface Scenario {
  id: string;
  category: string;
  title: string;
  description: string;
  structured_context: Record<string, any>;
  expected_decision: ExpectedDecision;
}

export interface JevAnswer {
  question_id: string;
  question_text: string;
  answer: string;
  confidence: number;
  options: string[];
}

export interface JevResponse {
  provider: string;
  model: string;
  answers: JevAnswer[];
  incident_severity: string;
  escalate: boolean;
  human_approval_required: boolean;
  recommended_action: string;
  avg_confidence: number;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  raw_response: Record<string, any>;
  is_simulated: boolean;
  error?: string | null;
}

export interface GroqResponse {
  provider: string;
  model: string;
  incident_severity: string;
  escalate: boolean;
  human_approval_required: boolean;
  recommended_action: string;
  reason: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  estimated_cost: number;
  raw_response: Record<string, any>;
  is_simulated: boolean;
  error?: string | null;
}

export interface ComparisonResult {
  scenario_id: string;
  scenario_title: string;
  category: string;
  timestamp: string;
  structured_context: Record<string, any>;
  expected: ExpectedDecision;
  jev: JevResponse;
  groq: GroqResponse;
  agreement: boolean;
  jev_correct: boolean;
  groq_correct: boolean;
}

export interface LatencyStats {
  avg: number;
  median: number;
  p95?: number | null;
  min: number;
  max: number;
}

export interface ProviderBenchmarkSummary {
  provider: string;
  total_runs: number;
  correct_runs: number;
  accuracy: number;
  latency: LatencyStats;
  avg_cost: number;
  total_cost: number;
  total_tokens: number;
}

export interface BenchmarkStatsResponse {
  total_scenarios: number;
  total_executions: number;
  runs_per_scenario: number;
  jev_summary: ProviderBenchmarkSummary;
  groq_summary: ProviderBenchmarkSummary;
  decision_agreement_rate: number;
  agreement_count: number;
  disagreement_count: number;
}

export interface ExecutionHistoryItem {
  id: number;
  run_batch_id: string;
  timestamp: string;
  scenario_id: string;
  provider: string;
  model: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  decision: Record<string, any>;
  confidence: number;
  expected_decision: Record<string, any>;
  correct: boolean;
  raw_response: Record<string, any>;
  is_simulated: boolean;
}

export interface HealthStatus {
  status: string;
  jev_mode: string;
  typesafe_key_configured: boolean;
  groq_key_configured: boolean;
  groq_model: string;
}
