# REST API Documentation

The backend exposes RESTful endpoints with automatic OpenAPI Swagger documentation accessible at:
`http://localhost:8000/docs`

## 1. Authentication

### `POST /api/auth/register`
Register a new user account.
```json
{
  "email": "coordinator@carenav.health",
  "password": "Password123!",
  "full_name": "Maya Patel, RN",
  "role": "CARE_COORDINATOR",
  "title": "Senior Clinical Care Coordinator",
  "organization": "Metro Health Alliance"
}
```

### `POST /api/auth/login`
Authenticate user and obtain a JWT bearer token.
- Format: `multipart/form-data` or URL-encoded form data with `username` and `password`.
- Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "role": "CARE_COORDINATOR",
  "user_id": "a0000000-0000-0000-0000-000000000001",
  "full_name": "Maya Patel, RN"
}
```

## 2. Patients

- `GET /api/patients`: List accessible patients.
- `POST /api/patients`: Create patient record.
- `GET /api/patients/{id}`: Retrieve single patient.
- `GET /api/patients/{id}/timeline`: Retrieve patient timeline events ordered chronologically.

## 3. Documents & Agent Processing

### `POST /api/documents/upload`
Upload document text and metadata.
```json
{
  "patient_id": "b0000000-0000-0000-0000-000000000001",
  "filename": "metabolic_panel.pdf",
  "document_type": "LAB_REPORT",
  "raw_text": "Fasting Blood Glucose: 108 mg/dL ...",
  "document_date": "2026-09-10"
}
```

### `POST /api/agents/process-document`
Triggers the 7-stage agent pipeline for the document.
```json
{
  "document_id": "c0000000-0000-0000-0000-000000000001"
}
```

## 4. Evidence & Uncertainty

- `GET /api/evidence?patient_id={id}&status={status}`: Query evidence facts with source citations.

## 5. Human-in-the-Loop Reviews

### `POST /api/reviews`
Submit approval, amendment, or rejection of an extracted item or doctor briefing.
```json
{
  "item_id": "fact-101",
  "item_type": "EXTRACTED_FACT",
  "action": "APPROVED",
  "review_comment": "Verified against laboratory report values."
}
```

## 6. Audit Trail

- `GET /api/audit-logs`: Query tamper-evident audit logs with user, timestamp, action, and entity details.
