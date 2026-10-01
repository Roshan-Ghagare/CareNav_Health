import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { ExtractedFact } from '../types';
import {
  CheckSquare,
  Check,
  X,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const HumanReviewQueuePage: React.FC = () => {
  const { facts, approveFact, rejectFact, editFact, openEvidenceModal, currentUser } = useApp();
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [notes, setNotes] = useState<{ [id: string]: string }>({});

  const filteredFacts = facts.filter(f => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return f.requiresHumanReview && f.reviewStatus === 'PENDING';
    return f.reviewStatus === filter;
  });

  const handleApprove = (fact: ExtractedFact) => {
    approveFact(fact.id, notes[fact.id]);
  };

  const handleReject = (fact: ExtractedFact) => {
    rejectFact(fact.id, notes[fact.id] || 'Rejected in human review');
  };

  const handleStartEdit = (fact: ExtractedFact) => {
    setEditingFactId(fact.id);
    setEditText(fact.information);
  };

  const handleSaveEdit = (fact: ExtractedFact) => {
    editFact(fact.id, editText, fact.status, notes[fact.id]);
    setEditingFactId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Safety Governance</span>
              <span aria-hidden="true">·</span>
              <span>Human-in-the-Loop Protocol</span>
              <span aria-hidden="true">·</span>
              <span>Active Reviewer: {currentUser.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Human Review & Verification Queue
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Strict human authorization required for uncertain, ambiguous, or missing administrative documents.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'PENDING' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending ({facts.filter(f => f.requiresHumanReview && f.reviewStatus === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'APPROVED' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Approved ({facts.filter(f => f.reviewStatus === 'APPROVED').length})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Items ({facts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-4">
        {filteredFacts.map(fact => (
          <div
            key={fact.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EvidenceBadge status={fact.status} confidence={fact.confidence} />
                <span className="text-xs text-slate-500 font-mono">ID: {fact.id}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600">{fact.category.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    fact.reviewStatus === 'APPROVED'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : fact.reviewStatus === 'REJECTED'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {fact.reviewStatus}
                </span>
                <button
                  onClick={() => openEvidenceModal(fact)}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Evidence
                </button>
              </div>
            </div>

            {/* Content or Edit Field */}
            {editingFactId === fact.id ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-teal-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(fact)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-teal-700 rounded"
                  >
                    Save & Approve
                  </button>
                  <button
                    onClick={() => setEditingFactId(null)}
                    className="px-3 py-1 text-xs text-slate-600 bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-900 leading-relaxed">
                "{fact.information}"
              </p>
            )}

            {fact.uncertaintyReason && (
              <div className="p-2.5 bg-amber-50 rounded text-xs text-amber-900 border border-amber-200">
                <span className="font-semibold">Review Alert Reason: </span>
                {fact.uncertaintyReason}
              </div>
            )}

            {/* Verbatim quote snippet */}
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-700">
              <span className="text-[11px] text-slate-400 font-sans block mb-1">
                Source Document: {fact.sourceDocumentName} ({fact.sourceLocation})
              </span>
              "{fact.evidenceText}"
            </div>

            {/* Actions Bar */}
            {fact.reviewStatus === 'PENDING' && (
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional review annotation..."
                  value={notes[fact.id] || ''}
                  onChange={(e) => setNotes({ ...notes, [fact.id]: e.target.value })}
                  className="w-full sm:w-80 text-xs p-1.5 border border-slate-200 rounded focus:outline-none"
                />
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleStartEdit(fact)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleReject(fact)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(fact)}
                    className="px-3.5 py-1 text-xs font-semibold text-white bg-teal-700 rounded hover:bg-teal-800 flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Fact
                  </button>
                </div>
              </div>
            )}

            {fact.reviewedBy && (
              <div className="text-[11px] text-slate-400">
                Action recorded by <strong>{fact.reviewedBy}</strong> at {fact.reviewedAt}. {fact.humanReviewNotes && `Annotation: "${fact.humanReviewNotes}"`}
              </div>
            )}
          </div>
        ))}

        {filteredFacts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No items pending in the human review queue.
          </div>
        )}
      </div>
    </div>
  );
};
