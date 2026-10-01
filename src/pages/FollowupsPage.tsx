import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Followup } from '../types';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  Check,
  Calendar,
  FileText,
  Filter
} from 'lucide-react';

export const FollowupsPage: React.FC = () => {
  const { followups, selectedPatient, updateFollowupStatus, openEvidenceModal, facts } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const patientFollowups = followups.filter(f => f.patientId === selectedPatient.id);

  const filtered = patientFollowups.filter(f => {
    if (filter === 'ALL') return true;
    return f.status === filter;
  });

  const handleOpenSourceEvidence = (sourceDocId: string) => {
    const fact = facts.find(f => f.sourceDocumentId === sourceDocId) || facts[0];
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
              <span>Follow-up Agent</span>
              <span aria-hidden="true">·</span>
              <span>Documented Administrative Tasks</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Administrative Follow-up Tracking
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Tracking explicitly documented follow-ups, medication synchronization dates, and records retrieval deadlines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({patientFollowups.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'PENDING' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending ({patientFollowups.filter(f => f.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'COMPLETED' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Completed ({patientFollowups.filter(f => f.status === 'COMPLETED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const isPending = item.status === 'PENDING';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id}
              className={`p-5 bg-white rounded-xl border transition-colors shadow-xs ${
                isCompleted ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                        isCompleted
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due by: <strong className="text-slate-800">{item.followupDate}</strong>
                    </span>
                    {item.assignedTo && (
                      <span className="text-xs text-slate-500">
                        · Assigned: <strong className="text-slate-700">{item.assignedTo}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {item.description}
                  </h3>

                  {item.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                      {item.notes}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Source Doc: {item.sourceDocumentName}</span>
                    <button
                      onClick={() => handleOpenSourceEvidence(item.sourceDocumentId)}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      View Source Evidence
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <button
                      onClick={() => updateFollowupStatus(item.id, 'COMPLETED')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => updateFollowupStatus(item.id, 'PENDING')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                    >
                      Reopen Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No follow-up items found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
};
