import json
import os
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.models.schemas import InvestigateRequest, InvestigateResponse
from app.services.rag_engine import RAGEngine
from app.config import settings

router = APIRouter(prefix="/investigate", tags=["investigate"])

INVESTIGATIONS_HISTORY_FILE = os.path.join(settings.STORAGE_DIR, "investigations.json")

def _load_history() -> List[Dict[str, Any]]:
    if os.path.exists(INVESTIGATIONS_HISTORY_FILE):
        try:
            with open(INVESTIGATIONS_HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return []

def _save_history(item: Dict[str, Any]):
    history = _load_history()
    history.insert(0, item)
    # Keep last 50 investigations
    history = history[:50]
    try:
        with open(INVESTIGATIONS_HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"[InvestigateRouter] Error saving history: {e}")

@router.post("", response_model=InvestigateResponse)
def investigate_documents(request: InvestigateRequest):
    if not request.question or len(request.question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    response = RAGEngine.investigate(request)
    _save_history(response.model_dump())
    return response

@router.get("/history", response_model=List[Dict[str, Any]])
def get_investigation_history():
    return _load_history()
