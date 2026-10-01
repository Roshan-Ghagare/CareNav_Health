import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Settings,
  Shield,
  CheckCircle2,
  Database,
  Cpu,
  Sparkles,
  Lock,
  RefreshCw,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUserRole,
    mockAiMode,
    setMockAiMode,
    documents,
    facts,
    auditLogs
  } = useApp();

  const roles: { role: UserRole; name: string; title: string; desc: string }[] = [
    {
      role: 'CARE_COORDINATOR',
      name: 'Maya Patel, RN',
      title: 'Senior Clinical Care Coordinator',
      desc: 'Uploads documents, organizes records, coordinates appointments, manages administrative follow-ups, and reviews extracted facts.'
    },
    {
      role: 'CLINICIAN',
      name: 'Dr. Sarah Lin, MD',
      title: 'Attending Physician, Internal Medicine',
      desc: 'Reviews chronological patient timelines, validates evidence citations, inspects doctor briefings, and provides official clinical approval.'
    },
    {
      role: 'PATIENT',
      name: 'Aarav Sharma',
      title: 'Patient Self-Service Access',
      desc: 'Views personal chronological health timeline, upcoming appointment prep checklists, and medication reminders in read-only mode.'
    },
    {
      role: 'ADMIN',
      name: 'David Foster',
      title: 'Lead Health Systems Administrator',
      desc: 'System governance, user role assignments, audit trail monitoring, and compliance verification.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>System Configuration</span>
            <span aria-hidden="true">·</span>
            <span>Role-Based Access Control (RBAC) & AI Modes</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Platform Settings & Security Invariants
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage active demonstration roles, AI reasoning engines, and safety boundary invariants.
          </p>
        </div>
      </div>

      {/* Role Switcher Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Active Profile Switcher (RBAC)</h2>
          <p className="text-xs text-slate-500">
            Switch between demo user roles to experience the application from different perspectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => {
            const isActive = currentUser.role === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setCurrentUserRole(r.role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${isActive ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.title}</div>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Switch &rarr;</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Engine Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Agentic AI Reasoning Engine</h2>
          <p className="text-xs text-slate-500">
            Configure agent runtime behavior between deterministic synthetic mode and live LLM integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setMockAiMode(true)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mockAiMode
                ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">Deterministic Mock AI Mode (Recommended for Demo)</span>
              </div>
              {mockAiMode && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800">
                  ENABLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides deterministic, immediate outputs for all 7 agents with zero network latency or external API key dependencies. Ideal for offline demonstrations, college evaluations, and consistent regression tests.
            </p>
          </div>

          <div
            onClick={() => setMockAiMode(false)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              !mockAiMode
                ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-slate-900">Gemini LLM Agent Pipeline</span>
              </div>
              {!mockAiMode && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                  ENABLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatches extracted document text to Gemini models via structured JSON schemas with fallback to deterministic heuristics if network or API keys are unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Non-Diagnostic Invariants Check */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Mandatory Safety Guardrails & Invariants</h2>
          <p className="text-xs text-slate-500">
            System rules strictly enforced across all agent prompts, UI screens, and coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Non-Diagnostic Invariant', desc: 'No disease diagnosis or differential prognostic statements permitted.' },
            { label: 'Non-Prescriptive Invariant', desc: 'Zero medication dose alteration or prescription initiation commands.' },
            { label: 'Evidence Citation Requirement', desc: 'Every extracted claim must cite verbatim text and source file.' },
            { label: 'Uncertainty Separation', desc: 'Inferences marked ASSUMPTION; gaps marked MISSING; never shown as FACT.' },
            { label: 'Human-in-the-Loop Barrier', desc: 'Doctor briefings remain DRAFT until certified by licensed physician.' },
            { label: 'Administrative Wording', desc: '"Document X not located in records" rather than clinical necessity claims.' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{item.label}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
