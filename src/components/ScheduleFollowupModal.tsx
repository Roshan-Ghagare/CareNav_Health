import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CalendarPlus, Check, Clock, User, AlertCircle } from 'lucide-react';

interface ScheduleFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_PRESETS = [
  'Coordinate pharmacy refill synchronization before deadline',
  'Retrieve signed specialist referral authorization letter',
  'Schedule routine 3-month follow-up fasting metabolic panel',
  'Confirm patient transportation assistance for outpatient visit',
  'Verify outside electrocardiogram (ECG) report transmission'
];

export const ScheduleFollowupModal: React.FC<ScheduleFollowupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { selectedPatient, currentUser, addFollowup } = useApp();

  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-14');
  const [assignedTo, setAssignedTo] = useState(currentUser.name);
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'ROUTINE' | 'PRIORITY' | 'EXPEDITED'>('ROUTINE');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !dueDate) return;

    addFollowup({
      patientId: selectedPatient.id,
      description: description.trim(),
      followupDate: dueDate,
      sourceDocumentId: 'manual-task',
      sourceDocumentName: 'Care Coordinator Action',
      status: 'PENDING',
      assignedTo,
      notes: notes.trim() ? `[${urgency}] ${notes.trim()}` : `[${urgency}] Scheduled by ${currentUser.name}`
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Administrative Follow-up</h3>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.patientIdentifier})
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
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Quick Administrative Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDescription(preset)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 rounded border border-slate-200 text-left transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Task Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Coordinate pharmacy refill synchronization for Metformin..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Target Due Date & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Coordination Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="ROUTINE">Routine (Standard Protocol)</option>
                <option value="PRIORITY">Priority (Action Required Soon)</option>
                <option value="EXPEDITED">Expedited (Required for Next Visit)</option>
              </select>
            </div>
          </div>

          {/* Assignee & Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned Coordinator / Owner
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Administrative Notes & Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verify patient ID card and contact clinic coordinator beforehand..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Regulatory Scope Reminder */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Follow-ups are logged to the patient care registry and auditable under institutional compliance rules. Strictly administrative.
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
              disabled={!description.trim() || !dueDate}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              Schedule Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
