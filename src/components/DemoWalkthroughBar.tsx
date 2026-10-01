import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft, Play, CheckCircle, Info, Sparkles } from 'lucide-react';

interface DemoWalkthroughBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUploadSamplePrompt?: () => void;
}

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Login as Care Coordinator',
    description: 'Switch active user to Maya Patel, RN (Senior Clinical Care Coordinator).',
    tab: 'dashboard',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 2,
    title: 'Open Demo Patient',
    description: 'Select synthetic patient Aarav Sharma (P-1001, Age 42).',
    tab: 'patients',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 3,
    title: 'Upload Sample Medical Report',
    description: 'Upload or quick-seed a new laboratory report or cardiology slip into the intake engine.',
    tab: 'documents',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 4,
    title: 'AI Processes Document',
    description: 'Document Agent and Extraction Agent analyze metadata, dates, and structured facts.',
    tab: 'documents',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 5,
    title: 'Show Extracted Information',
    description: 'Review structured items classified by confidence and category.',
    tab: 'evidence',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 6,
    title: 'Click "View Evidence"',
    description: 'Inspect verbatim document excerpts and source page location.',
    tab: 'evidence',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 7,
    title: 'Open Patient Timeline',
    description: 'Examine chronological milestone events backed by source documents.',
    tab: 'timeline',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 8,
    title: 'Open Upcoming Appointment',
    description: 'Review scheduled consultation with Dr. Robert Harrison on 15 Oct 2026.',
    tab: 'appointments',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 9,
    title: 'Show Appointment Preparation',
    description: 'Verify administrative prep checklist and required patient documents.',
    tab: 'appointments',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 10,
    title: 'Show Missing / Uncertain Notice',
    description: 'Note safe administrative wording: "Document referral was not found in uploaded records".',
    tab: 'appointments',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 11,
    title: 'Open Follow-ups',
    description: 'Track administrative reminders and prescription synchronization deadlines.',
    tab: 'followups',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 12,
    title: 'Generate Doctor Briefing',
    description: 'Briefing Agent synthesizes care coordination summary with AI limitations disclaimer.',
    tab: 'briefings',
    role: 'CARE_COORDINATOR' as const
  },
  {
    step: 13,
    title: 'Clinician Reviews Briefing',
    description: 'Switch to Dr. Sarah Lin, MD to inspect briefing claims and evidence citations.',
    tab: 'briefings',
    role: 'CLINICIAN' as const
  },
  {
    step: 14,
    title: 'Clinician Clicks "Approve"',
    description: 'Human-in-the-Loop approval finalizes the briefing with reviewer timestamp.',
    tab: 'briefings',
    role: 'CLINICIAN' as const
  },
  {
    step: 15,
    title: 'Audit Log Records Approval',
    description: 'Verify complete tamper-evident audit trail capturing user, action, and timestamp.',
    tab: 'audit-logs',
    role: 'ADMIN' as const
  }
];

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { demoStep, setDemoStep, setCurrentUserRole, openEvidenceModal, facts } = useApp();
  const currentStepInfo = DEMO_STEPS.find(s => s.step === demoStep) || DEMO_STEPS[0];

  const applyStepAction = (stepIndex: number) => {
    const s = DEMO_STEPS[stepIndex - 1];
    if (!s) return;
    setDemoStep(stepIndex);
    setActiveTab(s.tab);
    setCurrentUserRole(s.role);

    // If step 6: open first evidence fact modal automatically for a great demo!
    if (stepIndex === 6 && facts.length > 0) {
      openEvidenceModal(facts[0]);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Step indicator and description */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>DEMO WALKTHROUGH</span>
            <span className="font-mono tabular-nums ml-1">Step {demoStep} of 15</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-white mr-2">
              {currentStepInfo.title}
            </span>
            <span className="text-xs text-slate-400 hidden lg:inline">
              — {currentStepInfo.description}
            </span>
          </div>
        </div>

        {/* Controller actions */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={() => applyStepAction(Math.max(1, demoStep - 1))}
            disabled={demoStep === 1}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          <button
            onClick={() => applyStepAction(demoStep)}
            className="px-3 py-1 text-xs font-medium text-teal-300 bg-teal-950/60 border border-teal-700 rounded hover:bg-teal-900 flex items-center gap-1"
            title="Navigate to active step screen and apply role"
          >
            <Play className="w-3 h-3 fill-teal-400" />
            Jump To Step
          </button>

          <button
            onClick={() => applyStepAction(Math.min(15, demoStep + 1))}
            disabled={demoStep === 15}
            className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 rounded hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
          >
            Next Step
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <select
            value={demoStep}
            onChange={(e) => applyStepAction(Number(e.target.value))}
            className="text-xs py-1 px-2 bg-slate-800 border border-slate-700 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
          >
            {DEMO_STEPS.map(s => (
              <option key={s.step} value={s.step}>
                {s.step}. {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
