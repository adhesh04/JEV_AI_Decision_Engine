from typing import List, Dict, Optional
from .models import Scenario, ExpectedDecision

SCENARIOS_DATASET: List[Scenario] = [
    # --- IT Operations ---
    Scenario(
        id="it-ops-01",
        category="IT Operations",
        title="Critical Payment Service CPU & Error Spike",
        description="Production payment service CPU is at 94%, error rate has increased by 18%, database latency is normal, business criticality is high, and a deployment happened 10 minutes ago.",
        structured_context={
            "service": "payment-api",
            "cpu": 94,
            "error_rate_increase": 18,
            "database_latency": "normal",
            "business_criticality": "high",
            "environment": "production",
            "recent_deployment": True
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="RESTART"
        )
    ),
    Scenario(
        id="it-ops-02",
        category="IT Operations",
        title="Staging Analytics Worker High CPU Spike",
        description="Staging analytics background worker exhibits 98% CPU spike with 0% error increase and normal DB latency. Low business criticality.",
        structured_context={
            "service": "analytics-worker",
            "cpu": 98,
            "error_rate_increase": 0,
            "database_latency": "normal",
            "business_criticality": "low",
            "environment": "staging",
            "recent_deployment": False
        },
        expected_decision=ExpectedDecision(
            severity="LOW",
            escalate=False,
            human_approval_required=False,
            recommended_action="MONITOR"
        )
    ),
    Scenario(
        id="it-ops-03",
        category="IT Operations",
        title="Production Auth Service Database Latency Incident",
        description="Production authentication service experiencing high database latency (3200ms) with 12% error rate increase. Business criticality is critical.",
        structured_context={
            "service": "user-auth",
            "cpu": 45,
            "error_rate_increase": 12,
            "database_latency": "high_3200ms",
            "business_criticality": "critical",
            "environment": "production",
            "recent_deployment": False
        },
        expected_decision=ExpectedDecision(
            severity="HIGH",
            escalate=True,
            human_approval_required=True,
            recommended_action="INVESTIGATE"
        )
    ),
    Scenario(
        id="it-ops-04",
        category="IT Operations",
        title="Failed Production Checkout Deployment",
        description="Checkout API deployment 5 minutes ago resulted in immediate 45% error rate surge and elevated DB query latencies.",
        structured_context={
            "service": "checkout-service",
            "cpu": 70,
            "error_rate_increase": 45,
            "database_latency": "elevated",
            "business_criticality": "critical",
            "environment": "production",
            "recent_deployment": True
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="RESTART"
        )
    ),
    Scenario(
        id="it-ops-05",
        category="IT Operations",
        title="Search Indexing Service Minor Degradation",
        description="Staging search service has 82% CPU and minor 5% error increase after indexing job started.",
        structured_context={
            "service": "search-index",
            "cpu": 82,
            "error_rate_increase": 5,
            "database_latency": "normal",
            "business_criticality": "medium",
            "environment": "staging",
            "recent_deployment": True
        },
        expected_decision=ExpectedDecision(
            severity="MEDIUM",
            escalate=False,
            human_approval_required=False,
            recommended_action="INVESTIGATE"
        )
    ),

    # --- Helpdesk ---
    Scenario(
        id="helpdesk-01",
        category="Helpdesk",
        title="High-Priority SAP Finance Month-End Lockout",
        description="CFO locked out of SAP ERP during active month-end financial close window. No automated workaround available.",
        structured_context={
            "system": "SAP ERP",
            "user_role": "CFO",
            "issue_type": "month_end_close_lockout",
            "impact_scope": "finance_dept",
            "workaround_available": False,
            "business_impact": "critical"
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="ESCALATE"
        )
    ),
    Scenario(
        id="helpdesk-02",
        category="Helpdesk",
        title="Standard Analyst Password Reset Request",
        description="Standard financial analyst requesting password reset for internal portal. Self-service link available.",
        structured_context={
            "system": "Active Directory",
            "user_role": "analyst",
            "issue_type": "password_reset",
            "impact_scope": "single_user",
            "workaround_available": True,
            "business_impact": "low"
        },
        expected_decision=ExpectedDecision(
            severity="LOW",
            escalate=False,
            human_approval_required=False,
            recommended_action="MONITOR"
        )
    ),
    Scenario(
        id="helpdesk-03",
        category="Helpdesk",
        title="Security Phishing & Credential Theft Suspicion",
        description="Executive Assistant reported suspicious credential prompt on executive office workstation.",
        structured_context={
            "system": "Corporate Email",
            "user_role": "executive_assistant",
            "issue_type": "suspicious_credential_prompt",
            "impact_scope": "executive_office",
            "workaround_available": False,
            "business_impact": "high"
        },
        expected_decision=ExpectedDecision(
            severity="HIGH",
            escalate=True,
            human_approval_required=True,
            recommended_action="INVESTIGATE"
        )
    ),
    Scenario(
        id="helpdesk-04",
        category="Helpdesk",
        title="Business-Critical Salesforce CRM Outage",
        description="Global login failure on Salesforce CRM affecting all sales representatives worldwide.",
        structured_context={
            "system": "Salesforce CRM",
            "user_role": "sales_vp",
            "issue_type": "global_login_failure",
            "impact_scope": "all_sales_teams",
            "workaround_available": False,
            "business_impact": "critical"
        },
        expected_decision=ExpectedDecision(
            severity="HIGH",
            escalate=True,
            human_approval_required=True,
            recommended_action="ESCALATE"
        )
    ),
    Scenario(
        id="helpdesk-05",
        category="Helpdesk",
        title="Conflicting KB Evidence VPN Certificate Mismatch",
        description="Internal engineering user experiencing VPN certificate mismatch error with conflicting knowledge base resolutions.",
        structured_context={
            "system": "Internal Portal",
            "user_role": "engineer",
            "issue_type": "vpn_cert_mismatch",
            "impact_scope": "single_user",
            "workaround_available": True,
            "business_impact": "medium"
        },
        expected_decision=ExpectedDecision(
            severity="MEDIUM",
            escalate=False,
            human_approval_required=False,
            recommended_action="INVESTIGATE"
        )
    ),

    # --- Predictive Maintenance ---
    Scenario(
        id="pred-maint-01",
        category="Predictive Maintenance",
        title="Main Turbine Extreme Vibration & High Temp",
        description="Gas Turbine 04 exhibiting extreme vibration (14.2 mm/s) and critical bearing temperature (92.5 C). 89% failure probability.",
        structured_context={
            "asset_id": "TURBINE-04",
            "vibration_mm_s": 14.2,
            "temperature_c": 92.5,
            "operating_hours": 12400,
            "failure_probability": 0.89,
            "asset_criticality": "high"
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="RESTART"
        )
    ),
    Scenario(
        id="pred-maint-02",
        category="Predictive Maintenance",
        title="Water Pump 12 Normal Operating Metrics",
        description="Water pump operating smoothly with 2.1 mm/s vibration and 45.0 C temperature. Low 4% failure probability.",
        structured_context={
            "asset_id": "PUMP-12",
            "vibration_mm_s": 2.1,
            "temperature_c": 45.0,
            "operating_hours": 3200,
            "failure_probability": 0.04,
            "asset_criticality": "medium"
        },
        expected_decision=ExpectedDecision(
            severity="LOW",
            escalate=False,
            human_approval_required=False,
            recommended_action="MONITOR"
        )
    ),
    Scenario(
        id="pred-maint-03",
        category="Predictive Maintenance",
        title="Compressor 01 Declining Health Trend",
        description="Critical air compressor exhibiting steadily rising vibration (7.8 mm/s) and elevated temperature (74 C). 62% failure probability.",
        structured_context={
            "asset_id": "COMPRESSOR-01",
            "vibration_mm_s": 7.8,
            "temperature_c": 74.0,
            "operating_hours": 18900,
            "failure_probability": 0.62,
            "asset_criticality": "critical"
        },
        expected_decision=ExpectedDecision(
            severity="HIGH",
            escalate=True,
            human_approval_required=True,
            recommended_action="INVESTIGATE"
        )
    ),
    Scenario(
        id="pred-maint-04",
        category="Predictive Maintenance",
        title="High Failure Probability Conveyor Belt Assembly",
        description="Conveyor 09 shows 94% ML failure prediction within 24 hours due to drive shaft thermal load.",
        structured_context={
            "asset_id": "CONVEYOR-09",
            "vibration_mm_s": 11.5,
            "temperature_c": 81.0,
            "operating_hours": 14500,
            "failure_probability": 0.94,
            "asset_criticality": "high"
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="ESCALATE"
        )
    ),
    Scenario(
        id="pred-maint-05",
        category="Predictive Maintenance",
        title="Emergency Generator Critical RUL Warning",
        description="Backup Generator 02 has 3 days Remaining Useful Life (RUL) remaining with high asset criticality during storm season.",
        structured_context={
            "asset_id": "GENERATOR-02",
            "remaining_useful_life_days": 3,
            "vibration_mm_s": 8.1,
            "temperature_c": 68.5,
            "failure_probability": 0.78,
            "asset_criticality": "critical"
        },
        expected_decision=ExpectedDecision(
            severity="CRITICAL",
            escalate=True,
            human_approval_required=True,
            recommended_action="ESCALATE"
        )
    )
]


def get_all_scenarios() -> List[Scenario]:
    return SCENARIOS_DATASET


def get_scenario_by_id(scenario_id: str) -> Optional[Scenario]:
    for s in SCENARIOS_DATASET:
        if s.id == scenario_id:
            return s
    return None
