import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # SQLite file in project root (backend/)
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./fraud_app.db"

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Optional: expected feature order if your joblib doesn't include it
    # Leave it empty [] if your joblib artifact contains feature names in the pipeline
    MODEL_FEATURE_ORDER: list[str] = []

    # Model path
    MODEL_PATH: str = os.getenv("MODEL_PATH", "fraud_model.joblib")

settings = Settings()
