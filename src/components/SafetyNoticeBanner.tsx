import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const SafetyNoticeBanner: React.FC = () => {
  return (
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="font-semibold text-slate-900">Safety & Regulatory Scope:</span>
          <span>
            Administrative Care Coordination & Evidence Navigation Only. Strictly non-diagnostic & non-prescriptive.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>All clinical summaries require licensed physician review prior to patient care reliance.</span>
        </div>
      </div>
    </div>
  );
};
