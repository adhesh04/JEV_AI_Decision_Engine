import React from 'react';
import type { ProviderBenchmarkSummary } from '../types';
import { Zap, Target, DollarSign } from 'lucide-react';

interface ChartsProps {
  jevSummary: ProviderBenchmarkSummary;
  groqSummary: ProviderBenchmarkSummary;
}

export const Charts: React.FC<ChartsProps> = ({ jevSummary, groqSummary }) => {
  const maxLatency = Math.max(jevSummary.latency.avg, groqSummary.latency.avg, 10);
  const jevLatPercent = Math.min(100, Math.max(8, (jevSummary.latency.avg / maxLatency) * 100));
  const groqLatPercent = Math.min(100, Math.max(8, (groqSummary.latency.avg / maxLatency) * 100));

  const jevAccPercent = roundToPct(jevSummary.accuracy);
  const groqAccPercent = roundToPct(groqSummary.accuracy);

  const maxCost = Math.max(jevSummary.avg_cost, groqSummary.avg_cost, 0.00001);
  const jevCostPercent = Math.min(100, Math.max(8, (jevSummary.avg_cost / maxCost) * 100));
  const groqCostPercent = Math.min(100, Math.max(8, (groqSummary.avg_cost / maxCost) * 100));

  function roundToPct(val: number): number {
    return Math.round(val * 100);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Latency Comparison Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Avg Latency
              </h3>
              <p className="text-[11px] text-slate-400">Observed API round-trip (ms)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-[#900C3F] font-bold">TypeSafe Jev</span>
              <span className="font-mono">{jevSummary.latency.avg} ms</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#900C3F] h-full rounded-full transition-all duration-500"
                style={{ width: `${jevLatPercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-slate-700 font-bold">Groq LLM</span>
              <span className="font-mono">{groqSummary.latency.avg} ms</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${groqLatPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Jev Median: {jevSummary.latency.median} ms</span>
          <span>Groq Median: {groqSummary.latency.median} ms</span>
        </div>
      </div>

      {/* Accuracy Comparison Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Accuracy vs Ground Truth
              </h3>
              <p className="text-[11px] text-slate-400">Match rate with reference labels</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-[#900C3F] font-bold">TypeSafe Jev</span>
              <span className="font-mono">{jevAccPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${jevAccPercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-slate-700 font-bold">Groq LLM</span>
              <span className="font-mono">{groqAccPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500/80 h-full rounded-full transition-all duration-500"
                style={{ width: `${groqAccPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Jev: {jevSummary.correct_runs}/{jevSummary.total_runs} correct</span>
          <span>Groq: {groqSummary.correct_runs}/{groqSummary.total_runs} correct</span>
        </div>
      </div>

      {/* Cost Comparison Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Avg Cost / Decision
              </h3>
              <p className="text-[11px] text-slate-400">Based on provider published rates</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-[#900C3F] font-bold">TypeSafe Jev</span>
              <span className="font-mono">${jevSummary.avg_cost.toFixed(6)}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#900C3F] h-full rounded-full transition-all duration-500"
                style={{ width: `${jevCostPercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="text-slate-700 font-bold">Groq LLM</span>
              <span className="font-mono">${groqSummary.avg_cost.toFixed(6)}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${groqCostPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Jev Total: ${jevSummary.total_cost.toFixed(5)}</span>
          <span>Groq Total: ${groqSummary.total_cost.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
};
