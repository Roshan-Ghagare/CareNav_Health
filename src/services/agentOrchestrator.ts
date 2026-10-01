import {
  DocumentItem,
  ExtractedFact,
  TimelineEvent,
  Appointment,
  Followup,
  DoctorBriefing,
  AgentStepProgress,
  DocumentType,
  EvidenceStatus
} from '../types';

export interface AgentExecutionResult {
  facts: ExtractedFact[];
  timelineEvents: TimelineEvent[];
  appointments: Appointment[];
  followups: Followup[];
  briefing?: DoctorBriefing;
  agentSteps: AgentStepProgress[];
}

/**
 * 7-Stage Agentic Care Navigation Pipeline:
 * 1. Document Agent (Type identification, date detection, metadata)
 * 2. Information Extraction Agent (Structured facts, source location)
 * 3. Evidence & Uncertainty Agent (FACT, UNCERTAIN, MISSING, ASSUMPTION)
 * 4. Timeline Agent (Chronological ordering, timeline synchronization)
 * 5. Appointment Coordination Agent (Administrative checklists, missing doc warnings)
 * 6. Follow-up Agent (Due dates, administrative reminders)
 * 7. Doctor Briefing Agent (Evidence references, AI limitations notice)
 */
export async function runCareNavigationAgentPipeline(
  document: DocumentItem,
  existingDocuments: DocumentItem[],
  existingFacts: ExtractedFact[],
  onStepProgress?: (step: AgentStepProgress) => void,
  mockAiMode: boolean = true
): Promise<AgentExecutionResult> {
  const steps: AgentStepProgress[] = [
    { step: 'DOCUMENT', status: 'RUNNING', summary: 'Detecting document type, date and layout structure...' },
    { step: 'EXTRACTION', status: 'IDLE' },
    { step: 'EVIDENCE', status: 'IDLE' },
    { step: 'TIMELINE', status: 'IDLE' },
    { step: 'APPOINTMENT', status: 'IDLE' },
    { step: 'FOLLOWUP', status: 'IDLE' },
    { step: 'BRIEFING', status: 'IDLE' },
  ];

  const updateStep = (index: number, status: 'RUNNING' | 'COMPLETED' | 'FAILED', summary?: string) => {
    steps[index].status = status;
    if (summary) steps[index].summary = summary;
    if (onStepProgress) onStepProgress({ ...steps[index] });
  };

  // Helper delay for realistic simulation feedback
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // STEP 1: Document Agent
  updateStep(0, 'RUNNING', `Analyzing metadata for "${document.filename}"...`);
  await delay(400);
  const detectedType = detectDocumentType(document.filename, document.fileContentText);
  const detectedDate = detectDocumentDate(document.fileContentText) || document.documentDate || new Date().toISOString().split('T')[0];
  updateStep(0, 'COMPLETED', `Identified as ${detectedType} (Document Date: ${detectedDate})`);

  // STEP 2: Extraction Agent
  updateStep(1, 'RUNNING', 'Extracting structured facts, clinical encounters, and administrative items...');
  await delay(500);
  const rawFacts = extractFactsFromText(document, detectedType, detectedDate);
  updateStep(1, 'COMPLETED', `Extracted ${rawFacts.length} structured administrative and clinical items`);

  // STEP 3: Evidence & Uncertainty Agent
  updateStep(2, 'RUNNING', 'Evaluating textual evidence, ambiguity, and missing administrative records...');
  await delay(450);
  const classifiedFacts = classifyEvidenceAndUncertainty(rawFacts, document, existingDocuments);
  const factCount = classifiedFacts.filter(f => f.status === 'FACT').length;
  const uncertainCount = classifiedFacts.filter(f => f.status === 'UNCERTAIN' || f.status === 'MISSING').length;
  updateStep(2, 'COMPLETED', `Evidence audited: ${factCount} FACT items, ${uncertainCount} UNCERTAIN / MISSING records flagged`);

  // STEP 4: Timeline Agent
  updateStep(3, 'RUNNING', 'Synthesizing chronological patient events with direct evidence backlinks...');
  await delay(400);
  const newTimelineEvents = generateTimelineEvents(document, classifiedFacts, detectedDate);
  updateStep(3, 'COMPLETED', `Created ${newTimelineEvents.length} chronological timeline milestones`);

  // STEP 5: Appointment Coordination Agent
  updateStep(4, 'RUNNING', 'Checking appointment schedules & generating administrative prep checklists...');
  await delay(400);
  const appointments = extractOrCoordinateAppointments(document, classifiedFacts, existingDocuments);
  updateStep(4, 'COMPLETED', `Organized ${appointments.length} appointment coordination items`);

  // STEP 6: Follow-up Agent
  updateStep(5, 'RUNNING', 'Identifying documented administrative follow-ups and synchronizing reminders...');
  await delay(350);
  const followups = extractFollowups(document, classifiedFacts);
  updateStep(5, 'COMPLETED', `Identified ${followups.length} actionable administrative follow-up items`);

  // STEP 7: Briefing Agent
  updateStep(6, 'RUNNING', 'Synthesizing evidence-backed Doctor Briefing with AI safety boundary notes...');
  await delay(500);
  const briefing = synthesizeDoctorBriefing(document.patientId, [document, ...existingDocuments], [...classifiedFacts, ...existingFacts]);
  updateStep(6, 'COMPLETED', 'Clinician Briefing compiled. Awaiting human review & approval.');

  return {
    facts: classifiedFacts,
    timelineEvents: newTimelineEvents,
    appointments,
    followups,
    briefing,
    agentSteps: steps
  };
}

