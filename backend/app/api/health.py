import json
import os
from fastapi import APIRouter
from app.models.schemas import DashboardStats
from app.services.vector_store import vector_store
from app.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DocIntel AI API",
        "version": "1.0.0",
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "indexed_documents": len(vector_store.documents),
        "total_chunks": len(vector_store.chunks)
    }

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    docs = vector_store.list_documents()
    processed_count = sum(1 for d in docs if d.status == "indexed")
    total_chunks = len(vector_store.chunks)

    # Count investigations and detected conflicts from history
    investigations = []
    history_file = os.path.join(settings.STORAGE_DIR, "investigations.json")
    conflicts_count = 0
    questions_count = 0
    
    if os.path.exists(history_file):
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                investigations = json.load(f)
                questions_count = len(investigations)
                conflicts_count = sum(1 for inv in investigations if inv.get("has_conflict", False))
        except Exception:
            pass

    recent_docs = sorted(docs, key=lambda x: x.uploaded_at, reverse=True)[:5]
    recent_invs = investigations[:5]

    return DashboardStats(
        total_documents=len(docs),
        processed_documents=processed_count,
        total_chunks=total_chunks,
        detected_conflicts_count=conflicts_count,
        questions_asked=questions_count,
        recent_documents=recent_docs,
        recent_investigations=recent_invs
    )
