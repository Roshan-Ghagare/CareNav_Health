/**
 * Core domain types for AI Healthcare Care-Navigation Agent
 * Safety: Strictly administrative and coordination only. Non-diagnostic.
 */

export type UserRole = 'CARE_COORDINATOR' | 'CLINICIAN' | 'PATIENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar?: string;
  organization?: string;
}

export type DocumentType = 
  | 'LAB_REPORT'
  | 'PRESCRIPTION'
  | 'CLINICAL_NOTE'
  | 'APPOINTMENT'
  | 'REFERRAL'
  | 'DISCHARGE'
  | 'OTHER';

export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface DocumentItem {
  id: string;
  patientId: string;
  filename: string;
  documentType: DocumentType;
  uploadDate: string;
  documentDate: string; // Document date if explicitly stated in text
  status: DocumentStatus;
  fileSize: string;
  fileContentText: string;
  pageCount?: number;
  extractedCount?: number;
  tags?: string[];
}

export type EvidenceStatus = 'FACT' | 'UNCERTAIN' | 'MISSING' | 'ASSUMPTION';

export type InformationCategory = 
  | 'PATIENT_INFORMATION'
  | 'APPOINTMENT'
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'CLINICAL_NOTE'
  | 'FOLLOWUP'
  | 'DOCTOR_INFORMATION'
  | 'FACILITY_INFORMATION'
  | 'ADMINISTRATIVE_INFORMATION';

export interface ExtractedFact {
  id: string;
  patientId: string;
  information: string;
  category: InformationCategory;
  status: EvidenceStatus;
  confidence: number; // 0.0 to 1.0
  sourceDocumentId: string;
  sourceDocumentName: string;
  sourceLocation: string; // e.g., "Page 1, Paragraph 2", "Header section"
  evidenceText: string; // Verbatim quote from source document
  documentDate: string;
  requiresHumanReview: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED';
  uncertaintyReason?: string;
  humanReviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  eventDate: string;
  eventType: 'LAB_REPORT' | 'CLINICAL_NOTE' | 'PRESCRIPTION' | 'APPOINTMENT' | 'FOLLOWUP' | 'REFERRAL' | 'ADMINISTRATIVE';
  title: string;
  description: string;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  status: EvidenceStatus;
  confidence: number;
  evidenceText?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  appointmentType: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'UNKNOWN';
  preparationChecklist: {
    availableDocuments: string[];
    potentiallyMissing: string[]; // Administrative wording only: "Referral document not found in records"
    preparationSteps: string[];
  };
}

export interface Followup {
  id: string;
  patientId: string;
  description: string;
  followupDate: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'UNKNOWN';
  assignedTo?: string;
  reminderSent?: boolean;
  notes?: string;
}

export interface DoctorBriefing {
  id: string;
  patientId: string;
  patientName: string;
  generatedAt: string;
  status: 'DRAFT' | 'APPROVED' | 'EDITED' | 'REJECTED';
  patientInformationSummary: string;
  recentTimelineSummary: string;
  availableDocumentsSummary: string[];
  appointmentsSummary: string[];
  documentedFollowupItems: string[];
  missingOrUncertainInformation: string[];
  evidenceReferences: {
    fact: string;
    source: string;
    quote: string;
    status: EvidenceStatus;
  }[];
  aiLimitationsDisclaimer: string;
  reviewedBy?: string;
  reviewedAt?: string;
  clinicianNotes?: string;
}

export interface Patient {
  id: string;
  patientIdentifier: string; // e.g. "P-1001"
  name: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  phone: string;
  emergencyContact: string;
  careCoordinatorName: string;
  primaryFacility: string;
  activeDocumentsCount: number;
  pendingReviewsCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'LOGIN'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_PROCESSED'
    | 'INFORMATION_EXTRACTED'
    | 'INFORMATION_EDITED'
    | 'INFORMATION_APPROVED'
    | 'INFORMATION_REJECTED'
    | 'BRIEFING_GENERATED'
    | 'BRIEFING_APPROVED'
    | 'BRIEFING_EDITED'
    | 'BRIEFING_REJECTED'
    | 'APPOINTMENT_COORDINATED'
    | 'FOLLOWUP_UPDATED';
  entity: string;
  entityId: string;
  details: string;
}

export interface AgentStepProgress {
  step: 'DOCUMENT' | 'EXTRACTION' | 'EVIDENCE' | 'TIMELINE' | 'APPOINTMENT' | 'FOLLOWUP' | 'BRIEFING';
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  summary?: string;
}
