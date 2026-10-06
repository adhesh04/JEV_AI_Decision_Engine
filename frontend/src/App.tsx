import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveDecisionPage } from './pages/LiveDecisionPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { ResultsPage } from './pages/ResultsPage';
import { fetchHealth, fetchScenarios } from './api';
import type { HealthStatus, Scenario } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'benchmark' | 'scenarios' | 'results'>('live');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [h, sc] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchScenarios().catch(() => [])
        ]);
        setHealth(h);
        setScenarios(sc);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleSelectScenarioForLive = () => {
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

        <main>
          {loading ? (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-4 border-[#900C3F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Initializing Jev Decision Lab environment...
            </div>
          ) : (
            <>
              {activeTab === 'live' && (
                <LiveDecisionPage scenarios={scenarios} health={health} />
              )}

              {activeTab === 'benchmark' && (
                <BenchmarkPage scenarios={scenarios} health={health} />
              )}

              {activeTab === 'scenarios' && (
                <ScenariosPage
                  scenarios={scenarios}
                  onSelectScenarioForLive={handleSelectScenarioForLive}
                />
              )}

              {activeTab === 'results' && <ResultsPage />}
            </>
          )}
        </main>
      </div>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#900C3F]">JEV DECISION LAB</span>
            <span>—</span>
            <span>Architectural Proof-of-Concept</span>
          </div>
          <div>
            TypeSafe Jev vs Groq LLM | Bounded Enterprise Decision Layer
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
