from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.auth_routes import router as auth_router
from app.routers.user_routes import router as user_router
from app.routers.fraud_routes import router as fraud_router

# create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fraud Detection Backend")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    # Add any additional origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# mount routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/user", tags=["user"])
app.include_router(fraud_router, prefix="/fraud", tags=["fraud"])

# health
@app.get("/")
def root():
    return {"status": "ok", "service": "fraud-backend"}
