from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    full_name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    title: Optional[str] = None
    organization: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    title: Optional[str] = None
    organization: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    patient_identifier: str
    full_name: str
    date_of_birth: date
    gender: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    primary_facility: Optional[str] = None

class PatientResponse(BaseModel):
    id: str
    patient_identifier: str
    full_name: str
    date_of_birth: date
    gender: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    primary_facility: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentUpload(BaseModel):
    patient_id: str
    filename: str
    document_type: str
    raw_text: str
    document_date: Optional[date] = None

class DocumentResponse(BaseModel):
    id: str
    patient_id: str
    filename: str
    document_type: str
    upload_date: date
    document_date: Optional[date]
    status: str
    file_size: Optional[str]

    class Config:
        from_attributes = True

class FactResponse(BaseModel):
    id: str
    patient_id: str
    category: str
    information: str
    source_location: Optional[str]
    confidence: float
    status: str
    verbatim_text: str
    requires_human_review: bool
    review_status: str

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_name: str
    department: str
    appointment_date: date
    appointment_time: str
    location: str
    appointment_type: str
    source_document_id: Optional[str] = None

class FollowupCreate(BaseModel):
    patient_id: str
    description: str
    followup_date: date
    source_document_id: Optional[str] = None

class ReviewRequest(BaseModel):
    item_id: str
    item_type: str # 'EXTRACTED_FACT' | 'DOCTOR_BRIEFING'
    action: str # 'APPROVED' | 'EDITED' | 'REJECTED'
    edited_output: Optional[Dict[str, Any]] = None
    review_comment: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    user_name: str
    user_role: str
    action: str
    entity: str
    entity_id: str
    details: str

    class Config:
        from_attributes = True
