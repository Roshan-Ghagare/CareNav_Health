import {
  Patient,
  DocumentItem,
  ExtractedFact,
  TimelineEvent,
  Appointment,
  Followup,
  DoctorBriefing,
  AuditLog,
  User
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Maya Patel, RN',
    email: 'coordinator@carenav.health',
    role: 'CARE_COORDINATOR',
    title: 'Senior Clinical Care Coordinator',
    organization: 'Metro Health Alliance'
  },
  {
    id: 'usr-2',
    name: 'Dr. Sarah Lin, MD',
    email: 'clinician@carenav.health',
    role: 'CLINICIAN',
    title: 'Attending Physician, Internal Medicine',
    organization: 'St. Jude Academic Medical Center'
  },
  {
    id: 'usr-3',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@demo.patient',
    role: 'PATIENT',
    title: 'Patient (Self-Access Portal)',
    organization: 'Patient Portal'
  },
  {
    id: 'usr-4',
    name: 'David Foster',
    email: 'admin@carenav.health',
    role: 'ADMIN',
    title: 'Lead Health Systems Administrator',
    organization: 'Metro Health Alliance'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1001',
    patientIdentifier: 'P-1001',
    name: 'Aarav Sharma',
    age: 42,
    gender: 'Male',
    dateOfBirth: '1984-06-14',
    phone: '+1 (555) 234-8901',
    emergencyContact: 'Sunita Sharma (Spouse) - +1 (555) 234-8902',
    careCoordinatorName: 'Maya Patel, RN',
    primaryFacility: 'Metro Health Ambulatory Pavilion',
    activeDocumentsCount: 4,
    pendingReviewsCount: 2
  },
  {
    id: 'pat-1002',
    patientIdentifier: 'P-1002',
    name: 'Eleanor Vance',
    age: 68,
    gender: 'Female',
    dateOfBirth: '1958-03-22',
    phone: '+1 (555) 872-3310',
    emergencyContact: 'Thomas Vance (Son) - +1 (555) 872-3311',
    careCoordinatorName: 'Maya Patel, RN',
    primaryFacility: 'Northwest Geriatric & Wellness Center',
    activeDocumentsCount: 3,
    pendingReviewsCount: 1
  },
  {
    id: 'pat-1003',
    patientIdentifier: 'P-1003',
    name: 'Marcus Chen',
    age: 35,
    gender: 'Male',
    dateOfBirth: '1991-11-05',
    phone: '+1 (555) 412-9904',
    emergencyContact: 'Linda Chen (Sister) - +1 (555) 412-9908',
    careCoordinatorName: 'Maya Patel, RN',
    primaryFacility: 'Downtown Specialty Care Center',
    activeDocumentsCount: 2,
    pendingReviewsCount: 0
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-101',
    patientId: 'pat-1001',
    filename: 'lab_report_metabolic_panel.pdf',
    documentType: 'LAB_REPORT',
    uploadDate: '2026-09-10',
    documentDate: '2026-09-10',
    status: 'PROCESSED',
    fileSize: '420 KB',
    pageCount: 2,
    extractedCount: 5,
    tags: ['Biochemistry', 'Metabolic', 'Routine'],
    fileContentText: `METRO PATHOLOGY & DIAGNOSTIC LABORATORIES
Specimen ID: LAB-2026-0910-88
Patient Name: Aarav Sharma | DOB: 14-Jun-1984 | ID: P-1001
Ordering Physician: Dr. Sarah Lin, MD
Collection Date: 10 September 2026, 08:30 AM
Report Status: Final Verified

COMPREHENSIVE METABOLIC PANEL
Fasting Blood Glucose: 108 mg/dL (Reference Range: 70-99 mg/dL) [Flag: High]
Hemoglobin A1c: 5.9% (Reference Range: 4.0 - 5.6%) [Flag: Elevated / Pre-diabetes range]
Serum Creatinine: 0.95 mg/dL (Reference Range: 0.70 - 1.30 mg/dL) [Normal]
eGFR: >90 mL/min/1.73m2 [Normal renal filtration]
Blood Urea Nitrogen (BUN): 16 mg/dL (Reference Range: 7 - 20 mg/dL) [Normal]
Total Cholesterol: 198 mg/dL (Reference Range: <200 mg/dL) [Desirable]
Triglycerides: 165 mg/dL (Reference Range: <150 mg/dL) [Borderline High]
Alanine Aminotransferase (ALT): 28 U/L (Reference Range: 7 - 56 U/L) [Normal]
Aspartate Aminotransferase (AST): 24 U/L (Reference Range: 10 - 40 U/L) [Normal]

Administrative Note: Follow-up fasting glucose panel recommended in 3 months per clinic protocol. Bring printed panel copy to next scheduled outpatient consultation.`
  },
  {
    id: 'doc-102',
    patientId: 'pat-1001',
    filename: 'clinical_note_internal_medicine.pdf',
    documentType: 'CLINICAL_NOTE',
    uploadDate: '2026-09-12',
    documentDate: '2026-09-12',
    status: 'PROCESSED',
    fileSize: '310 KB',
    pageCount: 2,
    extractedCount: 6,
    tags: ['Internal Medicine', 'Consultation', 'Dr. Lin'],
    fileContentText: `ST. JUDE ACADEMIC MEDICAL CENTER
DEPARTMENT OF INTERNAL MEDICINE - OUTPATIENT CLINIC
Encounter Date: 12 September 2026
Patient: Aarav Sharma | MRN: P-1001 | Age: 42
Attending Physician: Dr. Sarah Lin, MD

CHIEF CONCERN / REASON FOR VISIT:
Routine quarterly follow-up and review of lifestyle management and laboratory results.

SUBJECTIVE:
Patient reports adherence to home blood pressure self-monitoring. Mentions mild afternoon fatigue over the past three weeks. Reports no chest pain, shortness of breath, or lower extremity edema. Diet consists of moderate carbohydrate reduction.

VITAL SIGNS RECORDED:
Blood Pressure: 126/82 mmHg (right arm, sitting, regular cuff)
Heart Rate: 72 bpm, regular rhythm
Respiratory Rate: 16 /min
BMI: 26.4 kg/m2

PHYSICAL EXAMINATION:
General: Alert, oriented x 4, no acute distress.
Cardiovascular: Regular rate and rhythm, normal S1/S2, no murmurs or gallops.
Lungs: Clear to auscultation bilaterally.

ADMINISTRATIVE & COORDINATION INSTRUCTIONS:
1. Maintain current wellness plan.
2. Coordinate appointment with Cardiology consult clinic for routine baseline electrocardiogram review. Scheduled for 15 October 2026 at 10:30 AM in Suite 402.
3. Patient must bring previous clinical notes and lipid panel to appointment.
4. Referral letter from primary care network is pending reception from records archive.`
  },
  {
    id: 'doc-103',
    patientId: 'pat-1001',
    filename: 'prescription_documentation.pdf',
    documentType: 'PRESCRIPTION',
    uploadDate: '2026-09-15',
    documentDate: '2026-09-15',
    status: 'PROCESSED',
    fileSize: '190 KB',
    pageCount: 1,
    extractedCount: 4,
    tags: ['Pharmacy', 'Prescriptions', 'Maintenance'],
    fileContentText: `OUTPATIENT PHARMACY ORDERS - METRO HEALTH NETWORK
Prescription Issue Date: 15 September 2026
Patient: Aarav Sharma (P-1001) | DOB: 14-Jun-1984
Prescribing Provider: Dr. Sarah Lin, MD (NPI: 1892019941)
Dispensing Pharmacy: Walgreens Community Pharmacy #4102

DOCUMENTED CURRENT MEDICATIONS ON FILE:
1. Metformin HCl 500 mg oral tablet
   Directions: Take 1 tablet by mouth twice daily with morning and evening meals.
   Dispense: 60 tablets (30-day supply), Refills remaining: 3
2. Atorvastatin Calcium 10 mg oral tablet
   Directions: Take 1 tablet by mouth daily at bedtime.
   Dispense: 30 tablets (30-day supply), Refills remaining: 5
3. Multivitamin with Minerals Daily
   Directions: Take 1 tablet daily with food. (Over-the-counter dietary supplement)

Administrative Notice: Medication synchronization active. Refill coordination due on or before 14 October 2026.`
  },
  {
    id: 'doc-104',
    patientId: 'pat-1001',
    filename: 'appointment_confirmation_slip.pdf',
    documentType: 'APPOINTMENT',
    uploadDate: '2026-09-20',
    documentDate: '2026-09-20',
    status: 'PROCESSED',
    fileSize: '145 KB',
    pageCount: 1,
    extractedCount: 4,
    tags: ['Appointment', 'Cardiology', 'Confirmation'],
    fileContentText: `CENTRAL SPECIALTY SCHEDULING - METRO HEALTH SYSTEM
Appointment Booking Confirmation
Date Issued: 20 September 2026

PATIENT DETAILS:
Aarav Sharma | Record ID: P-1001 | Contact: +1 (555) 234-8901

UPCOMING APPOINTMENT SUMMARY:
Consulting Provider: Dr. Robert Harrison, MD, FACC
Department: Division of Cardiovascular Medicine
Appointment Date: 15 October 2026
Appointment Time: 10:30 AM EDT (Check-in requested at 10:15 AM)
Location: Pavilion B, Suite 402, St. Jude Academic Medical Center
Encounter Type: Outpatient Specialty Consultation

ADMINISTRATIVE PREPARATION CHECKLIST:
- Photo ID and active medical insurance card required at registration desk.
- Bring physical copies of recent laboratory panel (within past 30 days) and active medication summary.
- Referral authorization documentation: Note indicates referral slip must be signed by referring physician Dr. Sarah Lin before check-in.`
  }
];

