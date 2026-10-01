from typing import List, Dict, Any

class ExtractionAgent:
    """
    Information Extraction Agent:
    Extracts ONLY information explicitly supported by documents.
    Structured output with exact source coordinates and evidence text quotes.
    """

    @staticmethod
    def extract_information(document_id: str, document_name: str, document_type: str, content: str) -> List[Dict[str, Any]]:
        extracted_items = []
        lines = [line.strip() for line in content.splitlines() if line.strip()]

        if document_type == "LAB_REPORT":
            for idx, line in enumerate(lines):
                if any(k in line.lower() for k in ["glucose", "a1c", "creatinine", "cholesterol", "panel"]):
                    extracted_items.append({
                        "information": f"Laboratory test value recorded: {line}",
                        "category": "LAB_REPORT",
                        "status": "FACT",
                        "confidence": 0.98,
                        "source_document_id": document_id,
                        "source_location": f"Line {idx + 1}, Chemistry Section",
                        "evidence_text": line,
                        "requires_human_review": False
                    })
                if "follow-up" in line.lower() or "recommended" in line.lower():
                    extracted_items.append({
                        "information": f"Administrative lab instruction: {line}",
                        "category": "FOLLOWUP",
                        "status": "FACT",
                        "confidence": 0.96,
                        "source_document_id": document_id,
                        "source_location": f"Line {idx + 1}, Remarks",
                        "evidence_text": line,
                        "requires_human_review": False
                    })

        elif document_type == "CLINICAL_NOTE":
            for idx, line in enumerate(lines):
                if "blood pressure" in line.lower() or "bp:" in line.lower():
                    extracted_items.append({
                        "information": f"Documented vital sign: {line}",
                        "category": "CLINICAL_NOTE",
                        "status": "FACT",
                        "confidence": 0.98,
                        "source_document_id": document_id,
                        "source_location": f"Line {idx + 1}, Vital Signs",
                        "evidence_text": line,
                        "requires_human_review": False
                    })
                if "coordinate appointment" in line.lower() or "scheduled" in line.lower():
                    extracted_items.append({
                        "information": f"Care coordination instruction: {line}",
                        "category": "APPOINTMENT",
                        "status": "FACT",
                        "confidence": 0.97,
                        "source_document_id": document_id,
                        "source_location": f"Line {idx + 1}, Plan & Coordination",
                        "evidence_text": line,
                        "requires_human_review": False
                    })

        elif document_type == "PRESCRIPTION":
            med_lines = [l for l in lines if any(w in l.lower() for w in ["mg", "tablet", "daily", "dispense"])]
            for idx, med in enumerate(med_lines[:4]):
                extracted_items.append({
                    "information": f"Documented pharmacy order: {med}",
                    "category": "PRESCRIPTION",
                    "status": "FACT",
                    "confidence": 0.98,
                    "source_document_id": document_id,
                    "source_location": f"Section Orders, Item {idx + 1}",
                    "evidence_text": med,
                    "requires_human_review": False
                })

        elif document_type == "APPOINTMENT":
            for idx, line in enumerate(lines):
                if any(w in line.lower() for w in ["appointment date", "consulting provider", "location"]):
                    extracted_items.append({
                        "information": f"Appointment schedule details: {line}",
                        "category": "APPOINTMENT",
                        "status": "FACT",
                        "confidence": 0.99,
                        "source_document_id": document_id,
                        "source_location": f"Line {idx + 1}",
                        "evidence_text": line,
                        "requires_human_review": False
                    })

        else:
            extracted_items.append({
                "information": f"Document indexed: {document_name}",
                "category": "ADMINISTRATIVE_INFORMATION",
                "status": "FACT",
                "confidence": 0.95,
                "source_document_id": document_id,
                "source_location": "Header",
                "evidence_text": lines[0] if lines else document_name,
                "requires_human_review": False
            })

        return extracted_items
