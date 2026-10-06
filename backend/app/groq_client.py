import os
import json
import time
import httpx
from typing import Dict, Any, Optional
from .models import GroqResponse

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


async def execute_groq_decision(
    context: Dict[str, Any]
) -> GroqResponse:
    """
    Executes a bounded enterprise decision using Groq LLM API.
    Asks Groq to evaluate structured context and return structured JSON decision with prose reasoning.
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if not api_key:
        return GroqResponse(
            provider="Groq",
            model=DEFAULT_GROQ_MODEL,
            is_simulated=False,
            error="Groq API key not configured."
        )

    system_prompt = (
        "You are an enterprise AI decision engine. Analyze the provided structured incident context and "
        "make an operational decision. You MUST return ONLY a JSON object with the following exact keys:\n"
        "{\n"
        '  "incident_severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
        '  "escalate": true | false,\n'
        '  "human_approval_required": true | false,\n'
        '  "recommended_action": "MONITOR" | "INVESTIGATE" | "RESTART" | "ESCALATE",\n'
        '  "reason": "Detailed prose explanation justifying this decision."\n'
        "}\n"
        "Do not include markdown formatting or extra text outside the JSON object."
    )

    user_prompt = f"STRUCTURED CONTEXT:\n{json.dumps(context, indent=2)}\n\nMake your decision."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": DEFAULT_GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    start_time = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            if response.status_code == 200:
                res_json = response.json()
                usage = res_json.get("usage", {})
                input_tokens = usage.get("prompt_tokens", 0)
                output_tokens = usage.get("completion_tokens", 0)
                total_tokens = usage.get("total_tokens", input_tokens + output_tokens)

                # Published Groq llama-3.3-70b-versatile rate: $0.59 / 1M input, $0.79 / 1M output
                cost = (input_tokens * 0.00000059) + (output_tokens * 0.00000079)

                choice = res_json["choices"][0]["message"]["content"]
                parsed_data = {}
                try:
                    parsed_data = json.loads(choice)
                except Exception:
                    parsed_data = {
                        "incident_severity": "UNKNOWN",
                        "escalate": False,
                        "human_approval_required": False,
                        "recommended_action": "UNKNOWN",
                        "reason": choice
                    }

                severity = str(parsed_data.get("incident_severity", "UNKNOWN")).upper()
                escalate_val = bool(parsed_data.get("escalate", False))
                human_val = bool(parsed_data.get("human_approval_required", False))
                action_val = str(parsed_data.get("recommended_action", "UNKNOWN")).upper()
                reason_val = str(parsed_data.get("reason", ""))

                return GroqResponse(
                    provider="Groq",
                    model=DEFAULT_GROQ_MODEL,
                    incident_severity=severity,
                    escalate=escalate_val,
                    human_approval_required=human_val,
                    recommended_action=action_val,
                    reason=reason_val,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    latency_ms=round(elapsed_ms, 2),
                    estimated_cost=round(cost, 6),
                    raw_response=res_json,
                    is_simulated=False,
                    error=None
                )
            else:
                return GroqResponse(
                    provider="Groq",
                    model=DEFAULT_GROQ_MODEL,
                    latency_ms=round(elapsed_ms, 2),
                    is_simulated=False,
                    error=f"Groq API Error: HTTP {response.status_code} - {response.text}"
                )

    except httpx.TimeoutException:
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return GroqResponse(
            provider="Groq",
            model=DEFAULT_GROQ_MODEL,
            latency_ms=round(elapsed_ms, 2),
            is_simulated=False,
            error="Groq API Request Timed Out (15s limit)."
        )
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return GroqResponse(
            provider="Groq",
            model=DEFAULT_GROQ_MODEL,
            latency_ms=round(elapsed_ms, 2),
            is_simulated=False,
            error=f"Groq API Request Exception: {str(e)}"
        )