export const INITIAL_FACTS: ExtractedFact[] = [
  {
    id: 'fact-1',
    patientId: 'pat-1001',
    information: 'Fasting Blood Glucose 108 mg/dL and HbA1c 5.9% recorded on 10 Sep 2026.',
    category: 'LAB_REPORT',
    status: 'FACT',
    confidence: 0.99,
    sourceDocumentId: 'doc-101',
    sourceDocumentName: 'lab_report_metabolic_panel.pdf',
    sourceLocation: 'Page 1, Comprehensive Metabolic Panel',
    evidenceText: 'Fasting Blood Glucose: 108 mg/dL (Reference Range: 70-99 mg/dL) [Flag: High]\nHemoglobin A1c: 5.9% (Reference Range: 4.0 - 5.6%) [Flag: Elevated / Pre-diabetes range]',
    documentDate: '2026-09-10',
    requiresHumanReview: false,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Maya Patel, RN',
    reviewedAt: '2026-09-10 14:22'
  },
  {
    id: 'fact-2',
    patientId: 'pat-1001',
    information: 'Documented consultation with Dr. Sarah Lin with Blood Pressure 126/82 mmHg on 12 Sep 2026.',
    category: 'CLINICAL_NOTE',
    status: 'FACT',
    confidence: 0.98,
    sourceDocumentId: 'doc-102',
    sourceDocumentName: 'clinical_note_internal_medicine.pdf',
    sourceLocation: 'Page 1, Vital Signs Recorded',
    evidenceText: 'Blood Pressure: 126/82 mmHg (right arm, sitting, regular cuff)\nHeart Rate: 72 bpm, regular rhythm',
    documentDate: '2026-09-12',
    requiresHumanReview: false,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Maya Patel, RN',
    reviewedAt: '2026-09-12 16:05'
  },
  {
    id: 'fact-3',
    patientId: 'pat-1001',
    information: 'Prescription for Metformin 500 mg twice daily and Atorvastatin 10 mg daily active.',
    category: 'PRESCRIPTION',
    status: 'FACT',
    confidence: 0.97,
    sourceDocumentId: 'doc-103',
    sourceDocumentName: 'prescription_documentation.pdf',
    sourceLocation: 'Page 1, Documented Current Medications',
    evidenceText: '1. Metformin HCl 500 mg oral tablet ... twice daily with morning and evening meals.\n2. Atorvastatin Calcium 10 mg oral tablet ... daily at bedtime.',
    documentDate: '2026-09-15',
    requiresHumanReview: false,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Maya Patel, RN',
    reviewedAt: '2026-09-15 11:30'
  },
  {
    id: 'fact-4',
    patientId: 'pat-1001',
    information: 'Cardiology outpatient consultation scheduled with Dr. Robert Harrison on 15 October 2026 at 10:30 AM.',
    category: 'APPOINTMENT',
    status: 'FACT',
    confidence: 0.98,
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    sourceLocation: 'Page 1, Upcoming Appointment Summary',
    evidenceText: 'Consulting Provider: Dr. Robert Harrison, MD, FACC\nAppointment Date: 15 October 2026\nAppointment Time: 10:30 AM EDT\nLocation: Pavilion B, Suite 402, St. Jude Academic Medical Center',
    documentDate: '2026-09-20',
    requiresHumanReview: false,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Maya Patel, RN',
    reviewedAt: '2026-09-20 09:40'
  },
  {
    id: 'fact-5',
    patientId: 'pat-1001',
    information: 'Signed Cardiology referral authorization slip has not been found in the uploaded patient file records.',
    category: 'ADMINISTRATIVE_INFORMATION',
    status: 'MISSING',
    confidence: 0.94,
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    sourceLocation: 'Page 1, Administrative Preparation Checklist',
    evidenceText: 'Referral authorization documentation: Note indicates referral slip must be signed by referring physician Dr. Sarah Lin before check-in. [Document not located in current file]',
    documentDate: '2026-09-20',
    requiresHumanReview: true,
    reviewStatus: 'PENDING',
    uncertaintyReason: 'Documented requirement on appointment slip, but corresponding signed referral letter is absent from uploaded documents.'
  },
  {
    id: 'fact-6',
    patientId: 'pat-1001',
    information: 'Prescription refill coordination deadline noted as on or before 14 October 2026.',
    category: 'FOLLOWUP',
    status: 'FACT',
    confidence: 0.95,
    sourceDocumentId: 'doc-103',
    sourceDocumentName: 'prescription_documentation.pdf',
    sourceLocation: 'Page 1, Administrative Notice',
    evidenceText: 'Administrative Notice: Medication synchronization active. Refill coordination due on or before 14 October 2026.',
    documentDate: '2026-09-15',
    requiresHumanReview: false,
    reviewStatus: 'APPROVED'
  },
  {
    id: 'fact-7',
    patientId: 'pat-1001',
    information: 'Previous electrocardiogram (ECG) report date is ambiguous or potentially from an outside healthcare system.',
    category: 'CLINICAL_NOTE',
    status: 'UNCERTAIN',
    confidence: 0.65,
    sourceDocumentId: 'doc-102',
    sourceDocumentName: 'clinical_note_internal_medicine.pdf',
    sourceLocation: 'Page 2, Administrative & Coordination Instructions',
    evidenceText: 'Coordinate appointment with Cardiology consult clinic for routine baseline electrocardiogram review ... Referral letter from primary care network is pending reception from records archive.',
    documentDate: '2026-09-12',
    requiresHumanReview: true,
    reviewStatus: 'PENDING',
    uncertaintyReason: 'Record mentions baseline review, but does not clarify if prior ECG was executed at this hospital or outside facility.'
  },
  {
    id: 'fact-8',
    patientId: 'pat-1001',
    information: 'Patient likely prefers early morning check-in based on commuting constraints noted in conversation logs.',
    category: 'ADMINISTRATIVE_INFORMATION',
    status: 'ASSUMPTION',
    confidence: 0.50,
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    sourceLocation: 'Coordinator Intake Log Note #3',
    evidenceText: 'Inferred preference from intake remarks: "Patient noted morning travel is easier before downtown traffic." Pending direct confirmation.',
    documentDate: '2026-09-20',
    requiresHumanReview: true,
    reviewStatus: 'PENDING',
    uncertaintyReason: 'Inferred by care coordination agent from informal conversation remark; requires patient confirmation before rescheduling any future slots.'
  }
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'time-1',
    patientId: 'pat-1001',
    eventDate: '2026-09-10',
    eventType: 'LAB_REPORT',
    title: 'Laboratory Metabolic Panel Uploaded',
    description: 'Fasting glucose 108 mg/dL, HbA1c 5.9%, creatinine 0.95 mg/dL. Processed by Diagnostic Laboratory.',
    sourceDocumentId: 'doc-101',
    sourceDocumentName: 'lab_report_metabolic_panel.pdf',
    status: 'FACT',
    confidence: 0.99,
    evidenceText: 'Collection Date: 10 September 2026, 08:30 AM ... Fasting Blood Glucose: 108 mg/dL ... HbA1c: 5.9%'
  },
  {
    id: 'time-2',
    patientId: 'pat-1001',
    eventDate: '2026-09-12',
    eventType: 'CLINICAL_NOTE',
    title: 'Internal Medicine Outpatient Encounter Recorded',
    description: 'Dr. Sarah Lin documented routine follow-up. BP 126/82 mmHg. Cardiology outpatient evaluation recommended.',
    sourceDocumentId: 'doc-102',
    sourceDocumentName: 'clinical_note_internal_medicine.pdf',
    status: 'FACT',
    confidence: 0.98,
    evidenceText: 'Encounter Date: 12 September 2026 ... Blood Pressure: 126/82 mmHg ... Coordinate appointment with Cardiology consult clinic.'
  },
  {
    id: 'time-3',
    patientId: 'pat-1001',
    eventDate: '2026-09-15',
    eventType: 'PRESCRIPTION',
    title: 'Medication Record & Pharmacy Order Documented',
    description: 'Metformin 500 mg BID and Atorvastatin 10 mg daily on file. Refill deadline 14 October 2026.',
    sourceDocumentId: 'doc-103',
    sourceDocumentName: 'prescription_documentation.pdf',
    status: 'FACT',
    confidence: 0.97,
    evidenceText: 'Prescription Issue Date: 15 September 2026 ... Metformin HCl 500 mg ... Atorvastatin Calcium 10 mg.'
  },
  {
    id: 'time-4',
    patientId: 'pat-1001',
    eventDate: '2026-09-20',
    eventType: 'APPOINTMENT',
    title: 'Cardiology Consultation Confirmed',
    description: 'Scheduled with Dr. Robert Harrison for 15 October 2026 at 10:30 AM in Pavilion B, Suite 402.',
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    status: 'FACT',
    confidence: 0.98,
    evidenceText: 'Appointment Date: 15 October 2026, 10:30 AM EDT ... Pavilion B, Suite 402.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1001',
    doctorName: 'Dr. Robert Harrison, MD, FACC',
    department: 'Division of Cardiovascular Medicine',
    appointmentDate: '2026-10-15',
    appointmentTime: '10:30 AM EDT',
    location: 'Pavilion B, Suite 402, St. Jude Academic Medical Center',
    appointmentType: 'Specialty Outpatient Consultation',
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    status: 'UPCOMING',
    preparationChecklist: {
      availableDocuments: [
        'Previous internal medicine clinical note (12 Sep 2026)',
        'Laboratory comprehensive metabolic panel (10 Sep 2026)',
        'Active pharmacy medication documentation (15 Sep 2026)'
      ],
      potentiallyMissing: [
        'Signed Cardiology referral authorization slip from Dr. Sarah Lin was not found in the uploaded records archive.'
      ],
      preparationSteps: [
        'Bring printed copy of 10 Sep 2026 metabolic panel results to check-in desk.',
        'Bring active medication list including OTC supplements.',
        'Arrive 15 minutes prior to 10:30 AM for registration verification.',
        'Administrative coordinator to verify referral slip transmission with Dr. Lin\'s office.'
      ]
    }
  },
  {
    id: 'apt-2',
    patientId: 'pat-1001',
    doctorName: 'Dr. Sarah Lin, MD',
    department: 'Internal Medicine',
    appointmentDate: '2026-12-10',
    appointmentTime: '09:00 AM EST',
    location: 'Ambulatory Care Center, Room 108',
    appointmentType: 'Quarterly Primary Care Follow-up',
    sourceDocumentId: 'doc-102',
    sourceDocumentName: 'clinical_note_internal_medicine.pdf',
    status: 'UPCOMING',
    preparationChecklist: {
      availableDocuments: [
        'Baseline clinical note from 12 Sep 2026'
      ],
      potentiallyMissing: [
        'Repeat 3-month fasting glucose panel (scheduled for early December 2026).'
      ],
      preparationSteps: [
        'Coordinate routine 3-month follow-up fasting blood draw 1 week prior to appointment.'
      ]
    }
  }
];

