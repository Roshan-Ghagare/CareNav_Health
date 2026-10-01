import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from '../components/EvidenceBadge';
import {
  User,
  Phone,
  Calendar,
  Building,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface PatientsPageProps {
  onOpenUpload: () => void;
  setActiveTab: (tab: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ onOpenUpload, setActiveTab }) => {
  const {
    patients,
    selectedPatient,
    setSelectedPatientId,
    documents,
    facts,
    timeline,
    appointments,
    followups,
    briefings,
    openEvidenceModal
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'TIMELINE' | 'APPOINTMENTS' | 'FOLLOWUPS' | 'BRIEFINGS'>('OVERVIEW');

  const patientDocs = documents.filter(d => d.patientId === selectedPatient.id);
  const patientFacts = facts.filter(f => f.patientId === selectedPatient.id);
  const patientTimeline = timeline.filter(t => t.patientId === selectedPatient.id);
  const patientApts = appointments.filter(a => a.patientId === selectedPatient.id);
  const patientFollowups = followups.filter(f => f.patientId === selectedPatient.id);
  const patientBriefings = briefings.filter(b => b.patientId === selectedPatient.id);

  return (
    <div className="space-y-6">
      {/* Patient Directory Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Patient Registry
          </span>
          <div className="flex items-center gap-2 mt-1">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  p.id === selectedPatient.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[11px] opacity-70 font-mono">({p.patientIdentifier})</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors shadow-xs"
        >
          + Upload File for {selectedPatient.name.split(' ')[0]}
        </button>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-teal-50 text-teal-800 border border-teal-200">
                PATIENT RECORD
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {selectedPatient.patientIdentifier}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedPatient.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Care Coordinator: <strong className="text-slate-800">{selectedPatient.careCoordinatorName}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Age / Gender</span>
              <span className="font-semibold text-slate-800">{selectedPatient.age} yrs · {selectedPatient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Date of Birth</span>
              <span className="font-semibold text-slate-800 font-mono">{selectedPatient.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phone Contact</span>
              <span className="font-semibold text-slate-800 font-mono">{selectedPatient.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Center</span>
              <span className="font-semibold text-slate-800 truncate">{selectedPatient.primaryFacility}</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'DOCUMENTS', label: `Documents (${patientDocs.length})` },
            { id: 'TIMELINE', label: `Timeline (${patientTimeline.length})` },
            { id: 'APPOINTMENTS', label: `Appointments (${patientApts.length})` },
            { id: 'FOLLOWUPS', label: `Follow-ups (${patientFollowups.length})` },
            { id: 'BRIEFINGS', label: `Doctor Briefings (${patientBriefings.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-1 ${
                activeProfileTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab Contents */}
        {activeProfileTab === 'OVERVIEW' && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Emergency Contact
                </h3>
                <p className="text-xs text-slate-800 font-medium">{selectedPatient.emergencyContact}</p>
                <div className="pt-2 text-[11px] text-slate-500">
                  Authorized contact for administrative appointment coordination and transport confirmation.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Coordinated Health Registry Summary
                </h3>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>· {patientDocs.length} healthcare documents uploaded and processed.</div>
                  <div>· {patientFacts.filter(f => f.status === 'FACT').length} facts verified with source citations.</div>
                  <div>· {patientFacts.filter(f => f.status === 'MISSING').length} missing administrative items flagged.</div>
                </div>
              </div>
            </div>

            {/* Quick Evidence Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Evidence Highlights
                </h3>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Open Full Evidence Center &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {patientFacts.slice(0, 3).map(fact => (
                  <div
                    key={fact.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <EvidenceBadge status={fact.status} confidence={fact.confidence} />
                        <span className="text-[11px] text-slate-400 font-mono">{fact.sourceDocumentName}</span>
                      </div>
                      <div className="font-medium text-slate-800 truncate">{fact.information}</div>
                    </div>
                    <button
                      onClick={() => openEvidenceModal(fact)}
                      className="px-2.5 py-1 text-xs font-medium text-teal-700 border border-teal-200 rounded bg-teal-50 hover:bg-teal-100 shrink-0"
                    >
                      View Evidence
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeProfileTab === 'DOCUMENTS' && (
          <div className="space-y-3 pt-2">
            {patientDocs.map(doc => (
              <div
                key={doc.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{doc.filename}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Type: {doc.documentType} · Date: {doc.documentDate} · {doc.fileSize}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Manage Document
                </button>
              </div>
            ))}
          </div>
        )}

        {activeProfileTab === 'TIMELINE' && (
          <div className="space-y-2 pt-2">
            {patientTimeline.map(item => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="font-mono text-slate-500">{item.eventDate}</span>
                </div>
                <p className="text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeProfileTab === 'APPOINTMENTS' && (
          <div className="space-y-3 pt-2">
            {patientApts.map(apt => (
              <div key={apt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                  <span className="font-mono text-teal-700 font-semibold">{apt.appointmentDate} at {apt.appointmentTime}</span>
                </div>
                <div className="text-slate-600">{apt.department} · {apt.location}</div>
                {apt.preparationChecklist.potentiallyMissing.length > 0 && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800">
                    Missing record: {apt.preparationChecklist.potentiallyMissing[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeProfileTab === 'FOLLOWUPS' && (
          <div className="space-y-2 pt-2">
            {patientFollowups.map(fol => (
              <div key={fol.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900">{fol.description}</span>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">Due: {fol.followupDate}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {fol.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeProfileTab === 'BRIEFINGS' && (
          <div className="space-y-3 pt-2">
            {patientBriefings.map(b => (
              <div key={b.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Patient Care Briefing #{b.id}</span>
                  <span className="px-2 py-0.5 font-bold rounded bg-teal-50 text-teal-800 border border-teal-200">{b.status}</span>
                </div>
                <p className="text-slate-700 line-clamp-2">{b.patientInformationSummary}</p>
                <button
                  onClick={() => setActiveTab('briefings')}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  View Full Briefing &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
