import React, { useState } from 'react';
import { ExternalLink, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const MethodologyPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-10 border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-6 py-4 bg-slate-50 cursor-pointer border-b border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-[#900C3F]" />
          <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
            Source & Methodology Panel
          </h3>
        </div>
        <button className="text-slate-500 hover:text-slate-700">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 text-xs text-slate-600 space-y-4 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1 text-xs">Official Sources:</span>
              <ul className="space-y-1.5 font-mono text-[11px]">
                <li>
                  <a
                    href="https://api.typesafe.ai/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#900C3F] hover:underline flex items-center gap-1"
                  >
                    TypeSafe API Documentation <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://typesafe.ai/blog/introducing-system-one-models-and-jev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#900C3F] hover:underline flex items-center gap-1"
                  >
                    TypeSafe Jev Announcement <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://console.groq.com/docs/api-reference"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#900C3F] hover:underline flex items-center gap-1"
                  >
                    Groq API Documentation <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1 text-xs">Measurement Methodology:</span>
              <p className="text-slate-600">
                <strong>Observed API Latency:</strong> Latency is measured by this application as end-to-end API round-trip time using <code className="bg-slate-200 px-1 py-0.5 rounded">time.perf_counter()</code>. It is not a measurement of raw model compute time.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1 text-xs">Cost & Reference Ground Truth:</span>
              <p className="text-slate-600">
                <strong>Cost:</strong> Cost is calculated from provider-published pricing where available.
              </p>
              <p className="text-slate-600 mt-1">
                <strong>Reference Labels:</strong> Reference labels are manually defined for this POC and are not intended to represent a standardized benchmark.
              </p>
            </div>
          </div>

          <div className="text-slate-500 italic">
            Note: TypeSafe Jev is engineered specifically for the bounded Decision Layer (Understand → Structured Context → Decision → Action), whereas Groq runs generative language inference.
          </div>
        </div>
      )}
    </div>
  );
};