// Helper: Document Agent functions
function detectDocumentType(filename: string, content: string): DocumentType {
  const lowerName = filename.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (lowerName.includes('lab') || lowerContent.includes('metabolic') || lowerContent.includes('pathology') || lowerContent.includes('glucose') || lowerContent.includes('cholesterol')) {
    return 'LAB_REPORT';
  }
  if (lowerName.includes('presc') || lowerContent.includes('rx') || lowerContent.includes('pharmacy') || lowerContent.includes('metformin') || lowerContent.includes('dispense')) {
    return 'PRESCRIPTION';
  }
  if (lowerName.includes('appoint') || lowerContent.includes('booking confirmation') || lowerContent.includes('consultation scheduled')) {
    return 'APPOINTMENT';
  }
  if (lowerName.includes('referral') || lowerContent.includes('referral authorization')) {
    return 'REFERRAL';
  }
  if (lowerName.includes('discharge') || lowerContent.includes('discharge summary')) {
    return 'DISCHARGE';
  }
  if (lowerName.includes('clinic') || lowerContent.includes('chief concern') || lowerContent.includes('physical examination') || lowerContent.includes('attending physician')) {
    return 'CLINICAL_NOTE';
  }
  return 'OTHER';
}

function detectDocumentDate(content: string): string | null {
  // Regex search for dates like "10 September 2026", "2026-09-10", "Sep 12, 2026", etc.
  const dateRegex = /(?:Date(?:\sIssued|\sRecorded)?:\s*|Collection Date:\s*|Encounter Date:\s*)?(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i;
  const match = content.match(dateRegex);
  if (match && match[1]) {
    const parsed = new Date(match[1]);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  const isoMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch && isoMatch[1]) {
    return isoMatch[1];
  }
  return null;
}

// Helper: Extraction Agent functions
function extractFactsFromText(document: DocumentItem, docType: DocumentType, docDate: string): ExtractedFact[] {
  const content = document.fileContentText;
  const facts: ExtractedFact[] = [];
  const baseId = `fact-${Date.now()}`;

  if (docType === 'LAB_REPORT') {
    if (content.includes('Glucose') || content.includes('glucose')) {
      const glucoseLine = content.split('\n').find(l => l.toLowerCase().includes('glucose')) || 'Fasting Blood Glucose: 108 mg/dL';
      facts.push({
        id: `${baseId}-1`,
        patientId: document.patientId,
        information: `Documented lab value: ${glucoseLine.trim()}`,
        category: 'LAB_REPORT',
        status: 'FACT',
        confidence: 0.99,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Page 1, Chemistry Section',
        evidenceText: glucoseLine.trim(),
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    }
    if (content.includes('A1c') || content.includes('a1c')) {
      const a1cLine = content.split('\n').find(l => l.toLowerCase().includes('a1c')) || 'Hemoglobin A1c: 5.9%';
      facts.push({
        id: `${baseId}-2`,
        patientId: document.patientId,
        information: `Documented lab value: ${a1cLine.trim()}`,
        category: 'LAB_REPORT',
        status: 'FACT',
        confidence: 0.98,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Page 1, Chemistry Section',
        evidenceText: a1cLine.trim(),
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    }
    if (content.toLowerCase().includes('follow-up') || content.toLowerCase().includes('recommended in 3 months')) {
      facts.push({
        id: `${baseId}-3`,
        patientId: document.patientId,
        information: 'Administrative guidance noted on report: Follow-up fasting glucose panel in 3 months per clinic protocol.',
        category: 'FOLLOWUP',
        status: 'FACT',
        confidence: 0.96,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Page 1, Administrative Note',
        evidenceText: 'Follow-up fasting glucose panel recommended in 3 months per clinic protocol.',
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    }
  } else if (docType === 'CLINICAL_NOTE') {
    if (content.includes('Blood Pressure') || content.includes('BP')) {
      const bpLine = content.split('\n').find(l => l.toLowerCase().includes('blood pressure')) || 'Blood Pressure: 126/82 mmHg';
      facts.push({
        id: `${baseId}-1`,
        patientId: document.patientId,
        information: `Recorded vital sign: ${bpLine.trim()}`,
        category: 'CLINICAL_NOTE',
        status: 'FACT',
        confidence: 0.98,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Page 1, Vital Signs',
        evidenceText: bpLine.trim(),
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    }
    if (content.toLowerCase().includes('cardiology')) {
      facts.push({
        id: `${baseId}-2`,
        patientId: document.patientId,
        information: 'Coordination instruction: Schedule Cardiology outpatient consult for baseline review.',
        category: 'APPOINTMENT',
        status: 'FACT',
        confidence: 0.97,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Page 2, Administrative & Coordination Instructions',
        evidenceText: 'Coordinate appointment with Cardiology consult clinic for routine baseline electrocardiogram review.',
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    }
  } else if (docType === 'PRESCRIPTION') {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const medLines = lines.filter(l => l.includes('mg') || l.includes('tablet') || l.includes('Directions:'));
    medLines.slice(0, 3).forEach((line, idx) => {
      facts.push({
        id: `${baseId}-${idx + 1}`,
        patientId: document.patientId,
        information: `Documented medication order: ${line.trim()}`,
        category: 'PRESCRIPTION',
        status: 'FACT',
        confidence: 0.97,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: `Page 1, Prescription Line ${idx + 1}`,
        evidenceText: line.trim(),
        documentDate: docDate,
        requiresHumanReview: false,
        reviewStatus: 'APPROVED'
      });
    });
  } else if (docType === 'APPOINTMENT') {
    facts.push({
      id: `${baseId}-1`,
      patientId: document.patientId,
      information: 'Scheduled appointment details extracted from official scheduling slip.',
      category: 'APPOINTMENT',
      status: 'FACT',
      confidence: 0.98,
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      sourceLocation: 'Page 1, Header & Encounter Details',
      evidenceText: content.substring(0, 200).replace(/\n+/g, ' '),
      documentDate: docDate,
      requiresHumanReview: false,
      reviewStatus: 'APPROVED'
    });
  } else {
    // Generic fallback extraction
    facts.push({
      id: `${baseId}-gen`,
      patientId: document.patientId,
      information: `Document "${document.filename}" cataloged with explicit record date ${docDate}.`,
      category: 'ADMINISTRATIVE_INFORMATION',
      status: 'FACT',
      confidence: 0.95,
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      sourceLocation: 'Header Metadata',
      evidenceText: `Document: ${document.filename} | Uploaded: ${document.uploadDate}`,
      documentDate: docDate,
      requiresHumanReview: false,
      reviewStatus: 'APPROVED'
    });
  }

  return facts;
}

// Helper: Evidence & Uncertainty Agent
function classifyEvidenceAndUncertainty(
  facts: ExtractedFact[],
  document: DocumentItem,
  existingDocs: DocumentItem[]
): ExtractedFact[] {
  const content = document.fileContentText.toLowerCase();

  // Check if there are signs of missing administrative prerequisites
  if (content.includes('referral') && !content.includes('referral received') && !content.includes('referral signed')) {
    const hasReferralDoc = existingDocs.some(d => d.documentType === 'REFERRAL' || d.filename.toLowerCase().includes('referral'));
    if (!hasReferralDoc) {
      facts.push({
        id: `fact-missing-${Date.now()}`,
        patientId: document.patientId,
        information: 'Required administrative referral letter was not found in the uploaded patient file records.',
        category: 'ADMINISTRATIVE_INFORMATION',
        status: 'MISSING',
        confidence: 0.92,
        sourceDocumentId: document.id,
        sourceDocumentName: document.filename,
        sourceLocation: 'Preparation instructions checklist',
        evidenceText: 'Referral documentation: Slip must be signed by referring physician before check-in. [Document not located in uploaded records]',
        documentDate: document.documentDate || '2026-09-20',
        requiresHumanReview: true,
        reviewStatus: 'PENDING',
        uncertaintyReason: 'Document mentions referral requirement, but no corresponding signed referral document is present in patient archive.'
      });
    }
  }

  // Check for ambiguous references
  if (content.includes('outside facility') || content.includes('previous records') || content.includes('pending reception')) {
    facts.push({
      id: `fact-uncert-${Date.now()}`,
      patientId: document.patientId,
      information: 'External records transfer status remains ambiguous in uploaded documentation.',
      category: 'ADMINISTRATIVE_INFORMATION',
      status: 'UNCERTAIN',
      confidence: 0.65,
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      sourceLocation: 'Administrative instructions paragraph',
      evidenceText: 'Pending reception from records archive / outside facility reference found.',
      documentDate: document.documentDate || '2026-09-12',
      requiresHumanReview: true,
      reviewStatus: 'PENDING',
      uncertaintyReason: 'Source note notes pending records from archive without explicit tracking number or facility identifier.'
    });
  }

  return facts;
}

// Helper: Timeline Agent
function generateTimelineEvents(document: DocumentItem, facts: ExtractedFact[], docDate: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const primaryFact = facts[0];

  const eventTypeMap: Record<DocumentType, TimelineEvent['eventType']> = {
    LAB_REPORT: 'LAB_REPORT',
    CLINICAL_NOTE: 'CLINICAL_NOTE',
    PRESCRIPTION: 'PRESCRIPTION',
    APPOINTMENT: 'APPOINTMENT',
    REFERRAL: 'REFERRAL',
    DISCHARGE: 'CLINICAL_NOTE',
    OTHER: 'ADMINISTRATIVE'
  };

  events.push({
    id: `time-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patientId: document.patientId,
    eventDate: docDate,
    eventType: eventTypeMap[document.documentType] || 'ADMINISTRATIVE',
    title: `${document.documentType.replace('_', ' ')} Documented`,
    description: primaryFact ? primaryFact.information : `Uploaded and indexed ${document.filename}.`,
    sourceDocumentId: document.id,
    sourceDocumentName: document.filename,
    status: primaryFact ? primaryFact.status : 'FACT',
    confidence: primaryFact ? primaryFact.confidence : 0.95,
    evidenceText: primaryFact ? primaryFact.evidenceText : document.filename
  });

  return events;
}

// Helper: Appointment Coordination Agent
function extractOrCoordinateAppointments(
  document: DocumentItem,
  facts: ExtractedFact[],
  existingDocs: DocumentItem[]
): Appointment[] {
  const content = document.fileContentText;
  const appointments: Appointment[] = [];

  if (document.documentType === 'APPOINTMENT' || content.toLowerCase().includes('appointment date') || content.toLowerCase().includes('consultation scheduled')) {
    const hasReferral = existingDocs.some(d => d.documentType === 'REFERRAL');

    appointments.push({
      id: `apt-${Date.now()}`,
      patientId: document.patientId,
      doctorName: 'Dr. Robert Harrison, MD, FACC',
      department: 'Division of Cardiovascular Medicine',
      appointmentDate: '2026-10-15',
      appointmentTime: '10:30 AM EDT',
      location: 'Pavilion B, Suite 402, St. Jude Academic Medical Center',
      appointmentType: 'Cardiovascular Consultation',
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      status: 'UPCOMING',
      preparationChecklist: {
        availableDocuments: [
          'Recent comprehensive metabolic panel (10 Sep 2026)',
          'Current outpatient medication order summary (15 Sep 2026)',
          'Internal medicine consultation encounter notes (12 Sep 2026)'
        ],
        potentiallyMissing: hasReferral
          ? []
          : ['Signed Cardiology referral authorization slip was not found in the uploaded records archive.'],
        preparationSteps: [
          'Bring printed laboratory results from September panel to consultation.',
          'Carry photo ID and insurance verification card for registration desk.',
          'Verify with referring clinic that electronic referral transmission was completed.'
        ]
      }
    });
  }

  return appointments;
}

// Helper: Follow-up Agent
function extractFollowups(document: DocumentItem, facts: ExtractedFact[]): Followup[] {
  const followups: Followup[] = [];
  const content = document.fileContentText.toLowerCase();

  if (content.includes('refill') || content.includes('medication synchronization')) {
    followups.push({
      id: `fol-${Date.now()}-1`,
      patientId: document.patientId,
      description: 'Coordinate pharmacy prescription refills on or before 14 October 2026.',
      followupDate: '2026-10-14',
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      status: 'PENDING',
      assignedTo: 'Care Coordinator'
    });
  }

  if (content.includes('referral') && content.includes('pending')) {
    followups.push({
      id: `fol-${Date.now()}-2`,
      patientId: document.patientId,
      description: 'Follow up with records department for signed referral letter.',
      followupDate: '2026-10-10',
      sourceDocumentId: document.id,
      sourceDocumentName: document.filename,
      status: 'PENDING',
      assignedTo: 'Care Coordinator'
    });
  }

  return followups;
}

// Helper: Briefing Agent
function synthesizeDoctorBriefing(
  patientId: string,
  documents: DocumentItem[],
  facts: ExtractedFact[]
): DoctorBriefing {
  const docNames = documents.map(d => `${d.filename} (${d.documentDate || d.uploadDate})`);
  const factsList = facts.filter(f => f.status === 'FACT');
  const missingList = facts.filter(f => f.status === 'MISSING' || f.status === 'UNCERTAIN' || f.status === 'ASSUMPTION');

  return {
    id: `brf-${Date.now()}`,
    patientId,
    patientName: 'Aarav Sharma',
    generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'DRAFT',
    patientInformationSummary: 'Aarav Sharma, 42-year-old male (MRN: P-1001). Outpatient records coordinated through Metro Health Ambulatory Pavilion.',
    recentTimelineSummary: `${documents.length} healthcare documents processed spanning ${documents[documents.length - 1]?.documentDate || 'recent months'} to ${documents[0]?.documentDate || 'present'}. Organized chronologically with direct evidence references.`,
    availableDocumentsSummary: docNames,
    appointmentsSummary: [
      'Cardiology Consultation scheduled for 15 October 2026 at 10:30 AM with Dr. Robert Harrison (Pavilion B, Suite 402)'
    ],
    documentedFollowupItems: [
      'Prescription refill coordination due on or before 14 October 2026',
      'Administrative referral slip verification prior to 15 October appointment',
      'Routine 3-month follow-up lab draw recommended for December 2026'
    ],
    missingOrUncertainInformation: missingList.map(m => `[${m.status}] ${m.information} (Reason: ${m.uncertaintyReason || 'Ambiguity in record'})`),
    evidenceReferences: factsList.slice(0, 5).map(f => ({
      fact: f.information,
      source: `${f.sourceDocumentName} (${f.sourceLocation})`,
      quote: f.evidenceText,
      status: f.status
    })),
    aiLimitationsDisclaimer: 'NOTICE & SAFETY RESTRICTION: This summary was automatically organized by the AI Healthcare Care-Navigation Agent for administrative coordination and preparation purposes only. It DOES NOT provide medical diagnosis, clinical prognostic predictions, treatment recommendations, or medication adjustments. All clinical decisions and medical care plans remain solely under the responsibility of licensed attending physicians. Requires human review and verification before clinical reliance.'
  };
}
