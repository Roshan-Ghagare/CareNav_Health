import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Healthcare Care-Navigation Agent"
    VERSION: str = "2.4.0"
    API_V1_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/carenav_db"
    )

    # JWT Authentication
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "super-secret-jwt-key-for-care-navigation-agent-change-in-production"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # AI Configuration
    MOCK_AI: bool = os.getenv("MOCK_AI", "true").lower() in ("true", "1", "yes")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
