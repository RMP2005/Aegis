import os
import logging

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.api.scan import router as scan_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Aegis API",
    description="AI Smart Contract Security Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

MAX_BODY_SIZE = 500_000


class LimitUploadSize(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_SIZE:
            return JSONResponse(
                {"detail": "Request body too large"}, status_code=413
            )
        return await call_next(request)


app.add_middleware(LimitUploadSize)

cors_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(scan_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aegis-api"}


@app.get("/api/v1/status")
async def api_status():
    return {
        "version": "1.0.0",
        "slither": "available",
        "ai_agent": "available",
    }
