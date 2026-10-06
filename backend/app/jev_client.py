import os
import time
import httpx
from typing import Dict, Any, List, Optional
from .models import JevResponse, JevAnswer, ExpectedDecision

TYPESAFE_API_URL = os.getenv("TYPESAFE_API_URL", "https://api.typesafe.ai/v1/systemone")


def get_default_questions() -> List[Dict[str, Any]]:
    return [
        {
            "id": "incident_severity",
            "question": "What is the incident severity level?",
            "options": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        },
        {
            "id": "escalate",
            "question": "Should this incident be escalated?",
            "options": ["YES", "NO"]
        },
        {
            "id": "human_approval_required",
            "question": "Should human approval be required for resolution?",
            "options": ["YES", "NO"]
        },
        {
            "id": "recommended_action",
            "question": "What is the recommended operational action?",
            "options": ["MONITOR", "INVESTIGATE", "RESTART", "ESCALATE"]
        }
    ]


async def execute_jev_decision(
    context: Dict[str, Any],
    expected: Optional[ExpectedDecision] = None
) -> JevResponse:
    """
    Executes a bounded enterprise decision using TypeSafe Jev SystemOne API.
    Supports JEV_MODE=live (real API call) and JEV_MODE=mock (simulated response).
    """
    api_key = os.getenv("TYPESAFE_API_KEY", "").strip()
    jev_mode = os.getenv("JEV_MODE", "mock").lower()

    # Force mock mode if key is missing or explicitly set to mock
    use_mock = (jev_mode == "mock") or not api_key

    if not use_mock and api_key:
        # --- LIVE TYPESAFE JEV API CALL ---
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "context": context,
            "questions": get_default_questions()
        }

        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(TYPESAFE_API_URL, json=payload, headers=headers)
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0

                if response.status_code == 200:
                    data = response.json()
                    raw_answers = data.get("answers", data.get("results", []))

                    jev_answers: List[JevAnswer] = []
                    total_conf = 0.0

                    severity = "UNKNOWN"
                    escalate_val = False
                    human_val = False
                    action_val = "UNKNOWN"

                    for item in raw_answers:
                        qid = item.get("question_id", item.get("id", ""))
                        qtext = item.get("question_text", item.get("question", ""))
                        ans = str(item.get("answer", item.get("selected_option", ""))).upper()
                        conf = float(item.get("confidence", item.get("probability", 0.95)))
                        opts = item.get("options", [])

                        jev_answers.append(JevAnswer(
                            question_id=qid,
                            question_text=qtext,
                            answer=ans,
                            confidence=conf,
                            options=opts
                        ))
                        total_conf += conf

                        if qid == "incident_severity":
                            severity = ans
                        elif qid == "escalate":
                            escalate_val = (ans in ["YES", "TRUE"])
                        elif qid == "human_approval_required":
                            human_val = (ans in ["YES", "TRUE"])
                        elif qid == "recommended_action":
                            action_val = ans

                    avg_conf = (total_conf / len(jev_answers)) if jev_answers else 0.0

                    return JevResponse(
                        provider="TypeSafe Jev",
                        model="systemone",
                        answers=jev_answers,
                        incident_severity=severity,
                        escalate=escalate_val,
                        human_approval_required=human_val,
                        recommended_action=action_val,
                        avg_confidence=round(avg_conf, 4),
                        latency_ms=round(elapsed_ms, 2),
                        input_tokens=0,  # Typed SystemOne engine does not use generative prompt tokens
                        output_tokens=0,
                        total_tokens=0,
                        estimated_cost=0.0001,  # Fixed typed evaluation unit cost
                        raw_response=data,
                        is_simulated=False,
                        error=None
                    )
                else:
                    return JevResponse(
                        provider="TypeSafe Jev",
                        model="systemone",
                        latency_ms=round(elapsed_ms, 2),
                        is_simulated=False,
                        error=f"TypeSafe API Error: HTTP {response.status_code} - {response.text}"
                    )
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return JevResponse(
                provider="TypeSafe Jev",
                model="systemone",
                latency_ms=round(elapsed_ms, 2),
                is_simulated=False,
                error=f"TypeSafe API Connection Error: {str(e)}"
            )

    # --- SIMULATED MOCK MODE ---
    # JEV_MODE=mock or TYPESAFE_API_KEY missing
    # Deterministic simulation based on ground truth expected decision
    start_time = time.perf_counter()
    # Simulate ultrafast typed classifier response time (~85ms to 125ms)
    time.sleep(0.09)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    severity = expected.severity if expected else "HIGH"
    escalate_bool = expected.escalate if expected else True
    human_bool = expected.human_approval_required if expected else True
    action = expected.recommended_action if expected else "INVESTIGATE"

    jev_answers = [
        JevAnswer(
            question_id="incident_severity",
            question_text="What is the incident severity level?",
            answer=severity,
            confidence=0.965,
            options=["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        ),
        JevAnswer(
            question_id="escalate",
            question_text="Should this incident be escalated?",
            answer="YES" if escalate_bool else "NO",
            confidence=0.982,
            options=["YES", "NO"]
        ),
        JevAnswer(
            question_id="human_approval_required",
            question_text="Should human approval be required for resolution?",
            answer="YES" if human_bool else "NO",
            confidence=0.954,
            options=["YES", "NO"]
        ),
        JevAnswer(
            question_id="recommended_action",
            question_text="What is the recommended operational action?",
            answer=action,
            confidence=0.948,
            options=["MONITOR", "INVESTIGATE", "RESTART", "ESCALATE"]
        )
    ]

    return JevResponse(
        provider="TypeSafe Jev",
        model="systemone (simulated)",
        answers=jev_answers,
        incident_severity=severity,
        escalate=escalate_bool,
        human_approval_required=human_bool,
        recommended_action=action,
        avg_confidence=0.962,
        latency_ms=round(elapsed_ms, 2),
        input_tokens=0,
        output_tokens=0,
        total_tokens=0,
        estimated_cost=0.0001,
        raw_response={
            "status": "success",
            "mode": "simulation",
            "notice": "JEV_MODE=mock: Simulated response for demonstration without live API key."
        },
        is_simulated=True,
        error=None if api_key else "Jev API key not configured. Operating in simulation mode."
    )
