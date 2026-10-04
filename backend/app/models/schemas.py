from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class DocumentStatus(str, Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: DocumentStatus
    uploaded_at: str
    total_chunks: int = 0
    page_count: int = 0
    error_message: Optional[str] = None

class DocumentChunk(BaseModel):
    id: str
    document_id: str
    document_name: str
    page_number: int = 1
    section: str = "General"
    content: str
    chunk_index: int = 0

class Citation(BaseModel):
    id: str
    document_id: str
    document_name: str
    page_number: int
    section: str
    quoted_text: str
    relevance_score: float

class ConflictSource(BaseModel):
    document_name: str
    page_number: int
    section: str
    quote: str

class Conflict(BaseModel):
    id: str
    topic: str
    source_a: ConflictSource
    source_b: ConflictSource
    explanation: str
    severity: str = "high"  # "high", "medium", "low"

class InvestigateRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    temperature: float = 0.2

class InvestigateResponse(BaseModel):
    id: str
    question: str
    answer: str
    confidence_score: float
    evidence_status: str  # "strong", "moderate", "insufficient", "conflicting"
    citations: List[Citation]
    has_conflict: bool = False
    conflict: Optional[Conflict] = None
    is_uncertain: bool = False
    uncertainty_message: Optional[str] = None
    suggested_followups: List[str] = []
    created_at: str

class DashboardStats(BaseModel):
    total_documents: int
    processed_documents: int
    total_chunks: int
    detected_conflicts_count: int
    questions_asked: int
    recent_documents: List[DocumentMetadata]
    recent_investigations: List[Dict[str, Any]]

class DemoLoadResponse(BaseModel):
    success: bool
    message: str
    documents_loaded: List[DocumentMetadata]
