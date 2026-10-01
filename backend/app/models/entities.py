import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    DateTime,
    Boolean,
    Float,
    ForeignKey,
    JSON
)
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # 'PATIENT', 'CARE_COORDINATOR', 'CLINICIAN', 'ADMIN'
    title = Column(String(150), nullable=True)
    organization = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patients = relationship("Patient", back_populates="care_coordinator", foreign_keys="[Patient.care_coordinator_id]")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_identifier = Column(String(50), unique=True, nullable=False, index=True) # e.g. 'P-1001'
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    care_coordinator_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    primary_facility = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    care_coordinator = relationship("User", foreign_keys=[care_coordinator_id])
    documents = relationship("Document", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="patient", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    document_type = Column(String(50), nullable=False) # LAB_REPORT, PRESCRIPTION, CLINICAL_NOTE, APPOINTMENT, etc.
    upload_date = Column(Date, default=date.today)
    document_date = Column(Date, nullable=True) # Explicit date extracted from document
    status = Column(String(50), default="PENDING") # PENDING, PROCESSING, PROCESSED, FAILED
    file_path = Column(String(500), nullable=True)
    file_size = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="documents")
    extracted_facts = relationship("ExtractedInformation", back_populates="source_document", cascade="all, delete-orphan")

class ExtractedInformation(Base):
    __tablename__ = "extracted_information"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    source_document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    information = Column(Text, nullable=False)
    source_location = Column(String(150), nullable=True)
    confidence = Column(Float, nullable=False)
    requires_human_review = Column(Boolean, default=False)
    review_status = Column(String(50), default="PENDING") # PENDING, APPROVED, EDITED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    source_document = relationship("Document", back_populates="extracted_facts")
    evidence_items = relationship("Evidence", back_populates="extracted_fact", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    extracted_information_id = Column(String(36), ForeignKey("extracted_information.id"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    verbatim_text = Column(Text, nullable=False)
    status = Column(String(50), nullable=False) # FACT, UNCERTAIN, MISSING, ASSUMPTION
    confidence = Column(Float, nullable=False)
    uncertainty_reason = Column(Text, nullable=True)
    verified_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    extracted_fact = relationship("ExtractedInformation", back_populates="evidence_items")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    event_date = Column(Date, nullable=False)
    event_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    status = Column(String(50), default="FACT") # FACT, UNCERTAIN, MISSING, ASSUMPTION
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="timeline_events")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    appointment_type = Column(String(100), nullable=False)
    source_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    status = Column(String(50), default="UPCOMING") # UPCOMING, COMPLETED, CANCELLED, UNKNOWN
    preparation_checklist = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")

class Followup(Base):
    __tablename__ = "followups"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    followup_date = Column(Date, nullable=False)
    source_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, COMPLETED, OVERDUE, UNKNOWN
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="followups")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIReview(Base):
    __tablename__ = "ai_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    item_type = Column(String(50), nullable=False) # 'EXTRACTED_FACT' or 'DOCTOR_BRIEFING'
    item_id = Column(String(36), nullable=False)
    action = Column(String(50), nullable=False) # 'APPROVED', 'EDITED', 'REJECTED'
    original_output = Column(JSON, nullable=False)
    edited_output = Column(JSON, nullable=True)
    review_comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    user_name = Column(String(255), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
