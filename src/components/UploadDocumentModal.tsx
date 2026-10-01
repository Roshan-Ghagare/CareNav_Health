import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentType } from '../types';
import { Upload, X, FileText, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DOCUMENTS = [
  {
    name: 'lab_report_metabolic_followup.pdf',
    type: 'LAB_REPORT' as DocumentType,
    label: 'Sample: Fasting Metabolic Lab Report',
    content: `METRO PATHOLOGY & DIAGNOSTIC LABORATORIES
Specimen ID: LAB-2026-1002-99
Patient Name: Aarav Sharma | DOB: 14-Jun-1984 | ID: P-1001
Ordering Physician: Dr. Sarah Lin, MD
Collection Date: 02 October 2026, 07:45 AM
Report Status: Final Verified

METABOLIC & LIPID PANEL:
Fasting Blood Glucose: 104 mg/dL (Reference: 70-99 mg/dL) [Flag: High]
Hemoglobin A1c: 5.8% (Reference: 4.0-5.6%) [Flag: Elevated]
Total Cholesterol: 192 mg/dL (Reference: <200 mg/dL) [Desirable]
HDL Cholesterol: 48 mg/dL (Reference: >40 mg/dL) [Normal]
LDL Cholesterol: 112 mg/dL (Reference: <100 mg/dL) [Borderline]
Serum Potassium: 4.2 mEq/L (Reference: 3.5-5.0 mEq/L) [Normal]

Administrative Instructions:
Bring printed results to upcoming Cardiology specialty consultation on 15 October 2026.`
  },
  {
    name: 'referral_authorization_cardiology.pdf',
    type: 'REFERRAL' as DocumentType,
    label: 'Sample: Signed Cardiology Referral Slip',
    content: `METRO HEALTH AMBULATORY NETWORK
SPECIALTY REFERRAL AUTHORIZATION SLIP
Date of Referral: 28 September 2026
Patient: Aarav Sharma (P-1001) | DOB: 14-Jun-1984
Referring Physician: Dr. Sarah Lin, MD (Internal Medicine)
Referred To: Dr. Robert Harrison, MD, Division of Cardiovascular Medicine
Reason for Referral: Baseline cardiovascular outpatient evaluation and rhythm assessment.
Authorization Code: REF-AUTH-9042-CARD
Expiration Date: 28 December 2026

Administrative Check: Referral authorization verified and signed electronically by Dr. Lin.`
  },
  {
    name: 'discharge_summary_ambulatory.txt',
    type: 'DISCHARGE' as DocumentType,
    label: 'Sample: Ambulatory Observation Summary',
    content: `AMBULATORY OBSERVATION & PROCEDURE DISCHARGE
Date: 25 September 2026
Patient: Aarav Sharma (P-1001)
Facility: Metro Day Pavilion

SUMMARY OF OBSERVATION:
Patient completed outpatient stress test and baseline echocardiogram.
Vital signs at discharge: BP 122/80 mmHg, HR 68 bpm.

POST-VISIT ADMINISTRATIVE INSTRUCTIONS:
1. Continue home medication regimen without alteration.
2. Review final imaging report with Dr. Harrison during scheduled 15 October consultation.
3. Bring insurance authorization card.`
  }
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const { uploadDocument, selectedPatient } = useApp();
  const [filename, setFilename] = useState('');
  const [docType, setDocType] = useState<DocumentType>('LAB_REPORT');
  const [fileContent, setFileContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    setFilename(sample.name);
    setDocType(sample.type);
    setFileContent(sample.content);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFilename(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string || `Uploaded document contents for ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim() || !fileContent.trim()) return;

    setIsSubmitting(true);
    try {
      await uploadDocument(filename, fileContent, docType);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Upload Healthcare Document</h3>
              <p className="text-xs text-slate-500">
                Target Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.patientIdentifier})
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
          {/* Quick presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Quick-Load Sample Documents (Demo Accelerator)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SAMPLE_DOCUMENTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-2.5 text-left border border-slate-200 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition-colors text-xs"
                >
                  <div className="font-semibold text-slate-800 truncate">{sample.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{sample.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & drop upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
              dragActive ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 bg-slate-50/50'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">
              Drag & drop document here, or choose a file
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, PNG, JPG, JPEG, TXT (Synthetic patient files only)
            </p>
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setFilename(file.name);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFileContent(event.target?.result as string || `Uploaded text from ${file.name}`);
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <label
              htmlFor="file-upload-input"
              className="mt-3 inline-block px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              Browse Local Files
            </label>
          </div>

          {/* Document metadata fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Document Filename *
              </label>
              <input
                type="text"
                required
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. lab_report_october.pdf"
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Document Classification
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="LAB_REPORT">LAB_REPORT (Laboratory Panel)</option>
                <option value="PRESCRIPTION">PRESCRIPTION (Medication Order)</option>
                <option value="CLINICAL_NOTE">CLINICAL_NOTE (Encounter Note)</option>
                <option value="APPOINTMENT">APPOINTMENT (Booking / Confirmation)</option>
                <option value="REFERRAL">REFERRAL (Specialist Authorization)</option>
                <option value="DISCHARGE">DISCHARGE (Observation / Facility)</option>
                <option value="OTHER">OTHER (Administrative Record)</option>
              </select>
            </div>
          </div>

          {/* Document Content */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Text / Extracted Content *
            </label>
            <textarea
              required
              rows={5}
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Paste or review document text for evidence extraction..."
              className="w-full text-xs p-3 border border-slate-300 rounded font-mono leading-relaxed focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Document Agent will automatically trigger on submission.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !filename.trim() || !fileContent.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmitting ? 'Uploading & Processing...' : 'Upload & Process with Agents'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
