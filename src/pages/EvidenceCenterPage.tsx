import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { EvidenceStatus, InformationCategory } from '../types';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Edit3
} from 'lucide-react';

export const EvidenceCenterPage: React.FC = () => {
  const { facts, selectedPatient, openEvidenceModal, approveFact, rejectFact, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const patientFacts = facts.filter(f => f.patientId === selectedPatient.id);

  const filteredFacts = patientFacts.filter(fact => {
    const matchesSearch =
      fact.information.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.evidenceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.sourceDocumentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || fact.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || fact.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const factCounts = {
    all: patientFacts.length,
    fact: patientFacts.filter(f => f.status === 'FACT').length,
    uncertain: patientFacts.filter(f => f.status === 'UNCERTAIN').length,
    missing: patientFacts.filter(f => f.status === 'MISSING').length,
    assumption: patientFacts.filter(f => f.status === 'ASSUMPTION').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Core Innovation</span>
              <span aria-hidden="true">·</span>
              <span>Evidence & Uncertainty Engine</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedPatient.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Evidence Center & Uncertainty Audit
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Every extracted claim is classified into FACT, UNCERTAIN, MISSING, or ASSUMPTION with direct verbatim document citation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Reviewer: <strong>{currentUser.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Evidence Status */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Claims ({factCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('FACT')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
            statusFilter === 'FACT'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
          FACT ({factCounts.fact})
        </button>
        <button
          onClick={() => setStatusFilter('UNCERTAIN')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
            statusFilter === 'UNCERTAIN'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          UNCERTAIN ({factCounts.uncertain})
        </button>
        <button
          onClick={() => setStatusFilter('MISSING')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
            statusFilter === 'MISSING'
              ? 'bg-white text-rose-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          MISSING ({factCounts.missing})
        </button>
        <button
          onClick={() => setStatusFilter('ASSUMPTION')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
            statusFilter === 'ASSUMPTION'
              ? 'bg-white text-indigo-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          ASSUMPTION ({factCounts.assumption})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search extracted facts, verbatim citations, or documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
        />
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-4">
        {filteredFacts.map(fact => {
          return (
            <div
              key={fact.id}
              className={`p-5 bg-white rounded-xl border transition-shadow shadow-xs hover:shadow-md ${
                fact.status === 'MISSING'
                  ? 'border-rose-200 bg-rose-50/20'
                  : fact.status === 'UNCERTAIN'
                  ? 'border-amber-200 bg-amber-50/20'
                  : fact.status === 'ASSUMPTION'
                  ? 'border-indigo-200 bg-indigo-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Fact Core Information */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EvidenceBadge status={fact.status} confidence={fact.confidence} />
                    <span className="text-xs text-slate-500">
                      Category: <strong className="text-slate-800">{fact.category.replace('_', ' ')}</strong>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      Doc Date: {fact.documentDate || 'Unspecified'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      fact.reviewStatus === 'APPROVED' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                      fact.reviewStatus === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {fact.reviewStatus}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {fact.information}
                  </h3>

                  {fact.uncertaintyReason && (
                    <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-semibold">Uncertainty Flag: </span>
                      {fact.uncertaintyReason}
                    </div>
                  )}

                  {/* Supporting Source Citation */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">Source: {fact.sourceDocumentName}</span>
                      <span>Location: {fact.sourceLocation}</span>
                    </div>
                    <div className="font-mono text-slate-800 text-[11px] bg-white p-2 rounded border border-slate-200">
                      <span className="text-teal-700 font-sans font-semibold mr-1">Evidence Text:</span>
                      "{fact.evidenceText}"
                    </div>
                  </div>
                </div>

                {/* Actions & Verification */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0">
                  <button
                    onClick={() => openEvidenceModal(fact)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-300 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Evidence
                  </button>

                  {(currentUser.role === 'CARE_COORDINATOR' || currentUser.role === 'CLINICIAN') && fact.reviewStatus === 'PENDING' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => approveFact(fact.id)}
                        title="Approve Fact"
                        className="px-2.5 py-1 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectFact(fact.id)}
                        title="Reject Fact"
                        className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}

                  {fact.reviewedBy && (
                    <span className="text-[11px] text-slate-400">
                      Verified by {fact.reviewedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFacts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No evidence facts found matching the current search and status filters.
          </div>
        )}
      </div>
    </div>
  );
};
