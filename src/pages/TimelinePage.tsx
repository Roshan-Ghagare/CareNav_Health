import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { TimelineEvent } from '../types';
import {
  Clock,
  Filter,
  FileText,
  Calendar,
  Pill,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { timeline, selectedPatient, facts, openEvidenceModal } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  const patientEvents = timeline.filter(e => e.patientId === selectedPatient.id);

  // Sort chronologically descending (newest first)
  const sortedEvents = [...patientEvents].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  const filteredEvents = sortedEvents.filter(e => {
    if (filterType === 'ALL') return true;
    if (filterType === 'REPORTS') return e.eventType === 'LAB_REPORT';
    if (filterType === 'APPOINTMENTS') return e.eventType === 'APPOINTMENT';
    if (filterType === 'PRESCRIPTIONS') return e.eventType === 'PRESCRIPTION';
    if (filterType === 'CLINICAL_NOTES') return e.eventType === 'CLINICAL_NOTE';
    if (filterType === 'FOLLOWUPS') return e.eventType === 'FOLLOWUP';
    return true;
  });

  const getEventIcon = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'LAB_REPORT':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'PRESCRIPTION':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'CLINICAL_NOTE':
        return <FileText className="w-4 h-4 text-sky-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleOpenSourceEvidence = (event: TimelineEvent) => {
    const matchedFact = facts.find(f => f.sourceDocumentId === event.sourceDocumentId) || facts[0];
    if (matchedFact) {
      openEvidenceModal(matchedFact);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Timeline Agent</span>
              <span aria-hidden="true">·</span>
              <span>Chronological Care History</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Patient Care Timeline
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Chronologically ordered milestones synthesized from verified source healthcare documents.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'REPORTS', label: 'Reports' },
              { id: 'APPOINTMENTS', label: 'Appointments' },
              { id: 'PRESCRIPTIONS', label: 'Prescriptions' },
              { id: 'CLINICAL_NOTES', label: 'Clinical Notes' },
              { id: 'FOLLOWUPS', label: 'Follow-ups' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline View */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-32 space-y-8 py-2">
          {filteredEvents.map(event => (
            <div key={event.id} className="relative pl-6 md:pl-8 group">
              {/* Date on the left for medium+ screens */}
              <div className="md:absolute md:-left-36 md:top-1.5 md:w-28 text-left md:text-right">
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {event.eventDate}
                </span>
                <span className="text-[11px] text-slate-400 block">Documented date</span>
              </div>

              {/* Timeline marker node */}
              <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-xs">
                <div className="w-2 h-2 rounded-full bg-teal-600"></div>
              </div>

              {/* Event Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      {getEventIcon(event.eventType)}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {event.eventType.replace('_', ' ')}
                    </span>
                    <EvidenceBadge status={event.status} confidence={event.confidence} />
                  </div>

                  {event.sourceDocumentName && (
                    <button
                      onClick={() => handleOpenSourceEvidence(event)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Source Evidence
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900">{event.title}</h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{event.description}</p>

                {event.sourceDocumentName && (
                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Source: {event.sourceDocumentName}</span>
                    <span>Confidence: {Math.round(event.confidence * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No timeline events recorded for this category filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
