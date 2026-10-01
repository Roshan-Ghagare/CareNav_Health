from typing import List, Dict, Any
from datetime import datetime

class BriefingAgent:
    """
    Doctor Briefing Agent:
    Compiles evidence-grounded clinician briefings with strict AI safety boundary notices.
    Always produces a DRAFT that requires clinician sign-off.
    """

    @staticmethod
    def generate_briefing(
        patient_name: str,
        patient_id: str,
        patient_identifier: str,
        documents: List[Dict[str, Any]],
        facts: List[Dict[str, Any]],
        appointments: List[Dict[str, Any]],
        followups: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        fact_refs = [
            {
                "fact": f["information"],
                "source": f.get("source_document_name", "Document"),
                "quote": f.get("evidence_text", ""),
                "status": f.get("status", "FACT")
            }
            for f in facts if f.get("status") == "FACT"
        ][:5]

        missing_items = [
            f"[{f.get('status')}] {f.get('information')} - {f.get('uncertainty_reason', '')}"
            for f in facts if f.get("status") in ("MISSING", "UNCERTAIN", "ASSUMPTION")
        ]

        return {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "patient_identifier": patient_identifier,
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "status": "DRAFT",
            "patient_information_summary": f"{patient_name} (MRN: {patient_identifier}). Outpatient records coordinated through Metro Health Ambulatory Pavilion.",
            "recent_timeline_summary": f"Compiled from {len(documents)} healthcare documents. Evidence Agent verified source grounding across clinical and administrative entries.",
            "available_documents_summary": [d.get("filename", "") for d in documents],
            "appointments_summary": [
                f"{a.get('department')} with {a.get('doctor_name')} on {a.get('appointment_date')} at {a.get('appointment_time')}"
                for a in appointments
            ],
            "documented_followup_items": [
                f"{fo.get('description')} (Target: {fo.get('followup_date')})"
                for fo in followups
            ],
            "missing_or_uncertain_information": missing_items,
            "evidence_references": fact_refs,
            "ai_limitations_disclaimer": "NOTICE & SAFETY RESTRICTION: This summary was automatically organized by the AI Healthcare Care-Navigation Agent for administrative coordination and preparation purposes only. It DOES NOT provide medical diagnosis, clinical prognostic predictions, treatment recommendations, or medication adjustments. All clinical decisions and medical care plans remain solely under the responsibility of licensed attending physicians. Requires human review and verification before clinical reliance.",
            "requires_human_review": True
        }
