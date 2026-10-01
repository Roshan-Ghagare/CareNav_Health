import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Patient,
  DocumentItem,
  ExtractedFact,
  TimelineEvent,
  Appointment,
  Followup,
  DoctorBriefing,
  AuditLog,
  AgentStepProgress,
  EvidenceStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_FACTS,
  INITIAL_TIMELINE,
  INITIAL_APPOINTMENTS,
  INITIAL_FOLLOWUPS,
  INITIAL_BRIEFINGS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import { runCareNavigationAgentPipeline } from '../services/agentOrchestrator';

interface AppContextType {
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  patients: Patient[];
  selectedPatient: Patient;
  setSelectedPatientId: (id: string) => void;
  documents: DocumentItem[];
  facts: ExtractedFact[];
  timeline: TimelineEvent[];
  appointments: Appointment[];
  followups: Followup[];
  briefings: DoctorBriefing[];
  auditLogs: AuditLog[];
  mockAiMode: boolean;
  setMockAiMode: (enabled: boolean) => void;
  isProcessingAgents: boolean;
  currentAgentProgress: AgentStepProgress[];
  
  // Actions
  uploadDocument: (filename: string, content: string, docType?: DocumentItem['documentType']) => Promise<DocumentItem>;
  runAgentsOnDocument: (docId: string) => Promise<void>;
  approveFact: (factId: string, notes?: string) => void;
  rejectFact: (factId: string, notes?: string) => void;
  editFact: (factId: string, newInfo: string, newStatus: EvidenceStatus, notes?: string) => void;
  approveBriefing: (briefingId: string, clinicianNotes?: string) => void;
  rejectBriefing: (briefingId: string, clinicianNotes?: string) => void;
  editBriefing: (briefingId: string, updatedSummary: string) => void;
  generateBriefingForPatient: (patientId: string) => Promise<void>;
  addFollowup: (followupData: Omit<Followup, 'id'>) => Followup;
  requestLabRecords: (facilityName: string, recordTypes: string, targetDate: string, notes?: string) => Followup;
  updateFollowupStatus: (followupId: string, status: Followup['status']) => void;
  deleteDocument: (docId: string) => void;
  
  // Evidence Modal Drawer
  selectedEvidenceFact: ExtractedFact | null;
  openEvidenceModal: (fact: ExtractedFact) => void;
  closeEvidenceModal: () => void;

