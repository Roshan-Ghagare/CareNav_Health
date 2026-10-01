from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.agents.document_agent import DocumentAgent
from backend.app.agents.extraction_agent import ExtractionAgent
from backend.app.agents.evidence_agent import EvidenceAgent
from backend.app.agents.timeline_agent import TimelineAgent
from backend.app.agents.appointment_agent import AppointmentAgent
from backend.app.agents.followup_agent import FollowupAgent
from backend.app.agents.briefing_agent import BriefingAgent

class CareNavigationState(BaseModel):
    patient_id: str
    patient_name: str = "Aarav Sharma"
    patient_identifier: str = "P-1001"
    document_id: str
    filename: str
    raw_content: str
    document_metadata: Dict[str, Any] = Field(default_factory=dict)
    extracted_information: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)
    appointments: List[Dict[str, Any]] = Field(default_factory=list)
    followups: List[Dict[str, Any]] = Field(default_factory=list)
    briefing: Optional[Dict[str, Any]] = None
    requires_review: bool = True
    completed_steps: List[str] = Field(default_factory=list)

class CareNavigationOrchestrator:
    """
    Agentic Orchestrator coordinating sequential and parallel execution:
    Document Agent -> Extraction Agent -> Evidence Agent -> Timeline Agent ->
    (Appointment Agent + Follow-up Agent) -> Briefing Agent -> Human Review Barrier
    """

    @classmethod
    def run_pipeline(
        cls,
        patient_id: str,
        patient_name: str,
        patient_identifier: str,
        document_id: str,
        filename: str,
        raw_content: str,
        existing_doc_types: Optional[List[str]] = None
    ) -> CareNavigationState:
        state = CareNavigationState(
            patient_id=patient_id,
            patient_name=patient_name,
            patient_identifier=patient_identifier,
            document_id=document_id,
            filename=filename,
            raw_content=raw_content
        )

        existing_types = existing_doc_types or []

        # 1. Document Agent
        doc_meta = DocumentAgent.process_document(state.filename, state.raw_content)
        state.document_metadata = doc_meta
        state.completed_steps.append("DOCUMENT_AGENT")

        # 2. Extraction Agent
        raw_facts = ExtractionAgent.extract_information(
            document_id=state.document_id,
            document_name=state.filename,
            document_type=doc_meta["document_type"],
            content=state.raw_content
        )
        state.completed_steps.append("EXTRACTION_AGENT")

        # 3. Evidence & Uncertainty Agent
        audited_facts = EvidenceAgent.audit_evidence(
            extracted_facts=raw_facts,
            document_text=state.raw_content,
            existing_doc_types=existing_types + [doc_meta["document_type"]]
        )
        state.extracted_information = audited_facts
        state.completed_steps.append("EVIDENCE_AGENT")

        # 4. Timeline Agent
        timeline_events = TimelineAgent.build_timeline_events(
            patient_id=state.patient_id,
            document_id=state.document_id,
            document_type=doc_meta["document_type"],
            document_date=doc_meta["document_date"],
            facts=audited_facts
        )
        state.timeline_events = timeline_events
        state.completed_steps.append("TIMELINE_AGENT")

        # 5. Appointment Agent & Follow-up Agent (Executed in parallel in workflow)
        has_referral = any("REFERRAL" in dt for dt in existing_types)
        apts = AppointmentAgent.process_appointments(
            patient_id=state.patient_id,
            document_id=state.document_id,
            document_text=state.raw_content,
            has_referral_on_file=has_referral
        )
        state.appointments = apts
        state.completed_steps.append("APPOINTMENT_AGENT")

        followups = FollowupAgent.extract_followups(
            patient_id=state.patient_id,
            document_id=state.document_id,
            document_text=state.raw_content
        )
        state.followups = followups
        state.completed_steps.append("FOLLOWUP_AGENT")

        # 6. Doctor Briefing Agent
        briefing = BriefingAgent.generate_briefing(
            patient_name=state.patient_name,
            patient_id=state.patient_id,
            patient_identifier=state.patient_identifier,
            documents=[{"filename": state.filename}],
            facts=audited_facts,
            appointments=apts,
            followups=followups
        )
        state.briefing = briefing
        state.completed_steps.append("BRIEFING_AGENT")

        state.requires_review = any(f.get("requires_human_review", False) for f in audited_facts)
        return state
