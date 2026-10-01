-- =========================================================================
-- AI Healthcare Care-Navigation Agent: PostgreSQL Database Schema
-- Safety Notice: Strictly for care coordination and administrative organization.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PATIENT', 'CARE_COORDINATOR', 'CLINICIAN', 'ADMIN')),
    title VARCHAR(150),
    organization VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_identifier VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'P-1001'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    care_coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    primary_facility VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('LAB_REPORT', 'PRESCRIPTION', 'CLINICAL_NOTE', 'APPOINTMENT', 'REFERRAL', 'DISCHARGE', 'OTHER')),
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    document_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
    file_path VARCHAR(500),
    file_size VARCHAR(50),
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extracted Information Table
CREATE TABLE IF NOT EXISTS extracted_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    source_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'PATIENT_INFORMATION', 'APPOINTMENT', 'PRESCRIPTION', 'LAB_REPORT',
        'CLINICAL_NOTE', 'FOLLOWUP', 'DOCTOR_INFORMATION', 'FACILITY_INFORMATION',
        'ADMINISTRATIVE_INFORMATION'
    )),
    information TEXT NOT NULL,
    source_location VARCHAR(150),
    confidence NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    requires_human_review BOOLEAN DEFAULT FALSE,
    review_status VARCHAR(50) DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'APPROVED', 'EDITED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Evidence Table (Traceability link between source and extracted fact)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extracted_information_id UUID NOT NULL REFERENCES extracted_information(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    verbatim_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('FACT', 'UNCERTAIN', 'MISSING', 'ASSUMPTION')),
    confidence NUMERIC(4, 3) NOT NULL,
    uncertainty_reason TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'FACT' CHECK (status IN ('FACT', 'UNCERTAIN', 'MISSING', 'ASSUMPTION')),
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    appointment_type VARCHAR(100) NOT NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED', 'UNKNOWN')),
    preparation_checklist JSONB DEFAULT '{"available_documents": [], "potentially_missing": [], "preparation_steps": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Follow-ups Table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    followup_date DATE NOT NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'OVERDUE', 'UNKNOWN')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. AI Reviews Table (Human-in-the-Loop Audit Table)
CREATE TABLE IF NOT EXISTS ai_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'EXTRACTED_FACT' or 'DOCTOR_BRIEFING'
    item_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVED', 'EDITED', 'REJECTED')),
    original_output JSONB NOT NULL,
    edited_output JSONB,
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-frequency queries
CREATE INDEX idx_patients_identifier ON patients(patient_identifier);
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_extracted_patient ON extracted_information(patient_id);
CREATE INDEX idx_evidence_extracted ON evidence(extracted_information_id);
CREATE INDEX idx_timeline_patient_date ON timeline_events(patient_id, event_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_followups_patient ON followups(patient_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
