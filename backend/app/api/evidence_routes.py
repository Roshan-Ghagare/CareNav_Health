from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.entities import ExtractedInformation, Evidence, Document, User
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/evidence", tags=["Evidence & Uncertainty"])

@router.get("")
def list_evidence(
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(
        ExtractedInformation,
        Evidence,
        Document.filename
    ).join(
        Evidence, Evidence.extracted_information_id == ExtractedInformation.id
    ).join(
        Document, Document.id == ExtractedInformation.source_document_id
    )

    if patient_id:
        query = query.filter(ExtractedInformation.patient_id == patient_id)
    if status:
        query = query.filter(Evidence.status == status)

    results = query.all()
    output = []
    for info, ev, doc_name in results:
        output.append({
            "fact_id": info.id,
            "patient_id": info.patient_id,
            "category": info.category,
            "information": info.information,
            "source_location": info.source_location,
            "confidence": info.confidence,
            "requires_human_review": info.requires_human_review,
            "review_status": info.review_status,
            "evidence_id": ev.id,
            "verbatim_text": ev.verbatim_text,
            "status": ev.status,
            "uncertainty_reason": ev.uncertainty_reason,
            "source_document_name": doc_name
        })

    return output
