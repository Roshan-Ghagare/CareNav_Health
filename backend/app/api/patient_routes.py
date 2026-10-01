from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.entities import Patient, TimelineEvent, User
from backend.app.schemas.dtos import PatientCreate, PatientResponse
from backend.app.auth.security import get_current_user, require_role

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "PATIENT":
        return db.query(Patient).filter(Patient.user_id == current_user.id).all()
    return db.query(Patient).all()

@router.post("", response_model=PatientResponse)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CARE_COORDINATOR", "ADMIN"]))
):
    existing = db.query(Patient).filter(Patient.patient_identifier == patient_in.patient_identifier).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient identifier already exists.")

    patient = Patient(
        patient_identifier=patient_in.patient_identifier,
        full_name=patient_in.full_name,
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        phone=patient_in.phone,
        emergency_contact=patient_in.emergency_contact,
        primary_facility=patient_in.primary_facility,
        care_coordinator_id=current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return patient

@router.get("/{patient_id}/timeline")
def get_patient_timeline(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(TimelineEvent).filter(
        TimelineEvent.patient_id == patient_id
    ).order_by(TimelineEvent.event_date.desc()).all()
    return events
