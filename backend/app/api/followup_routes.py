from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.entities import Followup, User
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/followups", tags=["Follow-ups"])

@router.get("")
def list_followups(
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Followup)
    if patient_id:
        query = query.filter(Followup.patient_id == patient_id)
    return query.order_by(Followup.followup_date.asc()).all()

@router.patch("/{followup_id}")
def update_followup_status(
    followup_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fol = db.query(Followup).filter(Followup.id == followup_id).first()
    if not fol:
        raise HTTPException(status_code=404, detail="Followup item not found.")
    fol.status = status
    db.commit()
    return fol
