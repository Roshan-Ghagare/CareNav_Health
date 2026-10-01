import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  FileText,
  ShieldAlert,
  ArrowRight,
  Printer
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { appointments, selectedPatient, openEvidenceModal, facts } = useApp();
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  const patientApts = appointments.filter(a => a.patientId === selectedPatient.id);

  const activeApt = selectedAptId
    ? patientApts.find(a => a.id === selectedAptId) || patientApts[0]
    : patientApts[0];

  const handleInspectDocument = (docNameSnippet: string) => {
    const fact = facts.find(f => f.sourceDocumentName.toLowerCase().includes(docNameSnippet.toLowerCase())) || facts[0];
    if (fact) {
      openEvidenceModal(fact);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Appointment Agent</span>
              <span aria-hidden="true">·</span>
              <span>Administrative Coordination & Preparation</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Coordinated Appointments & Readiness
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Care-navigation checklists identifying verified records and absent administrative documentation.
            </p>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Strict policy: Administrative checklist notices only. Non-diagnostic.</span>
          </div>
        </div>
      </div>

      {/* Appointment Selection & Full Readiness View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Appointments List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Scheduled Consultations ({patientApts.length})
          </h2>

          {patientApts.map(apt => (
            <button
              key={apt.id}
              onClick={() => setSelectedAptId(apt.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeApt?.id === apt.id
                  ? 'bg-teal-50/50 border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                  {apt.department}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800">
                  {apt.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{apt.doctorName}</h3>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{apt.appointmentDate} at {apt.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{apt.location}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Detailed Appointment Preparation Checklist */}
        {activeApt && (
          <div className="lg:col-span-2 space-y-5 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Encounter Preparation Card
                </span>
                <h2 className="text-lg font-bold text-slate-900">{activeApt.doctorName}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeApt.department} · {activeApt.appointmentType}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-sm font-bold text-slate-900 font-mono">{activeApt.appointmentDate}</div>
                <div className="text-xs text-slate-500 font-mono">{activeApt.appointmentTime}</div>
              </div>
            </div>

            {/* Location & Source Document */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Encounter Location:</span>
                  <span className="font-semibold text-slate-800">{activeApt.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Source Scheduling Doc:</span>
                  <span className="font-semibold text-slate-800">{activeApt.sourceDocumentName}</span>
                </div>
              </div>
            </div>

            {/* Preparation Checklists */}
            <div className="space-y-4">
              {/* Section 1: Verified Available Documents */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Available Patient Records on File
                </h3>
                <div className="space-y-1.5">
                  {activeApt.preparationChecklist.availableDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-teal-50/40 border border-teal-200/80 rounded-lg text-xs text-teal-950 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{doc}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-teal-800 font-mono">VERIFIED</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Missing Records (Using careful administrative wording) */}
              {activeApt.preparationChecklist.potentiallyMissing.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Potentially Absent Administrative Records
                  </h3>
                  <div className="space-y-1.5">
                    {activeApt.preparationChecklist.potentiallyMissing.map((missingItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Notice: Document Not Located</div>
                          <div className="text-rose-800 mt-0.5">{missingItem}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Patient & Coordinator Action Steps */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Actionable Preparation Steps
                </h3>
                <div className="space-y-1.5">
                  {activeApt.preparationChecklist.preparationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
