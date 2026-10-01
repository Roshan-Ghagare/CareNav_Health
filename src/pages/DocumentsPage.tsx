import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DocumentType } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import {
  FileText,
  Search,
  Filter,
  Play,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  Download
} from 'lucide-react';

interface DocumentsPageProps {
  onOpenUpload: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenUpload }) => {
  const {
    documents,
    selectedPatient,
    runAgentsOnDocument,
    isProcessingAgents,
    deleteDocument,
    facts,
    openEvidenceModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  const patientDocs = documents.filter(d => d.patientId === selectedPatient.id);

  const filteredDocs = patientDocs.filter(doc => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileContentText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'LAB_REPORT':
        return <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LAB REPORT</span>;
      case 'CLINICAL_NOTE':
        return <span className="text-[11px] font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">CLINICAL NOTE</span>;
      case 'PRESCRIPTION':
        return <span className="text-[11px] font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">PRESCRIPTION</span>;
      case 'APPOINTMENT':
        return <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">APPOINTMENT</span>;
      case 'REFERRAL':
        return <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">REFERRAL</span>;
      case 'DISCHARGE':
        return <span className="text-[11px] font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">DISCHARGE</span>;
      default:
        return <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">OTHER</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Documents Registry</span>
            <span aria-hidden="true">·</span>
            <span>{selectedPatient.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{patientDocs.length} Total Records</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Uploaded Healthcare Documents
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Document Agent extracts metadata, confirms dates, and passes structured records to Extraction Agent.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          + Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'LAB_REPORT', 'CLINICAL_NOTE', 'PRESCRIPTION', 'APPOINTMENT', 'REFERRAL'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Document Date</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">AI Status</th>
                <th className="py-3 px-4">Extracted Facts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.map(doc => {
                const docFacts = facts.filter(f => f.sourceDocumentId === doc.id);

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded text-slate-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{doc.filename}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {doc.fileSize} · {doc.pageCount || 1} pages
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getDocTypeBadge(doc.documentType)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {doc.documentDate || 'Not explicitly stated'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      {doc.uploadDate}
                    </td>
                    <td className="py-3 px-4">
                      {doc.status === 'PROCESSED' && (
                        <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Processed
                        </span>
                      )}
                      {doc.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" /> Processing...
                        </span>
                      )}
                      {doc.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Pending Agent
                        </span>
                      )}
                      {doc.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="text-xs font-semibold text-teal-700 hover:underline font-mono tabular-nums"
                      >
                        {docFacts.length} Facts Linked
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDocForPreview(doc)}
                          title="Preview Text & Facts"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => runAgentsOnDocument(doc.id)}
                          disabled={isProcessingAgents}
                          title="Re-run AI Agent Pipeline"
                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          title="Remove Document"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No documents match your query or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Content & Extracted Facts Drawer/Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {selectedDocForPreview.filename}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Explicit Document Date: <strong className="font-mono text-slate-800">{selectedDocForPreview.documentDate || 'N/A'}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="text-xs px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Linked Facts */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Extracted Evidence Facts from this Document
                </h4>
                <div className="space-y-2">
                  {facts.filter(f => f.sourceDocumentId === selectedDocForPreview.id).map(f => (
                    <div
                      key={f.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <EvidenceBadge status={f.status} confidence={f.confidence} />
                          <span className="text-[11px] text-slate-500">{f.sourceLocation}</span>
                        </div>
                        <div className="font-medium text-slate-800">{f.information}</div>
                      </div>
                      <button
                        onClick={() => openEvidenceModal(f)}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-white border border-teal-200 rounded hover:bg-teal-50 shrink-0"
                      >
                        Inspect Evidence
                      </button>
                    </div>
                  ))}
                  {facts.filter(f => f.sourceDocumentId === selectedDocForPreview.id).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded">
                      No facts extracted yet. Run the agent pipeline to process this file.
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Document Text */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Original Document Text Content
                </h4>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {selectedDocForPreview.fileContentText}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
