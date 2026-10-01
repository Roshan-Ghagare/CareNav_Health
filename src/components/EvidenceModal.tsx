import React, { useState } from 'react';
import { ExtractedFact } from '../types';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from './EvidenceBadge';
import { X, FileText, Check, AlertTriangle, Edit3, ShieldAlert, ArrowRight, CornerDownRight } from 'lucide-react';

interface EvidenceModalProps {
  fact: ExtractedFact | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ fact, onClose }) => {
  const { documents, approveFact, rejectFact, editFact, currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(fact?.information || '');
  const [editedStatus, setEditedStatus] = useState(fact?.status || 'FACT');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showFullDoc, setShowFullDoc] = useState(false);

  if (!fact) return null;

  const sourceDoc = documents.find(d => d.id === fact.sourceDocumentId);

  const handleApprove = () => {
    approveFact(fact.id, reviewNotes);
    onClose();
  };

  const handleReject = () => {
    rejectFact(fact.id, reviewNotes || 'Rejected by clinical reviewer');
    onClose();
  };

  const handleSaveEdit = () => {
    editFact(fact.id, editedText, editedStatus, reviewNotes);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">Evidence Verification Trace</h3>
                <span className="text-xs text-slate-500 font-mono">ID: {fact.id}</span>
              </div>
              <p className="text-xs text-slate-500">Every AI-generated claim is grounded in source documentation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Fact Statement Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Extracted Information Item
              </span>
              <div className="flex items-center gap-2">
                <EvidenceBadge status={fact.status} confidence={fact.confidence} />
                <span className="text-xs text-slate-500">
                  Category: <strong className="text-slate-700">{fact.category.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-700">Classification Status:</label>
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as any)}
                    className="text-xs p-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="FACT">FACT</option>
                    <option value="UNCERTAIN">UNCERTAIN</option>
                    <option value="MISSING">MISSING</option>
                    <option value="ASSUMPTION">ASSUMPTION</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                "{fact.information}"
              </p>
            )}

            {fact.uncertaintyReason && (
              <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Uncertainty Reason: </span>
                  {fact.uncertaintyReason}
                </div>
              </div>
            )}
          </div>

          {/* Source Document Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Source Document</span>
              <span className="font-semibold text-slate-800 break-all">{fact.sourceDocumentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Document Date</span>
              <span className="font-semibold text-slate-800 font-mono">{fact.documentDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Source Location</span>
              <span className="font-semibold text-slate-800">{fact.sourceLocation}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Extraction Confidence</span>
              <span className="font-semibold text-teal-700 font-mono tabular-nums">
                {Math.round(fact.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Verbatim Supporting Evidence Text Highlight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CornerDownRight className="w-4 h-4 text-teal-600" />
                Verbatim Evidence in Source Document
              </label>
              <button
                type="button"
                onClick={() => setShowFullDoc(!showFullDoc)}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium"
              >
                {showFullDoc ? 'Hide Full Document' : 'View Full Document'}
              </button>
            </div>

            <div className="relative p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
              <div className="text-[11px] text-teal-400 font-sans uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Exact Supporting Excerpt:</span>
                <span className="text-slate-400 lowercase">grounded source snippet</span>
              </div>
              <blockquote className="border-l-2 border-teal-500 pl-3 py-1 bg-teal-950/40 text-teal-100 rounded-r">
                {fact.evidenceText || 'No verbatim excerpt recorded.'}
              </blockquote>
            </div>

            {/* Optional Full Document View */}
            {showFullDoc && sourceDoc && (
              <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-300 max-h-60 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-700 mb-2">Full Document Content: {sourceDoc.filename}</div>
                <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed bg-white p-3 rounded border border-slate-200">
                  {sourceDoc.fileContentText}
                </pre>
              </div>
            )}
          </div>

          {/* Review Status & Notes */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Review Status: <strong className={fact.reviewStatus === 'APPROVED' ? 'text-teal-700' : fact.reviewStatus === 'REJECTED' ? 'text-rose-700' : 'text-amber-700'}>{fact.reviewStatus}</strong>
              </span>
              {fact.reviewedBy && (
                <span className="text-slate-500">
                  Reviewed by <strong className="text-slate-700">{fact.reviewedBy}</strong> at {fact.reviewedAt}
                </span>
              )}
            </div>

            {(currentUser.role === 'CLINICIAN' || currentUser.role === 'CARE_COORDINATOR' || currentUser.role === 'ADMIN') && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add reviewer notes or clinical annotations..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Human-in-the-Loop review active</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-teal-700 rounded hover:bg-teal-800"
                >
                  Save Modifications
                </button>
              </>
            ) : (
              <>
                {(currentUser.role === 'CLINICIAN' || currentUser.role === 'CARE_COORDINATOR') && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-teal-700 rounded hover:bg-teal-800 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Evidence
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
