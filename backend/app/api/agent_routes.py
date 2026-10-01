from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from backend.app.database.connection import get_db
from backend.app.models.entities import (
    Document,
    Patient,
    ExtractedInformation,
    Evidence,
    TimelineEvent,
    Appointment,
    Followup,
    AuditLog,
    User
)
from backend.app.auth.security import get_current_user, require_role
from backend.app.agents.orchestrator import CareNavigationOrchestrator
from datetime import datetime

router = APIRouter(prefix="/agents", tags=["AI Agents"])

class ProcessDocumentRequest(BaseModel):
    document_id: str

@router.post("/process-document")
def process_document_pipeline(
    req: ProcessDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CARE_COORDINATOR", "ADMIN"]))
):
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    patient = db.query(Patient).filter(Patient.id == doc.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    doc.status = "PROCESSING"
    db.commit()

    # Retrieve existing document types for context
    existing_docs = db.query(Document).filter(
        Document.patient_id == patient.id,
        Document.id != doc.id
    ).all()
    existing_types = [d.document_type for d in existing_docs]

    # Run LangGraph Agent Pipeline
    state = CareNavigationOrchestrator.run_pipeline(
        patient_id=patient.id,
        patient_name=patient.full_name,
        patient_identifier=patient.patient_identifier,
        document_id=doc.id,
        filename=doc.filename,
        raw_content=doc.raw_text or "",
        existing_doc_types=existing_types
    )

    # Persist extracted facts and evidence
    for fact in state.extracted_information:
        ext_info = ExtractedInformation(
            patient_id=patient.id,
            source_document_id=doc.id,
            category=fact.get("category", "ADMINISTRATIVE_INFORMATION"),
            information=fact.get("information", ""),
            source_location=fact.get("source_location", ""),
            confidence=fact.get("confidence", 0.95),
            requires_human_review=fact.get("requires_human_review", False),
            review_status="PENDING" if fact.get("requires_human_review") else "APPROVED"
        )
        db.add(ext_info)
        db.flush()

        evidence = Evidence(
            extracted_information_id=ext_info.id,
            document_id=doc.id,
            verbatim_text=fact.get("evidence_text", ""),
            status=fact.get("status", "FACT"),
            confidence=fact.get("confidence", 0.95),
            uncertainty_reason=fact.get("uncertainty_reason")
        )
        db.add(evidence)

    # Persist timeline events
    for evt in state.timeline_events:
        timeline = TimelineEvent(
            patient_id=patient.id,
            event_date=datetime.strptime(evt["event_date"], "%Y-%m-%d").date() if "-" in evt["event_date"] else doc.upload_date,
            event_type=evt.get("event_type", "ADMINISTRATIVE"),
            title=evt.get("title", "Milestone"),
            description=evt.get("description", ""),
            source_document_id=doc.id,
            status=evt.get("status", "FACT"),
            confidence=evt.get("confidence", 0.95)
        )
        db.add(timeline)

    # Update document status
    doc.status = "PROCESSED"
    db.commit()

    # Record Audit
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="DOCUMENT_PROCESSED",
        entity="AgentOrchestrator",
        entity_id=doc.id,
        details=f"Document '{doc.filename}' processed through 7-agent pipeline. {len(state.extracted_information)} items extracted."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "COMPLETED",
        "document_id": doc.id,
        "extracted_facts_count": len(state.extracted_information),
        "timeline_events_count": len(state.timeline_events),
        "requires_review": state.requires_review,
        "completed_steps": state.completed_steps
    }
