from fastapi import FastAPI, Response
from starlette.types import Scope, Receive, Send
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


class AllowHeadMiddleware:
    """Convert HEAD requests to GET internally and return empty body.

    Some external monitors only use HEAD. This ensures 200 responses
    where a GET route exists without duplicating route methods.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope.get("type") == "http" and scope.get("method") == "HEAD":
            # Clone scope and rewrite method to GET
            new_scope = dict(scope)
            new_scope["method"] = "GET"

            async def send_wrapper(message):
                # Drop response body for HEAD
                if message.get("type") == "http.response.body":
                    empty = dict(message)
                    empty["body"] = b""
                    await send(empty)
                else:
                    await send(message)

            await self.app(new_scope, receive, send_wrapper)
            return
        await self.app(scope, receive, send)


# Wrap the app so HEAD works everywhere a GET exists
app = AllowHeadMiddleware(app)

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
