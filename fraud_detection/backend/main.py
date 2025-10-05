from fastapi import FastAPI, Response, Request
import os
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.auth_routes import router as auth_router
from app.routers.user_routes import router as user_router
from app.routers.fraud_routes import router as fraud_router
from app.routers.admin_routes import router as admin_router

# create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fraud Detection Backend")

@app.middleware("http")
async def allow_head_as_get(request: Request, call_next):
    if request.method == "HEAD":
        # Treat HEAD as GET internally
        request.scope["method"] = "GET"
        response = await call_next(request)
        # Return same status and headers but without body
        return Response(status_code=response.status_code, headers=dict(response.headers), media_type=response.media_type)
    return await call_next(request)

env_origins = os.getenv("CORS_ORIGINS")
origins = (
    [o.strip() for o in env_origins.split(",") if o.strip()]
    if env_origins else [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
)

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
app.include_router(admin_router, prefix="/admin", tags=["admin"])

# health
@app.get("/")
def root() -> Response:
    return Response(content='{"status":"ok","service":"fraud-backend"}', media_type="application/json", status_code=200)
