import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.scan import router as scan_router


app = FastAPI(
    title="Aegis API",
    description="AI Smart Contract Security Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "ai_agent": "mock" if not os.environ.get("OPENAI_API_KEY") else "live",
    }
