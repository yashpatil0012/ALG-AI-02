import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.models.schemas import DocumentMetadata, DocumentStatus, DocumentChunk
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import vector_store
from app.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=List[DocumentMetadata])
async def upload_documents(files: List[UploadFile] = File(...)):
    results = []
    upload_dir = os.path.join(settings.STORAGE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        if not file.filename:
            continue
            
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        sanitized_filename = os.path.basename(file.filename)
        file_path = os.path.join(upload_dir, f"{doc_id}_{sanitized_filename}")
        
        # Save file to disk
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Process and extract text
        metadata, chunks = DocumentProcessor.extract_and_chunk(
            file_path=file_path,
            document_id=doc_id,
            filename=sanitized_filename
        )
        
        # Add to vector store
        vector_store.add_document(metadata, chunks)
        results.append(metadata)

    return results

@router.get("", response_model=List[DocumentMetadata])
def get_documents():
    return vector_store.list_documents()

@router.get("/{document_id}")
def get_document(document_id: str):
    doc = vector_store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = [c for c in vector_store.chunks if c.document_id == document_id]
    return {
        "metadata": doc,
        "chunks": chunks
    }

@router.delete("/{document_id}")
def delete_document(document_id: str):
    success = vector_store.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully", "id": document_id}
