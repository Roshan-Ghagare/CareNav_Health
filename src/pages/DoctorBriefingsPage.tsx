import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DoctorBriefing } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import {
  ShieldCheck,
  Check,
  X,
  Edit3,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Printer,
  ChevronDown
} from 'lucide-react';

export const DoctorBriefingsPage: React.FC = () => {
  const {
    briefings,
    selectedPatient,
    approveBriefing,
    rejectBriefing,
    editBriefing,
    generateBriefingForPatient,
    currentUser,
    openEvidenceModal,
    facts
  } = useApp();

  const [activeBriefingId, setActiveBriefingId] = useState<string | null>(null);
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableSummary, setEditableSummary] = useState('');

  const patientBriefings = briefings.filter(b => b.patientId === selectedPatient.id);
  const currentBriefing = activeBriefingId
    ? patientBriefings.find(b => b.id === activeBriefingId) || patientBriefings[0]
    : patientBriefings[0];

  const handleApprove = () => {
    if (!currentBriefing) return;
    approveBriefing(currentBriefing.id, clinicianNotes);
    setClinicianNotes('');
  };

  const handleReject = () => {
    if (!currentBriefing) return;
    rejectBriefing(currentBriefing.id, clinicianNotes || 'Returned for coordinator revision');
    setClinicianNotes('');
  };

  const handleSaveEdit = () => {
    if (!currentBriefing) return;
    editBriefing(currentBriefing.id, editableSummary);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (!currentBriefing) return;
    setEditableSummary(currentBriefing.patientInformationSummary);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Doctor Briefing Agent</span>
              <span aria-hidden="true">·</span>
              <span>Evidence-Backed Clinician Care Summary</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Doctor Care Briefings
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Structured clinical synthesis backed by document citations. Requires explicit physician review and approval.
            </p>
          </div>

          <button
            onClick={() => generateBriefingForPatient(selectedPatient.id)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Generate New Briefing
          </button>
        </div>
      </div>

      {currentBriefing ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Briefing Top Banner */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  PATIENT CARE BRIEFING
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                    currentBriefing.status === 'APPROVED'
                      ? 'bg-teal-100 text-teal-800 border border-teal-300'
                      : currentBriefing.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {currentBriefing.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {currentBriefing.patientName} (MRN: {selectedPatient.patientIdentifier})
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Generated: {currentBriefing.generatedAt}
              </div>
            </div>

            {/* Clinician Review Actions */}
            <div className="flex items-center gap-2">
              {currentBriefing.status === 'DRAFT' && (
                <>
                  <button
                    onClick={startEdit}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded hover:bg-teal-800 flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    Approve Briefing
                  </button>
                </>
              )}
              {currentBriefing.status === 'APPROVED' && (
                <div className="text-xs text-teal-800 font-semibold flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                  <Check className="w-4 h-4 text-teal-700" />
                  <span>Approved by {currentBriefing.reviewedBy || currentUser.name} ({currentBriefing.reviewedAt})</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Banner & Mandatory Safety Boundary */}
          <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Generated by AI · Requires Human Review: </span>
              {currentBriefing.aiLimitationsDisclaimer}
            </div>
          </div>

          {/* Briefing Sections */}
          <div className="p-6 space-y-6">
            {/* 1. Patient Information */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Patient Information
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs font-medium text-white bg-teal-700 rounded"
                    >
                      Save Summary
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-xs text-slate-600 bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {currentBriefing.patientInformationSummary}
                </p>
              )}
            </div>

            {/* 2. Recent Timeline Summary */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Recent Timeline & Event History
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {currentBriefing.recentTimelineSummary}
              </p>
            </div>

            {/* 3. Available Documents */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Available Source Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentBriefing.availableDocumentsSummary.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Appointments & Follow-ups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  4. Scheduled Appointments
                </h3>
                <div className="space-y-2">
                  {currentBriefing.appointmentsSummary.map((apt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{apt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  5. Documented Follow-up Tasks
                </h3>
                <div className="space-y-2">
                  {currentBriefing.documentedFollowupItems.map((fol, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{fol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Missing / Uncertain Information Flags */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                6. Missing or Uncertain Administrative Information
              </h3>
              <div className="space-y-2">
                {currentBriefing.missingOrUncertainInformation.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-xs text-rose-900 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Evidence References Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                7. Traceable Evidence Citations
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Extracted Fact</th>
                      <th className="py-2.5 px-3">Classification</th>
                      <th className="py-2.5 px-3">Source & Location</th>
                      <th className="py-2.5 px-3">Verbatim Supporting Quote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentBriefing.evidenceReferences.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{ref.fact}</td>
                        <td className="py-2.5 px-3">
                          <EvidenceBadge status={ref.status} showIcon={false} />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{ref.source}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800 bg-slate-50/50">
                          "{ref.quote}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinician Review Notes Input (for Draft) */}
            {currentBriefing.status === 'DRAFT' && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Physician / Attending Review Notes:
                </label>
                <input
                  type="text"
                  placeholder="Enter optional clinical review note before approval (e.g., 'Checked metabolic values, confirmed referral retrieval pending')."
                  value={clinicianNotes}
                  onChange={(e) => setClinicianNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No briefings generated yet for this patient. Click "Generate New Briefing" above.
        </div>
      )}
    </div>
  );
};
