import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const AgentProgressModal: React.FC = () => {
  const { isProcessingAgents, currentAgentProgress } = useApp();

  if (!isProcessingAgents) return null;

  const agentSteps = [
    { key: 'DOCUMENT', label: '1. Document Agent', desc: 'Classifies document type & extracts explicit metadata' },
    { key: 'EXTRACTION', label: '2. Extraction Agent', desc: 'Extracts structured clinical & administrative facts' },
    { key: 'EVIDENCE', label: '3. Evidence & Uncertainty Agent', desc: 'Classifies into FACT, UNCERTAIN, MISSING, or ASSUMPTION' },
    { key: 'TIMELINE', label: '4. Timeline Agent', desc: 'Generates chronological patient milestones' },
    { key: 'APPOINTMENT', label: '5. Appointment Agent', desc: 'Synthesizes administrative preparation checklist' },
    { key: 'FOLLOWUP', label: '6. Follow-up Agent', desc: 'Detects medication synchronization & task deadlines' },
    { key: 'BRIEFING', label: '7. Doctor Briefing Agent', desc: 'Synthesizes clinician briefing with evidence citations' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold">Orchestrating 7-Stage Agent Pipeline</h3>
              <p className="text-xs text-slate-400">Processing document text & generating evidence links</p>
            </div>
          </div>
          <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {agentSteps.map((step) => {
            const progress = currentAgentProgress.find(p => p.step === step.key);
            const status = progress ? progress.status : 'IDLE';

            return (
              <div
                key={step.key}
                className={`p-3 rounded-lg border transition-all text-xs flex items-start justify-between gap-3 ${
                  status === 'RUNNING'
                    ? 'bg-teal-50/80 border-teal-400 ring-1 ring-teal-400/20'
                    : status === 'COMPLETED'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{step.label}</span>
                    {status === 'COMPLETED' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 inline" />
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px]">{step.desc}</div>
                  {progress?.summary && (
                    <div className="text-teal-800 font-mono text-[11px] mt-1 pt-1 border-t border-teal-200/50">
                      {progress.summary}
                    </div>
                  )}
                </div>

                <div className="shrink-0 mt-0.5">
                  {status === 'RUNNING' && (
                    <span className="flex items-center gap-1 text-teal-700 font-bold text-[11px]">
                      <Loader2 className="w-3 h-3 animate-spin" /> Running
                    </span>
                  )}
                  {status === 'COMPLETED' && (
                    <span className="text-teal-700 font-bold text-[11px]">Done</span>
                  )}
                  {status === 'IDLE' && (
                    <span className="text-slate-400 text-[11px]">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
