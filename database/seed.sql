-- =========================================================================
-- AI Healthcare Care-Navigation Agent: Demo Seed Data
-- =========================================================================

-- Seed Users (Password hash corresponds to 'Password123!')
INSERT INTO users (id, email, hashed_password, full_name, role, title, organization)
VALUES
('a0000000-0000-0000-0000-000000000001', 'coordinator@carenav.health', '$2b$12$K8y4rT6Fh6nC0bYt.e3G4O/kH3fP9mXg0yZ8vN7lM2wQ1vE9uJ5aO', 'Maya Patel, RN', 'CARE_COORDINATOR', 'Senior Clinical Care Coordinator', 'Metro Health Alliance'),
('a0000000-0000-0000-0000-000000000002', 'clinician@carenav.health', '$2b$12$K8y4rT6Fh6nC0bYt.e3G4O/kH3fP9mXg0yZ8vN7lM2wQ1vE9uJ5aO', 'Dr. Sarah Lin, MD', 'CLINICIAN', 'Attending Physician, Internal Medicine', 'St. Jude Academic Medical Center'),
('a0000000-0000-0000-0000-000000000003', 'aarav.sharma@demo.patient', '$2b$12$K8y4rT6Fh6nC0bYt.e3G4O/kH3fP9mXg0yZ8vN7lM2wQ1vE9uJ5aO', 'Aarav Sharma', 'PATIENT', 'Patient Portal Member', 'Patient Portal'),
('a0000000-0000-0000-0000-000000000004', 'admin@carenav.health', '$2b$12$K8y4rT6Fh6nC0bYt.e3G4O/kH3fP9mXg0yZ8vN7lM2wQ1vE9uJ5aO', 'David Foster', 'ADMIN', 'Lead Health Systems Administrator', 'Metro Health Alliance')
ON CONFLICT (id) DO NOTHING;

-- Seed Patient
INSERT INTO patients (id, patient_identifier, user_id, full_name, date_of_birth, gender, phone, emergency_contact, care_coordinator_id, primary_facility)
VALUES
('b0000000-0000-0000-0000-000000000001', 'P-1001', 'a0000000-0000-0000-0000-000000000003', 'Aarav Sharma', '1984-06-14', 'Male', '+1 (555) 234-8901', 'Sunita Sharma (Spouse) - +1 (555) 234-8902', 'a0000000-0000-0000-0000-000000000001', 'Metro Health Ambulatory Pavilion')
ON CONFLICT (id) DO NOTHING;

-- Seed Documents
INSERT INTO documents (id, patient_id, filename, document_type, upload_date, document_date, status, file_path, file_size, raw_text)
VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'lab_report_metabolic_panel.pdf', 'LAB_REPORT', '2026-09-10', '2026-09-10', 'PROCESSED', '/storage/docs/doc_101.pdf', '420 KB', 'Fasting Blood Glucose: 108 mg/dL\nHemoglobin A1c: 5.9%\nFollow-up fasting glucose panel recommended in 3 months.'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'clinical_note_internal_medicine.pdf', 'CLINICAL_NOTE', '2026-09-12', '2026-09-12', 'PROCESSED', '/storage/docs/doc_102.pdf', '310 KB', 'Encounter Date: 12 September 2026\nBlood Pressure: 126/82 mmHg\nCoordinate appointment with Cardiology consult clinic for routine baseline review.'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'prescription_documentation.pdf', 'PRESCRIPTION', '2026-09-15', '2026-09-15', 'PROCESSED', '/storage/docs/doc_103.pdf', '190 KB', 'Prescription Issue Date: 15 September 2026\n1. Metformin HCl 500 mg twice daily.\n2. Atorvastatin Calcium 10 mg daily.\nRefill coordination due on or before 14 October 2026.'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'appointment_confirmation_slip.pdf', 'APPOINTMENT', '2026-09-20', '2026-09-20', 'PROCESSED', '/storage/docs/doc_104.pdf', '145 KB', 'Consulting Provider: Dr. Robert Harrison\nAppointment Date: 15 October 2026, 10:30 AM EDT\nLocation: Pavilion B, Suite 402.\nReferral slip must be signed before check-in.')
ON CONFLICT (id) DO NOTHING;

-- Seed Appointments
INSERT INTO appointments (id, patient_id, doctor_name, department, appointment_date, appointment_time, location, appointment_type, source_document_id, status, preparation_checklist)
VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Dr. Robert Harrison, MD, FACC', 'Division of Cardiovascular Medicine', '2026-10-15', '10:30 AM EDT', 'Pavilion B, Suite 402, St. Jude Academic Medical Center', 'Specialty Outpatient Consultation', 'c0000000-0000-0000-0000-000000000004', 'UPCOMING', '{
    "available_documents": ["Previous internal medicine clinical note (12 Sep 2026)", "Laboratory comprehensive metabolic panel (10 Sep 2026)", "Active pharmacy medication documentation (15 Sep 2026)"],
    "potentially_missing": ["Signed Cardiology referral authorization slip from Dr. Sarah Lin was not found in uploaded records archive."],
    "preparation_steps": ["Bring printed copy of metabolic panel results.", "Bring active medication list including OTC supplements.", "Arrive 15 minutes prior for registration verification."]
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Follow-ups
INSERT INTO followups (id, patient_id, description, followup_date, source_document_id, status, assigned_to, notes)
VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Coordinate pharmacy refill synchronization for Metformin and Atorvastatin before 14 October 2026.', '2026-10-14', 'c0000000-0000-0000-0000-000000000003', 'PENDING', 'a0000000-0000-0000-0000-000000000001', 'Medication synchronization protocol active.')
ON CONFLICT (id) DO NOTHING;

-- Seed Audit Log
INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, details)
VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Maya Patel, RN', 'CARE_COORDINATOR', 'LOGIN', 'UserSession', 'a0000000-0000-0000-0000-000000000001', 'Authenticated via JWT token successfully.'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Maya Patel, RN', 'CARE_COORDINATOR', 'DOCUMENT_UPLOADED', 'Document', 'c0000000-0000-0000-0000-000000000001', 'Uploaded lab_report_metabolic_panel.pdf for patient Aarav Sharma (P-1001).')
ON CONFLICT (id) DO NOTHING;
