import pytest
import os
import sys

# Add backend app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.demo_service import DemoService
from app.services.vector_store import vector_store
from app.services.rag_engine import RAGEngine
from app.services.conflict_detector import ConflictDetector
from app.models.schemas import InvestigateRequest

def test_demo_data_loading_and_vector_search():
    # Load demo data
    docs = DemoService.load_demo_data()
    assert len(docs) == 3
    assert len(vector_store.documents) >= 3
    assert len(vector_store.chunks) > 0

    # Test vector search
    results = vector_store.search("refund period", top_k=3)
    assert len(results) > 0
    top_chunk, score = results[0]
    assert score > 0.0
    assert "refund" in top_chunk.content.lower()

def test_conflict_detection():
    DemoService.load_demo_data()
    
    # Query topic with conflicting numbers (7 days vs 14 days)
    req = InvestigateRequest(question="What is the refund period?")
    res = RAGEngine.investigate(req)
    
    assert res.has_conflict == True
    assert res.conflict is not None
    assert "Refund" in res.conflict.topic or "discrepancy" in res.conflict.explanation.lower() or "7" in res.conflict.explanation
    assert res.evidence_status == "conflicting"

def test_uncertainty_handling():
    DemoService.load_demo_data()
    
    # Query completely unrelated topic not in documents
    req = InvestigateRequest(question="What is the warranty policy for quantum computing hardware shipping?")
    res = RAGEngine.investigate(req)
    
    assert res.is_uncertain == True
    assert res.evidence_status == "insufficient"
    assert "couldn't find enough information" in res.answer.lower()
    assert len(res.suggested_followups) > 0

def test_grounded_qa():
    DemoService.load_demo_data()
    
    req = InvestigateRequest(question="What is the uptime service level agreement guarantee?")
    res = RAGEngine.investigate(req)
    
    assert res.is_uncertain == False
    assert len(res.citations) > 0
    assert "99.9%" in res.answer or "SLA" in res.answer or "uptime" in res.answer.lower()
