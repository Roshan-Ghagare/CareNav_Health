from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.entities import Appointment, User
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("")
def list_appointments(
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    return query.order_by(Appointment.appointment_date.asc()).all()
