from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class QuestionDefinition(BaseModel):
    id: str
    question: str
    options: List[str]


class ExpectedDecision(BaseModel):
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    escalate: bool  # True, False
    human_approval_required: bool  # True, False
    recommended_action: str  # MONITOR, INVESTIGATE, RESTART, ESCALATE


class Scenario(BaseModel):
    id: str
    category: str  # IT Operations, Helpdesk, Predictive Maintenance
    title: str
    description: str
    structured_context: Dict[str, Any]
    expected_decision: ExpectedDecision


class JevAnswer(BaseModel):
    question_id: str
    question_text: str
    answer: str
    confidence: float
    options: List[str]


class JevResponse(BaseModel):
    provider: str = "TypeSafe Jev"
    model: str = "systemone"
    answers: List[JevAnswer] = []
    incident_severity: str = "UNKNOWN"
    escalate: bool = False
    human_approval_required: bool = False
    recommended_action: str = "UNKNOWN"
    avg_confidence: float = 0.0
    latency_ms: float = 0.0
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0
    raw_response: Dict[str, Any] = {}
    is_simulated: bool = False
    error: Optional[str] = None


class GroqResponse(BaseModel):
    provider: str = "Groq"
    model: str = "llama-3.3-70b-versatile"
    incident_severity: str = "UNKNOWN"
    escalate: bool = False
    human_approval_required: bool = False
    recommended_action: str = "UNKNOWN"
    reason: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    latency_ms: float = 0.0
    estimated_cost: float = 0.0
    raw_response: Dict[str, Any] = {}
    is_simulated: bool = False
    error: Optional[str] = None


class ScenarioDecisionRequest(BaseModel):
    scenario_id: Optional[str] = None
    custom_context: Optional[Dict[str, Any]] = None


class ComparisonResult(BaseModel):
    scenario_id: str
    scenario_title: str
    category: str
    timestamp: str
    structured_context: Dict[str, Any]
    expected: ExpectedDecision
    jev: JevResponse
    groq: GroqResponse
    agreement: bool
    jev_correct: bool
    groq_correct: bool


class BenchmarkRunRequest(BaseModel):
    scenario_ids: Optional[List[str]] = None
    runs_per_scenario: int = 1


class LatencyStats(BaseModel):
    avg: float = 0.0
    median: float = 0.0
    p95: Optional[float] = None
    min: float = 0.0
    max: float = 0.0


class ProviderBenchmarkSummary(BaseModel):
    provider: str
    total_runs: int
    correct_runs: int
    accuracy: float
    latency: LatencyStats
    avg_cost: float
    total_cost: float
    total_tokens: int


class BenchmarkStatsResponse(BaseModel):
    total_scenarios: int
    total_executions: int
    runs_per_scenario: int
    jev_summary: ProviderBenchmarkSummary
    groq_summary: ProviderBenchmarkSummary
    decision_agreement_rate: float
    agreement_count: int
    disagreement_count: int
