from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.database.connection import get_db
from backend.app.models.entities import AIReview, ExtractedInformation, AuditLog, User
from backend.app.schemas.dtos import ReviewRequest
from backend.app.auth.security import get_current_user, require_role

router = APIRouter(prefix="/reviews", tags=["Human Review"])

@router.post("")
def submit_human_review(
    req: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["CLINICIAN", "CARE_COORDINATOR", "ADMIN"]))
):
    fact = db.query(ExtractedInformation).filter(ExtractedInformation.id == req.item_id).first()
    original_info = fact.information if fact else "Item"

    review = AIReview(
        user_id=current_user.id,
        item_type=req.item_type,
        item_id=req.item_id,
        action=req.action,
        original_output={"information": original_info},
        edited_output=req.edited_output,
        review_comment=req.review_comment
    )
    db.add(review)

    # Update fact if applicable
    if fact:
        fact.review_status = req.action
        fact.requires_human_review = False
        if req.action == "EDITED" and req.edited_output and "information" in req.edited_output:
            fact.information = req.edited_output["information"]

    # Add audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action=f"INFORMATION_{req.action}",
        entity=req.item_type,
        entity_id=req.item_id,
        details=f"Human reviewer {current_user.full_name} marked item as {req.action}. Comment: {req.review_comment or 'None'}"
    )
    db.add(audit)
    db.commit()

    return {"status": "SUCCESS", "review_id": review.id, "action": req.action}

@router.get("")
def list_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AIReview).order_by(AIReview.timestamp.desc()).all()
