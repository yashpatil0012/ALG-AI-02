from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import documents, investigate, demo, health

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DocIntel AI - Intelligent Document Investigator Backend API",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(investigate.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "DocIntel AI API is active",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }
