import pytest
from backend.app.agents.document_agent import DocumentAgent
from backend.app.agents.extraction_agent import ExtractionAgent
from backend.app.agents.evidence_agent import EvidenceAgent
from backend.app.agents.timeline_agent import TimelineAgent
from backend.app.agents.appointment_agent import AppointmentAgent
from backend.app.agents.followup_agent import FollowupAgent
from backend.app.agents.briefing_agent import BriefingAgent
from backend.app.agents.orchestrator import CareNavigationOrchestrator

def test_document_agent_classification_and_date():
    content = "Collection Date: 10 September 2026\nMETABOLIC PANEL\nFasting Blood Glucose: 108 mg/dL"
    result = DocumentAgent.process_document("lab_report.pdf", content)
    assert result["document_type"] == "LAB_REPORT"
    assert result["document_date"] == "10 September 2026"

def test_extraction_agent_structured_facts():
    content = "Fasting Blood Glucose: 108 mg/dL\nHemoglobin A1c: 5.9%"
    facts = ExtractionAgent.extract_information("doc-1", "lab.pdf", "LAB_REPORT", content)
    assert len(facts) >= 2
    assert any("Glucose" in f["information"] for f in facts)
    assert facts[0]["status"] == "FACT"
    assert facts[0]["confidence"] >= 0.95

def test_evidence_agent_uncertainty_and_missing_detection():
    facts = [{
        "information": "Glucose level recorded",
        "category": "LAB_REPORT",
        "status": "FACT",
        "confidence": 0.98,
        "source_document_id": "doc-1",
        "evidence_text": "Fasting Blood Glucose: 108 mg/dL"
    }]
    content = "Appointment scheduled. Referral slip must be signed before check-in."
    audited = EvidenceAgent.audit_evidence(facts, content, existing_doc_types=["LAB_REPORT"])
    
    missing_facts = [f for f in audited if f["status"] == "MISSING"]
    assert len(missing_facts) > 0
    assert "referral" in missing_facts[0]["information"].lower()
    assert missing_facts[0]["requires_human_review"] is True

def test_timeline_agent_creation():
    facts = [{
        "information": "Consultation with Dr. Sarah Lin",
        "status": "FACT",
        "confidence": 0.98
    }]
    events = TimelineAgent.build_timeline_events(
        patient_id="pat-1",
        document_id="doc-1",
        document_type="CLINICAL_NOTE",
        document_date="2026-09-12",
        facts=facts
    )
    assert len(events) == 1
    assert events[0]["event_type"] == "CLINICAL_NOTE"
    assert events[0]["event_date"] == "2026-09-12"

def test_appointment_preparation_checklist():
    content = "Appointment scheduled for 15 October 2026 at 10:30 AM with Dr. Robert Harrison. Referral required."
    apts = AppointmentAgent.process_appointments("pat-1", "doc-1", content, has_referral_on_file=False)
    assert len(apts) == 1
    prep = apts[0]["preparation_checklist"]
    assert len(prep["potentially_missing"]) > 0
    assert "referral" in prep["potentially_missing"][0].lower()
    # Invariant: Never clinical necessity claims
    assert "patient medically needs" not in prep["potentially_missing"][0].lower()

def test_followup_agent_extraction():
    content = "Prescription Refill coordination due on or before 14 October 2026."
    followups = FollowupAgent.extract_followups("pat-1", "doc-1", content)
    assert len(followups) >= 1
    assert "14 October 2026" in followups[0]["description"]

def test_briefing_agent_disclaimer():
    briefing = BriefingAgent.generate_briefing(
        patient_name="Aarav Sharma",
        patient_id="pat-1",
        patient_identifier="P-1001",
        documents=[{"filename": "lab.pdf"}],
        facts=[{"information": "Blood glucose 108", "status": "FACT", "evidence_text": "108 mg/dL"}],
        appointments=[],
        followups=[]
    )
    assert briefing["status"] == "DRAFT"
    assert "DOES NOT provide medical diagnosis" in briefing["ai_limitations_disclaimer"]
    assert briefing["requires_human_review"] is True

def test_care_navigation_orchestrator_end_to_end():
    state = CareNavigationOrchestrator.run_pipeline(
        patient_id="pat-1001",
        patient_name="Aarav Sharma",
        patient_identifier="P-1001",
        document_id="doc-104",
        filename="appointment_slip.pdf",
        raw_content="Booking Confirmation Date: 20 September 2026. Appointment with Dr. Robert Harrison on 15 October 2026 at 10:30 AM. Referral slip must be signed.",
        existing_doc_types=["LAB_REPORT"]
    )
    assert len(state.completed_steps) == 7
    assert len(state.extracted_information) > 0
    assert state.briefing is not None
    assert state.briefing["status"] == "DRAFT"
