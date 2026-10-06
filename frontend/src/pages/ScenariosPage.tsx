import React, { useState } from 'react';
import type { Scenario } from '../types';
import { Database, Code2, CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';

interface ScenariosPageProps {
  scenarios: Scenario[];
  onSelectScenarioForLive: (scenarioId: string) => void;
}

export const ScenariosPage: React.FC<ScenariosPageProps> = ({ scenarios, onSelectScenarioForLive }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'IT Operations', 'Helpdesk', 'Predictive Maintenance'];

  const filteredScenarios = selectedCategory === 'All'
    ? scenarios
    : scenarios.filter(s => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#900C3F]/10 text-[#900C3F] text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" /> Deterministic Scenario Dataset
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ENTERPRISE SCENARIOS DATASET
          </h2>
          <p className="text-slate-600 text-sm font-medium mt-1">
            15 Bounded enterprise incident scenarios with predefined ground truth reference labels
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-[#900C3F] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs font-medium flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <strong className="font-bold">Important Note on Ground Truth:</strong> Reference labels are POC ground truth, not a universal benchmark. They represent predefined evaluation targets for this architectural demonstration.
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scen) => (
          <div
            key={scen.id}
            className="bg-white border border-slate-200 hover:border-[#900C3F]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 font-semibold">{scen.id}</span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700 border border-slate-200">
                  {scen.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {scen.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {scen.description}
              </p>

              {/* Structured Context JSON */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> Structured Context
                </span>
                <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-xl max-h-[140px] overflow-y-auto">
                  <pre>{JSON.stringify(scen.structured_context, null, 2)}</pre>
                </div>
              </div>

              {/* Ground Truth Expected Decision */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-[#900C3F]" /> Predefined Reference Labels
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Severity:</span>
                    <strong className="text-slate-800">{scen.expected_decision.severity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Action:</span>
                    <strong className="text-[#900C3F] font-bold">{scen.expected_decision.recommended_action}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Escalate:</span>
                    <strong className="text-slate-800">{scen.expected_decision.escalate ? 'YES' : 'NO'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Human Approval:</span>
                    <strong className="text-slate-800">{scen.expected_decision.human_approval_required ? 'YES' : 'NO'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onSelectScenarioForLive(scen.id)}
                className="text-xs font-bold text-[#900C3F] hover:text-[#8B0000] flex items-center gap-1 hover:underline cursor-pointer"
              >
                Test in Live Decision <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
