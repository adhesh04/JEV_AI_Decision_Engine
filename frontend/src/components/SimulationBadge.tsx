import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SimulationBadgeProps {
  isSimulated: boolean;
}

export const SimulationBadge: React.FC<SimulationBadgeProps> = ({ isSimulated }) => {
  if (!isSimulated) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        LIVE API
      </span>
    );
  }

  return (
    <span
      title="JEV_MODE=mock: TypeSafe API signup temporarily paused. Running simulation mode."
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-xs"
    >
      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
      SIMULATION MODE
    </span>
  );
};
