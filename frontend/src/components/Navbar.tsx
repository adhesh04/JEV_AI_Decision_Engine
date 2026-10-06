import React from 'react';
import { Cpu, BarChart3, Database, History, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import type { HealthStatus } from '../types';

interface NavbarProps {
  activeTab: 'live' | 'benchmark' | 'scenarios' | 'results';
  setActiveTab: (tab: 'live' | 'benchmark' | 'scenarios' | 'results') => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, health }) => {
  const tabs = [
    { id: 'live', label: 'Live Decision', icon: Cpu },
    { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
    { id: 'scenarios', label: 'Scenarios', icon: Database },
    { id: 'results', label: 'Results & History', icon: History }
  ] as const;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('live')}>
            <div className="w-10 h-10 rounded-lg bg-[#900C3F] flex items-center justify-center text-white shadow-sm font-black text-xl tracking-tighter">
              JEV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  JEV DECISION LAB
                </h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#900C3F] border border-slate-200 uppercase">
                  POC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Bounded enterprise decisions — live comparison
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-[#900C3F] shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#900C3F]' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Status Pills */}
          <div className="flex items-center gap-2">
            {health && (
              <>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                    health.typesafe_key_configured && health.jev_mode === 'live'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>JEV: {health.jev_mode.toUpperCase()}</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                    health.groq_key_configured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {health.groq_key_configured ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>GROQ {health.groq_key_configured ? 'READY' : 'NO KEY'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
