from typing import List, Dict, Any

class EvidenceAgent:
    """
    Evidence & Uncertainty Engine:
    Categorizes information items into:
    - FACT: Explicitly and unambiguously stated in source text.
    - UNCERTAIN: Document contains ambiguous or incomplete information.
    - MISSING: Expected administrative documents/records cannot be found.
    - ASSUMPTION: Inferred by AI, requires explicit human review.
    """

    @staticmethod
    def audit_evidence(
        extracted_facts: List[Dict[str, Any]],
        document_text: str,
        existing_doc_types: List[str]
    ) -> List[Dict[str, Any]]:
        audited_facts = []
        text_lower = document_text.lower()

        for item in extracted_facts:
            # Check for ambiguity markers
            if any(term in item["evidence_text"].lower() for term in ["approx", "roughly", "pending", "unclear", "outside facility"]):
                item["status"] = "UNCERTAIN"
                item["confidence"] = 0.65
                item["requires_human_review"] = True
                item["uncertainty_reason"] = "Information in source document contains ambiguous qualifiers or outside institution references."
            audited_facts.append(item)

        # Detect missing administrative records
        if "referral" in text_lower and not any("REFERRAL" in dt for dt in existing_doc_types):
            audited_facts.append({
                "information": "Documented referral authorization slip was not found in uploaded patient records archive.",
                "category": "ADMINISTRATIVE_INFORMATION",
                "status": "MISSING",
                "confidence": 0.94,
                "source_document_id": extracted_facts[0]["source_document_id"] if extracted_facts else "",
                "source_location": "Encounter prerequisite instructions",
                "evidence_text": "Referral slip required before consultation check-in. [Document absent from uploaded archive]",
                "requires_human_review": True,
                "uncertainty_reason": "Encounter notes cited referral prerequisite, but no corresponding signed referral document was located in the repository."
            })

        return audited_facts
