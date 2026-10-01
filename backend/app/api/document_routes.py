from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.app.database.connection import get_db
from backend.app.models.entities import Document, Patient, AuditLog, User
from backend.app.schemas.dtos import DocumentResponse, DocumentUpload
from backend.app.auth.security import get_current_user, require_role
from backend.app.agents.orchestrator import CareNavigationOrchestrator

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document)
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
    return query.order_by(Document.created_at.desc()).all()

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    doc_in: DocumentUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CARE_COORDINATOR", "PATIENT", "ADMIN"]))
):
    patient = db.query(Patient).filter(Patient.id == doc_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Target patient not found.")

    doc = Document(
        patient_id=doc_in.patient_id,
        filename=doc_in.filename,
        document_type=doc_in.document_type,
        upload_date=date.today(),
        document_date=doc_in.document_date or date.today(),
        status="PENDING",
        raw_text=doc_in.raw_text,
        file_size=f"{max(1, len(doc_in.raw_text) // 1024)} KB"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="DOCUMENT_UPLOADED",
        entity="Document",
        entity_id=doc.id,
        details=f"Uploaded '{doc.filename}' ({doc.document_type}) for patient {patient.full_name}"
    )
    db.add(audit)
    db.commit()

    return doc

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CARE_COORDINATOR", "ADMIN"]))
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    db.delete(doc)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="DOCUMENT_DELETED",
        entity="Document",
        entity_id=document_id,
        details=f"Document {doc.filename} deleted."
    )
    db.add(audit)
    db.commit()

    return {"message": f"Document {document_id} successfully deleted."}