export const INITIAL_FOLLOWUPS: Followup[] = [
  {
    id: 'fol-1',
    patientId: 'pat-1001',
    description: 'Coordinate pharmacy refill synchronization for Metformin and Atorvastatin before 14 October 2026.',
    followupDate: '2026-10-14',
    sourceDocumentId: 'doc-103',
    sourceDocumentName: 'prescription_documentation.pdf',
    status: 'PENDING',
    assignedTo: 'Maya Patel, RN',
    notes: 'Pharmacy reminder notification queued for delivery 3 days prior.'
  },
  {
    id: 'fol-2',
    patientId: 'pat-1001',
    description: 'Verify with records archive if signed referral slip for Cardiology visit was transmitted.',
    followupDate: '2026-10-10',
    sourceDocumentId: 'doc-104',
    sourceDocumentName: 'appointment_confirmation_slip.pdf',
    status: 'PENDING',
    assignedTo: 'Maya Patel, RN',
    notes: 'Critical administrative item: Required before 15 Oct 2026 check-in.'
  },
  {
    id: 'fol-3',
    patientId: 'pat-1001',
    description: 'Schedule routine 3-month follow-up metabolic panel per laboratory recommendation.',
    followupDate: '2026-12-01',
    sourceDocumentId: 'doc-101',
    sourceDocumentName: 'lab_report_metabolic_panel.pdf',
    status: 'PENDING',
    assignedTo: 'Maya Patel, RN',
    notes: 'Clinic protocol reminder.'
  }
];

