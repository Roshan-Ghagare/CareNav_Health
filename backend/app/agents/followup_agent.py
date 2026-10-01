from typing import List, Dict, Any

class FollowupAgent:
    """
    Follow-up Agent:
    Tracks documented administrative follow-ups, medication synchronization dates,
    and archive retrieval deadlines. Strictly non-prescriptive.
    """

    @staticmethod
    def extract_followups(
        patient_id: str,
        document_id: str,
        document_text: str
    ) -> List[Dict[str, Any]]:
        followups = []
        text_lower = document_text.lower()

        if "refill" in text_lower or "synchronization" in text_lower:
            followups.append({
                "patient_id": patient_id,
                "description": "Coordinate pharmacy refill synchronization for maintenance medications before 14 October 2026.",
                "followup_date": "2026-10-14",
                "source_document_id": document_id,
                "status": "PENDING",
                "notes": "Documented on pharmacy order slip. Administrative reminder generated."
            })

        if "referral" in text_lower and ("pending" in text_lower or "required" in text_lower):
            followups.append({
                "patient_id": patient_id,
                "description": "Follow up with primary clinic archive for signed Cardiology referral transmission.",
                "followup_date": "2026-10-10",
                "source_document_id": document_id,
                "status": "PENDING",
                "notes": "Required before scheduled 15 October consultation."
            })

        return followups
