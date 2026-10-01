from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database.connection import engine, Base
from backend.app.api.auth_routes import router as auth_router
from backend.app.api.patient_routes import router as patient_router
from backend.app.api.document_routes import router as document_router
from backend.app.api.agent_routes import router as agent_router
from backend.app.api.evidence_routes import router as evidence_router
from backend.app.api.appointment_routes import router as appointment_router
from backend.app.api.followup_routes import router as followup_router
from backend.app.api.review_routes import router as review_router
from backend.app.api.audit_routes import router as audit_router

# Initialize schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic AI healthcare care-navigation platform that converts fragmented healthcare documents into an organized, evidence-backed care coordination workflow. Non-diagnostic and non-prescriptive."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(patient_router, prefix=settings.API_V1_PREFIX)
app.include_router(document_router, prefix=settings.API_V1_PREFIX)
app.include_router(agent_router, prefix=settings.API_V1_PREFIX)
app.include_router(evidence_router, prefix=settings.API_V1_PREFIX)
app.include_router(appointment_router, prefix=settings.API_V1_PREFIX)
app.include_router(followup_router, prefix=settings.API_V1_PREFIX)
app.include_router(review_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mock_ai_mode": settings.MOCK_AI,
        "version": settings.VERSION,
        "scope": "Care Navigation & Administrative Coordination Only (Strictly Non-Diagnostic)"
    }