export const INITIAL_BRIEFINGS: DoctorBriefing[] = [
  {
    id: 'brf-1',
    patientId: 'pat-1001',
    patientName: 'Aarav Sharma',
    generatedAt: '2026-09-22 10:15',
    status: 'DRAFT',
    patientInformationSummary: 'Aarav Sharma, 42-year-old male (DOB: 14-Jun-1984, MRN: P-1001). Primary care facility: Metro Health Ambulatory Pavilion. Active coordinator: Maya Patel, RN.',
    recentTimelineSummary: '4 documents processed between 10 Sep 2026 and 20 Sep 2026: Comprehensive metabolic panel (10 Sep), Outpatient internal medicine encounter (12 Sep), Medication synchronization record (15 Sep), and Cardiology consultation booking (20 Sep).',
    availableDocumentsSummary: [
      'lab_report_metabolic_panel.pdf (10 Sep 2026) - Fasting glucose 108 mg/dL, HbA1c 5.9%',
      'clinical_note_internal_medicine.pdf (12 Sep 2026) - Dr. Sarah Lin, BP 126/82 mmHg',
      'prescription_documentation.pdf (15 Sep 2026) - Metformin 500mg BID, Atorvastatin 10mg daily',
      'appointment_confirmation_slip.pdf (20 Sep 2026) - Cardiology appointment 15 Oct 2026'
    ],
    appointmentsSummary: [
      'Cardiology Consultation with Dr. Robert Harrison on 15 October 2026 at 10:30 AM (Pavilion B, Suite 402)',
      'Internal Medicine Routine Follow-up with Dr. Sarah Lin on 10 December 2026 at 09:00 AM'
    ],
    documentedFollowupItems: [
      'Prescription refill coordination due on or before 14 October 2026',
      'Administrative retrieval of signed referral letter from referring provider before 15 October consultation',
      'Fasting metabolic re-test scheduled for December 2026'
    ],
    missingOrUncertainInformation: [
      'Missing Document: Signed Cardiology referral authorization document was not located in the uploaded patient file records.',
      'Uncertain Record: Clinical note cites prior baseline ECG review, but source document does not clarify if prior ECG was performed in-system or at an outside hospital.',
      'Assumption: Patient morning appointment preference logged from informal note, not formally validated by patient.'
    ],
    evidenceReferences: [
      {
        fact: 'Blood Pressure 126/82 mmHg',
        source: 'clinical_note_internal_medicine.pdf (Page 1)',
        quote: 'Blood Pressure: 126/82 mmHg (right arm, sitting, regular cuff)',
        status: 'FACT'
      },
      {
        fact: 'Cardiology Appointment 15 Oct 2026',
        source: 'appointment_confirmation_slip.pdf (Page 1)',
        quote: 'Appointment Date: 15 October 2026, Appointment Time: 10:30 AM EDT',
        status: 'FACT'
      },
      {
        fact: 'Absence of Signed Referral Document',
        source: 'appointment_confirmation_slip.pdf (Administrative checklist)',
        quote: 'Referral authorization documentation: Note indicates referral slip must be signed by referring physician',
        status: 'MISSING'
      }
    ],
    aiLimitationsDisclaimer: 'NOTICE & SAFETY RESTRICTION: This summary was automatically organized by the AI Healthcare Care-Navigation Agent for administrative coordination and preparation purposes only. It DOES NOT provide medical diagnosis, clinical prognostic predictions, treatment recommendations, or medication adjustments. All clinical decisions and medical care plans remain solely under the responsibility of licensed attending physicians. Requires human review and verification before clinical reliance.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-10 09:15:20',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'LOGIN',
    entity: 'UserSession',
    entityId: 'usr-1',
    details: 'User authenticated successfully via JWT token.'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-10 09:18:44',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: 'doc-101',
    details: 'Uploaded lab_report_metabolic_panel.pdf for patient Aarav Sharma (P-1001).'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-10 09:19:05',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'DOCUMENT_PROCESSED',
    entity: 'AgentOrchestrator',
    entityId: 'doc-101',
    details: 'Document Agent & Extraction Agent parsed 5 facts. Evidence Agent classified 5 FACT items.'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-12 14:22:10',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: 'doc-102',
    details: 'Uploaded clinical_note_internal_medicine.pdf.'
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-15 10:45:00',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: 'doc-103',
    details: 'Uploaded prescription_documentation.pdf.'
  },
  {
    id: 'aud-6',
    timestamp: '2026-09-20 09:30:15',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: 'doc-104',
    details: 'Uploaded appointment_confirmation_slip.pdf.'
  },
  {
    id: 'aud-7',
    timestamp: '2026-09-20 09:32:00',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'INFORMATION_EXTRACTED',
    entity: 'EvidenceEngine',
    entityId: 'fact-5',
    details: 'Identified missing referral document: Marked as MISSING with requires_human_review=true.'
  },
  {
    id: 'aud-8',
    timestamp: '2026-09-22 10:15:00',
    userId: 'usr-1',
    userName: 'Maya Patel, RN',
    userRole: 'CARE_COORDINATOR',
    action: 'BRIEFING_GENERATED',
    entity: 'DoctorBriefing',
    entityId: 'brf-1',
    details: 'Doctor Briefing Agent synthesized patient care briefing #brf-1 in DRAFT state.'
  }
];
