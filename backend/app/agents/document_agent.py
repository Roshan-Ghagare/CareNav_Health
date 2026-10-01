import re
from typing import Dict, Any, Optional

class DocumentAgent:
    """
    Document Agent:
    Responsibilities:
    1. Identify document type (LAB_REPORT, PRESCRIPTION, CLINICAL_NOTE, APPOINTMENT, REFERRAL, etc.)
    2. Extract structural metadata
    3. Determine document date if explicitly stated in text (NEVER invent dates)
    4. Send document to extraction agent preserving source information
    """

    @staticmethod
    def process_document(filename: str, content: str) -> Dict[str, Any]:
        doc_type = DocumentAgent._classify_type(filename, content)
        doc_date = DocumentAgent._extract_explicit_date(content)

        return {
            "filename": filename,
            "document_type": doc_type,
            "document_date": doc_date,
            "content_length": len(content),
            "line_count": len(content.splitlines()),
            "status": "METADATA_EXTRACTED"
        }

    @staticmethod
    def _classify_type(filename: str, content: str) -> str:
        fn = filename.lower()
        cnt = content.lower()

        if any(w in fn or w in cnt for w in ["lab", "metabolic", "pathology", "panel", "glucose", "creatinine"]):
            return "LAB_REPORT"
        if any(w in fn or w in cnt for w in ["presc", "pharmacy", "rx", "dispense", "refill", "tablet"]):
            return "PRESCRIPTION"
        if any(w in fn or w in cnt for w in ["appointment", "booking confirmation", "consultation scheduled"]):
            return "APPOINTMENT"
        if any(w in fn or w in cnt for w in ["referral", "authorization slip", "referred to"]):
            return "REFERRAL"
        if any(w in fn or w in cnt for w in ["discharge", "observation summary"]):
            return "DISCHARGE"
        if any(w in fn or w in cnt for w in ["clinical note", "encounter", "chief concern", "physical examination"]):
            return "CLINICAL_NOTE"
        return "OTHER"

    @staticmethod
    def _extract_explicit_date(content: str) -> Optional[str]:
        # Cautious regex for explicit date extraction
        date_pattern = r"(?:Date(?:\sIssued|\sRecorded)?:\s*|Collection Date:\s*|Encounter Date:\s*)?(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})"
        match = re.search(date_pattern, content, re.IGNORECASE)
        if match:
            return match.group(1)
        iso_match = re.search(r"(\d{4}-\d{2}-\d{2})", content)
        if iso_match:
            return iso_match.group(1)
        return None
