import React, { useState, useEffect } from 'react';
import type { BenchmarkStatsResponse, Scenario, HealthStatus, ExecutionHistoryItem } from '../types';
import { fetchBenchmarkStats, runBenchmark, resetBenchmarkHistory, fetchBenchmarkHistory } from '../api';
import { Charts } from '../components/Charts';
import { MethodologyPanel } from '../components/MethodologyPanel';
import { SimulationBadge } from '../components/SimulationBadge';
import { Play, RotateCcw, BarChart2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BenchmarkPageProps {
  scenarios: Scenario[];
  health: HealthStatus | null;
}

export const BenchmarkPage: React.FC<BenchmarkPageProps> = ({ scenarios, health }) => {
  const [stats, setStats] = useState<BenchmarkStatsResponse | null>(null);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [runningText, setRunningText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await fetchBenchmarkStats();
      setStats(s);
      const h = await fetchBenchmarkHistory();
      setHistory(h);
    } catch {
      setError('Failed to load benchmark data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteBenchmark = async (runs: number, label: string) => {
    setLoading(true);
    setRunningText(label);
    setError(null);
    try {
      await runBenchmark(undefined, runs);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error executing benchmark run.');
    } finally {
      setLoading(false);
      setRunningText('');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all benchmark execution history?')) return;
    try {
      await resetBenchmarkHistory();
      await loadData();
    } catch {
      setError('Failed to clear benchmark history.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#900C3F]/10 text-[#900C3F] text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart2 className="w-3.5 h-3.5" /> Aggregate Performance Analysis
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            BENCHMARK ENGINE
          </h2>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Empirical comparison across all {scenarios.length} enterprise scenarios
          </p>
        </div>

        {/* Benchmark Run Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExecuteBenchmark(1, 'Executing 1 Run...')}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run 1 Trial
          </button>

          <button
            onClick={() => handleExecuteBenchmark(5, 'Executing 5 Runs...')}
            disabled={loading}
            className="px-4 py-2.5 bg-[#900C3F] hover:bg-[#8B0000] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run 5 Trials
          </button>

          <button
            onClick={() => handleExecuteBenchmark(1, 'Running Full Suite...')}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            Run Full Benchmark
          </button>

          <button
            onClick={handleClearHistory}
            disabled={loading}
            title="Reset SQLite database"
            className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h4 className="font-bold text-base">{runningText}</h4>
              <p className="text-xs text-slate-400">Executing scenarios through TypeSafe Jev & Groq LLM</p>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-400 font-bold">In Progress...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Aggregate Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Total Executions
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_executions}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {stats.total_scenarios} unique scenarios
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Jev Accuracy
              </span>
              <div className="text-2xl font-black text-[#900C3F] mt-1">
                {Math.round(stats.jev_summary.accuracy * 100)}%
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {stats.jev_summary.correct_runs} / {stats.jev_summary.total_runs} correct
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Groq Accuracy
              </span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {Math.round(stats.groq_summary.accuracy * 100)}%
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {stats.groq_summary.correct_runs} / {stats.groq_summary.total_runs} correct
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Average Latency
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {stats.jev_summary.latency.avg} <span className="text-xs font-normal text-slate-400">vs</span> {stats.groq_summary.latency.avg} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Jev vs Groq observed ms
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                Decision Agreement
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {Math.round(stats.decision_agreement_rate * 100)}%
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {stats.agreement_count} matching decisions
              </span>
            </div>
          </div>

          {/* Visual Benchmark Charts */}
          <Charts jevSummary={stats.jev_summary} groqSummary={stats.groq_summary} />

          {/* Scenarios Execution Results Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scenario Execution Comparison Table
                </h3>
                <p className="text-xs text-slate-500">
                  Observed metrics from recent executions in SQLite database
                </p>
              </div>
              <SimulationBadge isSimulated={stats.jev_summary.total_runs > 0 ? (health?.jev_mode === 'mock') : false} />
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No benchmark runs recorded yet. Click <strong>Run 1 Trial</strong> or <strong>Run 5 Trials</strong> to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Scenario</th>
                      <th className="py-3 px-4 text-center">Jev Decision</th>
                      <th className="py-3 px-4 text-center">Groq Decision</th>
                      <th className="py-3 px-4 text-center">Expected</th>
                      <th className="py-3 px-4 text-right">Jev ms</th>
                      <th className="py-3 px-4 text-right">Groq ms</th>
                      <th className="py-3 px-4 text-center">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {scenarios.map((scen) => {
                      const jevLast = history.find(h => h.scenario_id === scen.id && (h.provider.includes('Jev') || h.provider.includes('TypeSafe')));
                      const groqLast = history.find(h => h.scenario_id === scen.id && h.provider.includes('Groq'));

                      const jevAct = jevLast?.decision?.recommended_action || 'N/A';
                      const groqAct = groqLast?.decision?.recommended_action || 'N/A';
                      const expectedAct = scen.expected_decision.recommended_action;

                      const isMatch = (jevAct === groqAct) && (jevAct !== 'N/A');

                      return (
                        <tr key={scen.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{scen.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">[{scen.category}] ID: {scen.id}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded bg-[#900C3F]/10 text-[#900C3F] font-bold border border-[#900C3F]/20">
                              {jevAct}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-bold border border-slate-300">
                              {groqAct}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                              {expectedAct}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                            {jevLast ? `${jevLast.latency_ms} ms` : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                            {groqLast ? `${groqLast.latency_ms} ms` : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isMatch ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" /> MATCH
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                <AlertTriangle className="w-4 h-4" /> DIFF
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Source Methodology */}
      <MethodologyPanel />
    </div>
  );
};
