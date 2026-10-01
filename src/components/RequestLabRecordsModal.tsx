import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FileSearch, Building2, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RequestLabRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (details: string) => void;
}

const RECORD_PRESETS = [
  { label: 'Fasting Metabolic & Lipid Panel', value: 'Comprehensive Metabolic Panel & Fasting Lipid Profile' },
  { label: 'Cardiology Referral Authorization', value: 'Signed Specialist Referral Authorization Slip' },
  { label: 'Baseline Electrocardiogram (ECG)', value: '12-Lead Electrocardiogram (ECG) Tracing & Report' },
  { label: 'Outpatient Clinical Encounter Notes', value: 'Recent Outpatient Encounters & Vitals Log' },
  { label: 'Discharge Summary & Imaging', value: 'Ambulatory Discharge Summary & Imaging Disc' }
];

const FACILITY_OPTIONS = [
  'Metro Pathology & Diagnostic Laboratories',
  'St. Jude Academic Medical Center - Central Records',
  'Quest Diagnostics Regional Center',
  'Metro Health Ambulatory Pavilion Archives',
  'Downtown Cardiovascular Diagnostic Center'
];

export const RequestLabRecordsModal: React.FC<RequestLabRecordsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { selectedPatient, currentUser, requestLabRecords } = useApp();

  const [facility, setFacility] = useState(FACILITY_OPTIONS[0]);
  const [recordType, setRecordType] = useState(RECORD_PRESETS[0].value);
  const [targetDate, setTargetDate] = useState('2026-10-08');
  const [urgency, setUrgency] = useState<'Standard (5-7 days)' | 'Urgent (24-48 hours)'>('Standard (5-7 days)');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility || !recordType) return;

    requestLabRecords(
      facility,
      recordType,
      targetDate,
      `Urgency: ${urgency}. ${notes.trim() ? `Coordinator Note: ${notes.trim()}` : ''}`
    );

    if (onSuccess) {
      onSuccess(`Record request dispatched to ${facility} for ${recordType}.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Diagnostic / Lab Records</h3>
              <p className="text-xs text-slate-500">
                Initiating records request for <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.patientIdentifier})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Facility */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Source Facility / Archive Desk *
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {FACILITY_OPTIONS.map((f, idx) => (
                <option key={idx} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Record Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Select Requested Document Type *
            </label>
            <div className="space-y-1.5">
              {RECORD_PRESETS.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                    recordType === item.value
                      ? 'bg-teal-50/60 border-teal-400 text-teal-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="recordTypeSelection"
                    checked={recordType === item.value}
                    onChange={() => setRecordType(item.value)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deadline & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Requested Return Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fulfillment Protocol
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Standard (5-7 days)">Standard (5-7 days)</option>
                <option value="Urgent (24-48 hours)">Urgent (24-48 hours)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Transmission / Special Archive Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Request electronic PDF transmission to coordinator fax/portal..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Notice */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Request initiates an administrative tracking item in Follow-ups and logs an event in the audit trail.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Dispatch Record Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
