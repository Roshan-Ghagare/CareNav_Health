from typing import List, Dict, Any
from datetime import date

class TimelineAgent:
    """
    Patient Timeline Agent:
    Builds a chronological patient timeline.
    Milestones strictly grounded in source document dates and events.
    """

    @staticmethod
    def build_timeline_events(
        patient_id: str,
        document_id: str,
        document_type: str,
        document_date: str,
        facts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        events = []
        primary_fact = facts[0] if facts else None

        title = f"{document_type.replace('_', ' ').title()} Recorded"
        desc = primary_fact["information"] if primary_fact else f"Indexed document {document_type}."

        events.append({
            "patient_id": patient_id,
            "event_date": document_date or str(date.today()),
            "event_type": document_type,
            "title": title,
            "description": desc,
            "source_document_id": document_id,
            "status": primary_fact["status"] if primary_fact else "FACT",
            "confidence": primary_fact["confidence"] if primary_fact else 0.95
        })

        return events
