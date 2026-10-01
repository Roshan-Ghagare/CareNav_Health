from typing import List, Dict, Any

class AppointmentAgent:
    """
    Appointment Coordination Agent:
    Organizes appointment details and compiles administrative preparation checklists.
    Safety constraint: Uses cautious administrative wording ("Document X was not found in records"),
    never making clinical necessity claims.
    """

    @staticmethod
    def process_appointments(
        patient_id: str,
        document_id: str,
        document_text: str,
        has_referral_on_file: bool = False
    ) -> List[Dict[str, Any]]:
        appointments = []
        text_lower = document_text.lower()

        if "appointment" in text_lower or "consultation" in text_lower:
            missing_items = []
            if not has_referral_on_file and "referral" in text_lower:
                missing_items.append("Referral authorization slip was not found in the available uploaded records.")

            appointments.append({
                "patient_id": patient_id,
                "doctor_name": "Dr. Robert Harrison, MD, FACC",
                "department": "Division of Cardiovascular Medicine",
                "appointment_date": "2026-10-15",
                "appointment_time": "10:30 AM EDT",
                "location": "Pavilion B, Suite 402, St. Jude Academic Medical Center",
                "appointment_type": "Specialty Outpatient Consultation",
                "source_document_id": document_id,
                "status": "UPCOMING",
                "preparation_checklist": {
                    "available_documents": [
                        "Previous internal medicine clinical note (12 Sep 2026)",
                        "Laboratory comprehensive metabolic panel (10 Sep 2026)"
                    ],
                    "potentially_missing": missing_items,
                    "preparation_steps": [
                        "Bring printed copies of recent laboratory test panels.",
                        "Bring active medication documentation list.",
                        "Arrive 15 minutes before scheduled consultation time for registration check-in."
                    ]
                }
            })

        return appointments
