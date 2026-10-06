import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "jev_benchmark.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS benchmark_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_batch_id TEXT,
            timestamp TEXT,
            scenario_id TEXT,
            provider TEXT,
            model TEXT,
            latency_ms REAL,
            input_tokens INTEGER,
            output_tokens INTEGER,
            total_tokens INTEGER,
            estimated_cost REAL,
            decision TEXT,
            confidence REAL,
            expected_decision TEXT,
            correct INTEGER,
            raw_response TEXT,
            is_simulated INTEGER
        )
    """)
    conn.commit()
    conn.close()


def save_execution_result(
    run_batch_id: str,
    timestamp: str,
    scenario_id: str,
    provider: str,
    model: str,
    latency_ms: float,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
    estimated_cost: float,
    decision: Dict[str, Any],
    confidence: float,
    expected_decision: Dict[str, Any],
    correct: bool,
    raw_response: Dict[str, Any],
    is_simulated: bool
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO benchmark_executions (
            run_batch_id, timestamp, scenario_id, provider, model,
            latency_ms, input_tokens, output_tokens, total_tokens, estimated_cost,
            decision, confidence, expected_decision, correct, raw_response, is_simulated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_batch_id,
        timestamp,
        scenario_id,
        provider,
        model,
        latency_ms,
        input_tokens,
        output_tokens,
        total_tokens,
        estimated_cost,
        json.dumps(decision),
        confidence,
        json.dumps(expected_decision),
        1 if correct else 0,
        json.dumps(raw_response),
        1 if is_simulated else 0
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id


def get_all_executions() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM benchmark_executions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        item = dict(r)
        item["decision"] = json.loads(item["decision"]) if item["decision"] else {}
        item["expected_decision"] = json.loads(item["expected_decision"]) if item["expected_decision"] else {}
        item["raw_response"] = json.loads(item["raw_response"]) if item["raw_response"] else {}
        item["correct"] = bool(item["correct"])
        item["is_simulated"] = bool(item["is_simulated"])
        results.append(item)
    return results


def clear_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM benchmark_executions")
    conn.commit()
    conn.close()
