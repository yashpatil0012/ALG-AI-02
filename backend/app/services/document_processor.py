import os
import uuid
import re
from typing import List, Dict, Any, Tuple
import pymupdf as fitz  # PyMuPDF
import docx  # python-docx
from app.models.schemas import DocumentChunk, DocumentMetadata, DocumentStatus
from app.config import settings

class DocumentProcessor:
    @staticmethod
    def extract_and_chunk(file_path: str, document_id: str, filename: str) -> Tuple[DocumentMetadata, List[DocumentChunk]]:
        file_ext = os.path.splitext(filename)[1].lower()
        file_size = os.path.getsize(file_path)
        
        extracted_pages: List[Dict[str, Any]] = []
        page_count = 1
        
        try:
            if file_ext == '.pdf':
                extracted_pages, page_count = DocumentProcessor._extract_pdf(file_path)
            elif file_ext == '.docx':
                extracted_pages, page_count = DocumentProcessor._extract_docx(file_path)
            elif file_ext in ['.txt', '.md', '.log']:
                extracted_pages, page_count = DocumentProcessor._extract_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
                
            chunks = DocumentProcessor._chunk_extracted_content(
                extracted_pages=extracted_pages,
                document_id=document_id,
                document_name=filename
            )
            
            metadata = DocumentMetadata(
                id=document_id,
                filename=filename,
                file_type=file_ext.replace('.', '').upper(),
                file_size=file_size,
                status=DocumentStatus.INDEXED,
                uploaded_at=datetime_now_iso(),
                total_chunks=len(chunks),
                page_count=page_count
            )
            return metadata, chunks
            
        except Exception as e:
            metadata = DocumentMetadata(
                id=document_id,
                filename=filename,
                file_type=file_ext.replace('.', '').upper(),
                file_size=file_size,
                status=DocumentStatus.FAILED,
                uploaded_at=datetime_now_iso(),
                total_chunks=0,
                page_count=0,
                error_message=str(e)
            )
            return metadata, []

    @staticmethod
    def _extract_pdf(file_path: str) -> Tuple[List[Dict[str, Any]], int]:
        pages = []
        doc = fitz.open(file_path)
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc[page_num]
            text = page.get_text("text")
            
            # Simple section heuristic: look for uppercase lines or lines ending with colon
            lines = text.split('\n')
            current_section = f"Page {page_num + 1}"
            for line in lines[:5]:
                clean_line = line.strip()
                if len(clean_line) > 3 and (clean_line.isupper() or clean_line.endswith(':') or clean_line.startswith('SECTION')):
                    current_section = clean_line[:50]
                    break
                    
            pages.append({
                "page_number": page_num + 1,
                "section": current_section,
                "text": text
            })
            
        doc.close()
        return pages, total_pages

    @staticmethod
    def _extract_docx(file_path: str) -> Tuple[List[Dict[str, Any]], int]:
        doc = docx.Document(file_path)
        pages = []
        current_section = "General Overview"
        accumulated_text = []
        page_num = 1
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
                
            if para.style and 'Heading' in para.style.name:
                if accumulated_text:
                    pages.append({
                        "page_number": page_num,
                        "section": current_section,
                        "text": "\n".join(accumulated_text)
                    })
                    accumulated_text = []
                    page_num += 1
                current_section = text[:50]
            else:
                accumulated_text.append(text)
                
        if accumulated_text:
            pages.append({
                "page_number": page_num,
                "section": current_section,
                "text": "\n".join(accumulated_text)
            })
            
        return pages, max(1, page_num)

    @staticmethod
    def _extract_txt(file_path: str) -> Tuple[List[Dict[str, Any]], int]:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Split by sections or major line breaks
        sections = re.split(r'\n(?=[A-Z0-9\s_\-\.]{3,30}:\n|\n[A-Z0-9\s_\-\.]{3,30}\n|#{1,3}\s)', content)
        pages = []
        
        for i, sec in enumerate(sections):
            sec_clean = sec.strip()
            if not sec_clean:
                continue
            lines = sec_clean.split('\n')
            title = lines[0][:50] if lines else f"Section {i+1}"
            pages.append({
                "page_number": i + 1,
                "section": title,
                "text": sec_clean
            })
            
        return pages, max(1, len(pages))

    @staticmethod
    def _chunk_extracted_content(extracted_pages: List[Dict[str, Any]], document_id: str, document_name: str) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []
        chunk_idx = 0
        chunk_size = settings.CHUNK_SIZE
        overlap = settings.CHUNK_OVERLAP

        for page in extracted_pages:
            page_num = page["page_number"]
            section = page["section"]
            text = page["text"]
            
            if not text or len(text.strip()) == 0:
                continue
                
            # If page text is within chunk size, take it directly
            if len(text) <= chunk_size:
                chunks.append(DocumentChunk(
                    id=f"{document_id}_chunk_{chunk_idx}",
                    document_id=document_id,
                    document_name=document_name,
                    page_number=page_num,
                    section=section,
                    content=text.strip(),
                    chunk_index=chunk_idx
                ))
                chunk_idx += 1
            else:
                # Sliding window chunking
                start = 0
                while start < len(text):
                    end = start + chunk_size
                    chunk_text = text[start:end]
                    
                    # Try to break at sentence end or paragraph break if possible
                    if end < len(text):
                        last_period = max(chunk_text.rfind('. '), chunk_text.rfind('\n'))
                        if last_period > chunk_size // 2:
                            end = start + last_period + 1
                            chunk_text = text[start:end]
                            
                    chunks.append(DocumentChunk(
                        id=f"{document_id}_chunk_{chunk_idx}",
                        document_id=document_id,
                        document_name=document_name,
                        page_number=page_num,
                        section=section,
                        content=chunk_text.strip(),
                        chunk_index=chunk_idx
                    ))
                    chunk_idx += 1
                    start += (len(chunk_text) - overlap) if len(chunk_text) > overlap else len(chunk_text)
                    
        return chunks

def datetime_now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