  // Demo Walkthrough Mode
  demoStep: number;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Care coordinator default
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1001');
  
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [facts, setFacts] = useState<ExtractedFact[]>(INITIAL_FACTS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [followups, setFollowups] = useState<Followup[]>(INITIAL_FOLLOWUPS);
  const [briefings, setBriefings] = useState<DoctorBriefing[]>(INITIAL_BRIEFINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  const [mockAiMode, setMockAiMode] = useState<boolean>(true);
  const [isProcessingAgents, setIsProcessingAgents] = useState<boolean>(false);
  const [currentAgentProgress, setCurrentAgentProgress] = useState<AgentStepProgress[]>([]);
  
  const [selectedEvidenceFact, setSelectedEvidenceFact] = useState<ExtractedFact | null>(null);
  const [demoStep, setDemoStep] = useState<number>(1);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const setCurrentUserRole = (role: UserRole) => {
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(user);
    logAudit('LOGIN', 'UserSession', user.id, `User switched active profile to ${user.name} (${role}).`);
  };

  const logAudit = (
    action: AuditLog['action'],
    entity: string,
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const uploadDocument = async (
    filename: string,
    content: string,
    docType?: DocumentItem['documentType']
  ): Promise<DocumentItem> => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      patientId: selectedPatient.id,
      filename,
      documentType: docType || 'CLINICAL_NOTE',
      uploadDate: new Date().toISOString().split('T')[0],
      documentDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      fileSize: `${Math.round(content.length / 1024) || 120} KB`,
      pageCount: Math.max(1, Math.ceil(content.length / 800)),
      extractedCount: 0,
      fileContentText: content,
      tags: ['Uploaded', 'Pending-AI']
    };

    setDocuments(prev => [newDoc, ...prev]);
    logAudit('DOCUMENT_UPLOADED', 'Document', newDocId, `Uploaded document "${filename}" for patient ${selectedPatient.name}.`);
    
    // Automatically trigger agent processing pipeline
    setTimeout(() => {
      runAgentsOnDocument(newDocId);
    }, 200);

    return newDoc;
  };

  const runAgentsOnDocument = async (docId: string) => {
    const targetDoc = documents.find(d => d.id === docId);
    if (!targetDoc) return;

    setIsProcessingAgents(true);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'PROCESSING' } : d));

    try {
      const result = await runCareNavigationAgentPipeline(
        targetDoc,
        documents.filter(d => d.id !== docId && d.patientId === targetDoc.patientId),
        facts.filter(f => f.patientId === targetDoc.patientId),
        (stepUpdate) => {
          setCurrentAgentProgress(prev => {
            const next = [...prev];
            const idx = next.findIndex(s => s.step === stepUpdate.step);
            if (idx >= 0) {
              next[idx] = stepUpdate;
            } else {
              next.push(stepUpdate);
            }
            return next;
          });
        },
        mockAiMode
      );

      // Update documents state
      setDocuments(prev => prev.map(d => d.id === docId ? {
        ...d,
        status: 'PROCESSED',
        extractedCount: result.facts.length
      } : d));

      // Append new facts
      setFacts(prev => [...result.facts, ...prev]);

      // Append timeline events
      setTimeline(prev => [...result.timelineEvents, ...prev]);

      // If new appointments found
      if (result.appointments.length > 0) {
        setAppointments(prev => [...result.appointments, ...prev]);
      }

      // If new followups found
      if (result.followups.length > 0) {
        setFollowups(prev => [...result.followups, ...prev]);
      }

      // If new briefing generated
      if (result.briefing) {
        setBriefings(prev => [result.briefing!, ...prev]);
      }

      logAudit(
        'DOCUMENT_PROCESSED',
        'AgentOrchestrator',
        docId,
        `Document Agent & Extraction Agent extracted ${result.facts.length} items. Timeline and follow-ups synchronized.`
      );
    } catch (err: any) {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'FAILED' } : d));
    } finally {
      setIsProcessingAgents(false);
    }
  };

  const approveFact = (factId: string, notes?: string) => {
    setFacts(prev => prev.map(f => {
      if (f.id === factId) {
        return {
          ...f,
          reviewStatus: 'APPROVED',
          requiresHumanReview: false,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          humanReviewNotes: notes || f.humanReviewNotes
        };
      }
      return f;
    }));
    logAudit('INFORMATION_APPROVED', 'ExtractedFact', factId, `Verified and approved evidence fact #${factId}. Notes: ${notes || 'None'}`);
  };

  const rejectFact = (factId: string, notes?: string) => {
    setFacts(prev => prev.map(f => {
      if (f.id === factId) {
        return {
          ...f,
          reviewStatus: 'REJECTED',
          requiresHumanReview: false,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          humanReviewNotes: notes || 'Rejected during clinical review'
        };
      }
      return f;
    }));
    logAudit('INFORMATION_REJECTED', 'ExtractedFact', factId, `Rejected fact #${factId}. Reason: ${notes || 'Rejected'}`);
  };

  const editFact = (factId: string, newInfo: string, newStatus: EvidenceStatus, notes?: string) => {
    setFacts(prev => prev.map(f => {
      if (f.id === factId) {
        return {
          ...f,
          information: newInfo,
          status: newStatus,
          reviewStatus: 'EDITED',
          requiresHumanReview: false,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          humanReviewNotes: notes || 'Edited and updated by reviewer'
        };
      }
      return f;
    }));
    logAudit('INFORMATION_EDITED', 'ExtractedFact', factId, `Edited fact #${factId}. New text: "${newInfo}". New status: ${newStatus}`);
  };

  const approveBriefing = (briefingId: string, clinicianNotes?: string) => {
    setBriefings(prev => prev.map(b => {
      if (b.id === briefingId) {
        return {
          ...b,
          status: 'APPROVED',
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          clinicianNotes: clinicianNotes || 'Approved without amendment by attending clinician.'
        };
      }
      return b;
    }));
    logAudit('BRIEFING_APPROVED', 'DoctorBriefing', briefingId, `Clinician ${currentUser.name} officially approved doctor briefing #${briefingId}.`);
  };

  const rejectBriefing = (briefingId: string, clinicianNotes?: string) => {
    setBriefings(prev => prev.map(b => {
      if (b.id === briefingId) {
        return {
          ...b,
          status: 'REJECTED',
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          clinicianNotes: clinicianNotes || 'Returned for coordinator revision.'
        };
      }
      return b;
    }));
    logAudit('BRIEFING_REJECTED', 'DoctorBriefing', briefingId, `Clinician ${currentUser.name} rejected doctor briefing #${briefingId}. Reason: ${clinicianNotes || 'Revision needed'}`);
  };

  const editBriefing = (briefingId: string, updatedSummary: string) => {
    setBriefings(prev => prev.map(b => {
      if (b.id === briefingId) {
        return {
          ...b,
          status: 'EDITED',
          patientInformationSummary: updatedSummary,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return b;
    }));
    logAudit('BRIEFING_EDITED', 'DoctorBriefing', briefingId, `Briefing #${briefingId} amended by ${currentUser.name}.`);
  };

  const generateBriefingForPatient = async (patientId: string) => {
    const patientDocs = documents.filter(d => d.patientId === patientId);
    const patientFacts = facts.filter(f => f.patientId === patientId);
    
    const newBriefing: DoctorBriefing = {
      id: `brf-${Date.now()}`,
      patientId,
      patientName: selectedPatient.name,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'DRAFT',
      patientInformationSummary: `${selectedPatient.name}, ${selectedPatient.age}-year-old ${selectedPatient.gender} (DOB: ${selectedPatient.dateOfBirth}, MRN: ${selectedPatient.patientIdentifier}). Emergency contact: ${selectedPatient.emergencyContact}. Care coordinator: ${selectedPatient.careCoordinatorName}.`,
      recentTimelineSummary: `Compiled from ${patientDocs.length} documented healthcare records. ${patientFacts.filter(f => f.status === 'FACT').length} facts verified against original source text.`,
      availableDocumentsSummary: patientDocs.map(d => `${d.filename} (${d.documentDate || d.uploadDate})`),
      appointmentsSummary: appointments.filter(a => a.patientId === patientId).map(a => `${a.department} with ${a.doctorName} on ${a.appointmentDate} at ${a.appointmentTime}`),
      documentedFollowupItems: followups.filter(f => f.patientId === patientId).map(f => `${f.description} (Target: ${f.followupDate})`),
      missingOrUncertainInformation: patientFacts
        .filter(f => f.status === 'MISSING' || f.status === 'UNCERTAIN')
        .map(f => `[${f.status}] ${f.information} - ${f.uncertaintyReason || 'Ambiguity in record'}`),
      evidenceReferences: patientFacts.filter(f => f.status === 'FACT').slice(0, 5).map(f => ({
        fact: f.information,
        source: `${f.sourceDocumentName} (${f.sourceLocation})`,
        quote: f.evidenceText,
        status: f.status
      })),
      aiLimitationsDisclaimer: 'NOTICE & SAFETY RESTRICTION: This summary was automatically organized by the AI Healthcare Care-Navigation Agent for administrative coordination and preparation purposes only. It DOES NOT provide medical diagnosis, clinical prognostic predictions, treatment recommendations, or medication adjustments. All clinical decisions and medical care plans remain solely under the responsibility of licensed attending physicians. Requires human review and verification before clinical reliance.'
    };

    setBriefings(prev => [newBriefing, ...prev]);
    logAudit('BRIEFING_GENERATED', 'DoctorBriefing', newBriefing.id, `Synthesized new clinician briefing for ${selectedPatient.name}.`);
  };

  const addFollowup = (followupData: Omit<Followup, 'id'>): Followup => {
    const newFollowup: Followup = {
      ...followupData,
      id: `fol-${Date.now()}`
    };
    setFollowups(prev => [newFollowup, ...prev]);
    logAudit(
      'FOLLOWUP_UPDATED',
      'Followup',
      newFollowup.id,
      `Scheduled administrative follow-up: "${newFollowup.description}" target date ${newFollowup.followupDate}. Assigned to ${newFollowup.assignedTo || currentUser.name}.`
    );
    return newFollowup;
  };

  const requestLabRecords = (facilityName: string, recordTypes: string, targetDate: string, notes?: string): Followup => {
    const newFollowup: Followup = {
      id: `fol-${Date.now()}`,
      patientId: selectedPatient.id,
      description: `Administrative Record Request: Retrieve ${recordTypes} from ${facilityName}.`,
      followupDate: targetDate || '2026-10-08',
      sourceDocumentId: 'req-archive',
      sourceDocumentName: 'Electronic Record Request Form',
      status: 'PENDING',
      assignedTo: currentUser.name,
      notes: notes || `Direct records archival retrieval initiated from ${facilityName}.`
    };
    setFollowups(prev => [newFollowup, ...prev]);
    logAudit(
      'DOCUMENT_PROCESSED',
      'LabRecordsRequest',
      newFollowup.id,
      `Initiated electronic lab records retrieval from ${facilityName} (${recordTypes}) for patient ${selectedPatient.name}.`
    );
    return newFollowup;
  };

  const updateFollowupStatus = (followupId: string, status: Followup['status']) => {
    setFollowups(prev => prev.map(f => f.id === followupId ? { ...f, status } : f));
    logAudit('FOLLOWUP_UPDATED', 'Followup', followupId, `Administrative follow-up #${followupId} status marked as ${status}.`);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    logAudit('DOCUMENT_PROCESSED', 'Document', docId, `Archived/removed document #${docId}.`);
  };

  const openEvidenceModal = (fact: ExtractedFact) => {
    setSelectedEvidenceFact(fact);
  };

  const closeEvidenceModal = () => {
    setSelectedEvidenceFact(null);
  };

  const nextDemoStep = () => {
    setDemoStep(prev => Math.min(15, prev + 1));
  };

  const prevDemoStep = () => {
    setDemoStep(prev => Math.max(1, prev - 1));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUserRole,
        patients,
        selectedPatient,
        setSelectedPatientId,
        documents,
        facts,
        timeline,
        appointments,
        followups,
        briefings,
        auditLogs,
        mockAiMode,
        setMockAiMode,
        isProcessingAgents,
        currentAgentProgress,
        uploadDocument,
        runAgentsOnDocument,
        approveFact,
        rejectFact,
        editFact,
        approveBriefing,
        rejectBriefing,
        editBriefing,
        generateBriefingForPatient,
        addFollowup,
        requestLabRecords,
        updateFollowupStatus,
        deleteDocument,
        selectedEvidenceFact,
        openEvidenceModal,
        closeEvidenceModal,
        demoStep,
        setDemoStep,
        nextDemoStep,
        prevDemoStep
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
