import React, { useState, useEffect } from 'react';
import type { Scenario, ComparisonResult, HealthStatus } from '../types';
import { runDecision } from '../api';
import { SimulationBadge } from '../components/SimulationBadge';
import { MethodologyPanel } from '../components/MethodologyPanel';
import { Play, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface LiveDecisionPageProps {
  scenarios: Scenario[];
  health: HealthStatus | null;
}

export const LiveDecisionPage: React.FC<LiveDecisionPageProps> = ({ scenarios }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleRunDecision = async () => {
    if (!selectedScenario) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runDecision(selectedScenario.id);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the decision.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#900C3F]/5 to-orange-500/5 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#900C3F]/10 text-[#900C3F] text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" /> Decision Engine Comparison
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              JEV DECISION LAB
            </h2>
            <p className="text-slate-600 text-sm font-medium mt-1">
              "Bounded enterprise decisions — live comparison"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunDecision}
              disabled={loading}
              className="px-6 py-3 bg-[#900C3F] hover:bg-[#8B0000] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing Decision...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Decision
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Selector & Structured Context */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario Selector */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Enterprise Scenario ({scenarios.length} available)
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#900C3F] focus:border-transparent cursor-pointer"
            >
              {scenarios.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  [{scen.category}] {scen.title}
                </option>
              ))}
            </select>

            {selectedScenario && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-mono text-[11px]">
                  <span>ID: {selectedScenario.id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 font-sans font-bold text-slate-700">
                    {selectedScenario.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedScenario.title}</h4>
                <p className="text-slate-600 leading-relaxed">{selectedScenario.description}</p>
              </div>
            )}
          </div>

          {/* Structured Context JSON Display */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Understand → Structured Context
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Format: JSON Object
              </span>
            </div>
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 h-[190px]">
              <pre>{JSON.stringify(selectedScenario?.structured_context || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <strong className="font-bold block">Execution Error</strong>
            {error}
          </div>
        </div>
      )}

      {/* Decision Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Agreement Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between shadow-xs ${
              result.agreement
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/90 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.agreement ? (
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                  DECISION AGREEMENT STATUS
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  {result.agreement ? '✓ MATCH (Both Engines Agreed)' : '⚠ DIFFERENT (Engine Decisions Diverged)'}
                </h3>
              </div>
            </div>

            <div className="text-right text-xs font-semibold">
              <div className="font-mono text-slate-600">Expected Ground Truth:</div>
              <span className="inline-block px-3 py-1 bg-white rounded-lg border border-slate-300 font-bold text-slate-800 uppercase tracking-wider mt-1">
                {result.expected.recommended_action} ({result.expected.severity})
              </span>
            </div>
          </div>

          {/* Dual Provider Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JEV PANEL */}
            <div className="bg-white border-2 border-[#900C3F]/30 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="top-0 left-0 right-0 h-1.5 bg-[#900C3F]"></div>

              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#900C3F] text-white flex items-center justify-center font-black text-sm">
                      JEV
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">TypeSafe Jev</h3>
                      <p className="text-xs text-slate-500 font-mono">Model: {result.jev.model}</p>
                    </div>
                  </div>
                  <SimulationBadge isSimulated={result.jev.is_simulated} />
                </div>

                {result.jev.error ? (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                    {result.jev.error}
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {/* Primary Decision Banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recommended Action
                        </span>
                        <span className="text-2xl font-black text-[#900C3F] tracking-tight">
                          {result.jev.recommended_action}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Average Confidence
                        </span>
                        <span className="text-2xl font-black text-emerald-600 font-mono">
                          {Math.round(result.jev.avg_confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Latency & Metadata Cards */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Observed API Latency
                        </span>
                        <span className="text-base font-bold text-slate-800 font-mono">
                          {result.jev.latency_ms} ms
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Tokens Used
                        </span>
                        <span className="text-base font-bold text-slate-800 font-mono">
                          0 (Typed Evaluation)
                        </span>
                      </div>
                    </div>

                    {/* Typed Answers Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Typed Decision Outputs
                      </h4>
                      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Question</th>
                              <th className="py-2.5 px-3">Typed Output</th>
                              <th className="py-2.5 px-3 text-right">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {result.jev.answers.map((ans) => (
                              <tr key={ans.question_id} className="hover:bg-slate-100/50">
                                <td className="py-2.5 px-3 font-medium text-slate-700">
                                  {ans.question_id}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-900 font-mono">
                                    {ans.answer}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                                  {Math.round(ans.confidence * 100)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Architectural layer: Pure Bounded Decision Engine
              </div>
            </div>

            {/* GROQ PANEL */}
            <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="top-0 left-0 right-0 h-1.5 bg-slate-700"></div>

              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-sm">
                      GRQ
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Groq LLM</h3>
                      <p className="text-xs text-slate-500 font-mono">Model: {result.groq.model}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                    Generative LLM
                  </span>
                </div>

                {result.groq.error ? (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                    {result.groq.error}
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {/* Primary Decision Banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recommended Action
                        </span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {result.groq.recommended_action}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Incident Severity
                        </span>
                        <span className="text-2xl font-black text-slate-800 font-mono">
                          {result.groq.incident_severity}
                        </span>
                      </div>
                    </div>

                    {/* Latency & Metadata Cards */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Observed Latency
                        </span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {result.groq.latency_ms} ms
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Input / Output Tokens
                        </span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {result.groq.input_tokens} / {result.groq.output_tokens}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Est. Cost
                        </span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          ${result.groq.estimated_cost.toFixed(5)}
                        </span>
                      </div>
                    </div>

                    {/* Generated Language Prose Reason */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Generated Prose Reason</span>
                        <span className="text-[10px] text-slate-400 font-normal">Demonstrates Language Nature</span>
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 italic leading-relaxed h-[130px] overflow-y-auto">
                        "{result.groq.reason || 'No reasoning text provided.'}"
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Architectural layer: Generative Language Engine
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Panel */}
      <MethodologyPanel />
    </div>
  );
};
