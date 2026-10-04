import re
import uuid
from typing import List, Tuple, Optional
from app.models.schemas import DocumentChunk, Conflict, ConflictSource
from app.config import settings

class ConflictDetector:
    @staticmethod
    def detect_conflicts(chunks: List[DocumentChunk], question: str) -> Optional[Conflict]:
        if len(chunks) < 2:
            return None

        # Group chunks by document to avoid self-conflict
        doc_chunks = {}
        for c in chunks:
            if c.document_name not in doc_chunks:
                doc_chunks[c.document_name] = []
            doc_chunks[c.document_name].append(c)

        if len(doc_chunks) < 2:
            return None

        # Compare pairs from different documents
        doc_names = list(doc_chunks.keys())
        for i in range(len(doc_names)):
            for j in range(i + 1, len(doc_names)):
                doc1_name = doc_names[i]
                doc2_name = doc_names[j]
                
                for c1 in doc_chunks[doc1_name]:
                    for c2 in doc_chunks[doc2_name]:
                        conflict = ConflictDetector._compare_chunk_pair(c1, c2, question)
                        if conflict:
                            return conflict
        return None

    @staticmethod
    def _compare_chunk_pair(c1: DocumentChunk, c2: DocumentChunk, question: str) -> Optional[Conflict]:
        t1 = c1.content
        t2 = c2.content
        
        # 1. Number / Duration conflicts (e.g. 7 days vs 14 days)
        # Find numeric patterns like "7 days", "14 days", "$500", "10%", etc.
        num_pattern = r'(\d+\s*(?:days?|hours?|weeks?|months?|business days?|calendar days?|\%|dollars?|\$))'
        matches1 = re.findall(num_pattern, t1, re.IGNORECASE)
        matches2 = re.findall(num_pattern, t2, re.IGNORECASE)

        # Look for overlapping context words around different numbers
        if matches1 and matches2:
            for m1 in matches1:
                for m2 in matches2:
                    if m1.strip().lower() != m2.strip().lower():
                        # Extract context around m1 and m2
                        kw1 = re.findall(r'\b[a-zA-Z]{4,}\b', t1.lower())
                        kw2 = re.findall(r'\b[a-zA-Z]{4,}\b', t2.lower())
                        common_keywords = set(kw1).intersection(set(kw2))
                        
                        # If they share domain keywords (e.g. refund, period, cancellation, fee, uptime)
                        domain_words = {"refund", "cancellation", "period", "notice", "days", "required", "fee", "receipt", "uptime", "credits"}
                        if common_keywords.intersection(domain_words) or len(common_keywords) >= 3:
                            topic = f"Discrepancy in policy values ({m1} vs {m2})"
                            if "refund" in common_keywords or "refund" in question.lower():
                                topic = "Conflicting Refund Window / Policy"
                            elif "cancellation" in common_keywords or "cancel" in question.lower():
                                topic = "Conflicting Cancellation Window"

                            return Conflict(
                                id=f"conflict_{uuid.uuid4().hex[:8]}",
                                topic=topic,
                                source_a=ConflictSource(
                                    document_name=c1.document_name,
                                    page_number=c1.page_number,
                                    section=c1.section,
                                    quote=c1.content[:200]
                                ),
                                source_b=ConflictSource(
                                    document_name=c2.document_name,
                                    page_number=c2.page_number,
                                    section=c2.section,
                                    quote=c2.content[:200]
                                ),
                                explanation=f"'{c1.document_name}' specifies '{m1}', whereas '{c2.document_name}' specifies '{m2}' for the same operational topic.",
                                severity="high"
                            )

        # 2. Contradictory terms (Required vs Optional / Not Required)
        req_pattern1 = r'\b(must|required|mandatory|shall)\b'
        req_pattern2 = r'\b(not required|optional|may|only require|transaction number)\b'
        
        if (re.search(req_pattern1, t1, re.I) and re.search(req_pattern2, t2, re.I)) or \
           (re.search(req_pattern2, t1, re.I) and re.search(req_pattern1, t2, re.I)):
            kw1 = re.findall(r'\b[a-zA-Z]{4,}\b', t1.lower())
            kw2 = re.findall(r'\b[a-zA-Z]{4,}\b', t2.lower())
            common_keywords = set(kw1).intersection(set(kw2))
            
            if len(common_keywords) >= 2:
                return Conflict(
                    id=f"conflict_{uuid.uuid4().hex[:8]}",
                    topic="Conflicting Documentation Requirements",
                    source_a=ConflictSource(
                        document_name=c1.document_name,
                        page_number=c1.page_number,
                        section=c1.section,
                        quote=c1.content[:200]
                    ),
                    source_b=ConflictSource(
                        document_name=c2.document_name,
                        page_number=c2.page_number,
                        section=c2.section,
                        quote=c2.content[:200]
                    ),
                    explanation=f"'{c1.document_name}' states strict requirements, while '{c2.document_name}' indicates relaxed or alternative criteria.",
                    severity="high"
                )

        return None
