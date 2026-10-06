import React, { useState, useEffect } from 'react';
import type { ExecutionHistoryItem } from '../types';
import { fetchBenchmarkHistory } from '../api';
import { History, Eye, X, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';
import { SimulationBadge } from '../components/SimulationBadge';

export const ResultsPage: React.FC = () => {
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<ExecutionHistoryItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBenchmarkHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (providerFilter === 'All') return true;
    return item.provider.toLowerCase().includes(providerFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#900C3F]/10 text-[#900C3F] text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" /> Database Execution History
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            PERSISTED BENCHMARK RESULTS
          </h2>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Complete empirical audit trail recorded in local SQLite database
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
            {['All', 'Jev', 'Groq'].map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  providerFilter === p
                    ? 'bg-white text-[#900C3F] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Execution Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Execution Log ({filteredHistory.length} records)
          </h3>
          <button
            onClick={loadData}
            className="text-xs font-bold text-[#900C3F] hover:underline"
          >
            Refresh Log
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading database execution logs...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No execution logs found in SQLite. Run decisions or benchmarks to populate the log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID / Timestamp</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Provider / Model</th>
                  <th className="py-3 px-4 text-center">Decision</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                  <th className="py-3 px-4 text-right">Tokens / Cost</th>
                  <th className="py-3 px-4 text-center">Correct</th>
                  <th className="py-3 px-4 text-center">Mode</th>
                  <th className="py-3 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      <div>#{item.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.scenario_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold block text-slate-900">{item.provider}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.model}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-900 font-bold border border-slate-200 font-mono">
                        {item.decision?.recommended_action || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                      {item.latency_ms} ms
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                      <div>{item.total_tokens} tokens</div>
                      <div className="text-slate-400">${item.estimated_cost.toFixed(6)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.correct ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                          <AlertTriangle className="w-4 h-4" /> NO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <SimulationBadge isSimulated={item.is_simulated} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                        title="View Raw Response JSON"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Response Inspect Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#900C3F]" /> Raw Execution Response JSON
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Execution ID #{selectedItem.id} | Scenario: {selectedItem.scenario_id} | Provider: {selectedItem.provider}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-y-auto max-h-[500px]">
              <pre>{JSON.stringify(selectedItem.raw_response, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Inspect Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
