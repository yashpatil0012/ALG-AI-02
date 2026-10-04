import uuid
import os
from typing import List, Tuple, Optional
from datetime import datetime, timezone

from app.models.schemas import (
    InvestigateRequest, InvestigateResponse, Citation, DocumentChunk, Conflict
)
from app.services.vector_store import vector_store
from app.services.conflict_detector import ConflictDetector
from app.config import settings

class RAGEngine:
    @staticmethod
    def investigate(request: InvestigateRequest) -> InvestigateResponse:
        question = request.question.strip()
        search_results = vector_store.search(
            query=question,
            top_k=settings.TOP_K_RESULTS,
            document_ids=request.document_ids
        )

        created_at = datetime.now(timezone.utc).isoformat()
        inv_id = f"inv_{uuid.uuid4().hex[:8]}"

        # 1. Uncertainty Handling: No chunks or very low relevance score
        max_score = search_results[0][1] if search_results else 0.0
        
        if not search_results or max_score < settings.UNCERTAINTY_THRESHOLD:
            # Build low-confidence citation references if any exist
            citations = [
                Citation(
                    id=f"cite_{uuid.uuid4().hex[:6]}",
                    document_id=chunk.document_id,
                    document_name=chunk.document_name,
                    page_number=chunk.page_number,
                    section=chunk.section,
                    quoted_text=chunk.content[:200] + ("..." if len(chunk.content) > 200 else ""),
                    relevance_score=score
                )
                for chunk, score in search_results[:2]
            ]
            
            return InvestigateResponse(
                id=inv_id,
                question=question,
                answer="I couldn't find enough information in the uploaded documents to answer this question confidently.",
                confidence_score=max_score,
                evidence_status="insufficient",
                citations=citations,
                has_conflict=False,
                conflict=None,
                is_uncertain=True,
                uncertainty_message="Insufficient evidence found in the document library to answer this query without hallucinating.",
                suggested_followups=[
                    "Ask a more specific question",
                    "Try using different keywords or terms",
                    "Upload additional documents covering this topic"
                ],
                created_at=created_at
            )

        top_chunks = [chunk for chunk, score in search_results]

        # 2. Conflict Detection
        conflict = ConflictDetector.detect_conflicts(top_chunks, question)
        has_conflict = conflict is not None

        # 3. Build Citations
        citations = []
        for chunk, score in search_results:
            citations.append(Citation(
                id=f"cite_{uuid.uuid4().hex[:6]}",
                document_id=chunk.document_id,
                document_name=chunk.document_name,
                page_number=chunk.page_number,
                section=chunk.section,
                quoted_text=chunk.content,
                relevance_score=score
            ))

        # 4. Generate Answer via LLM or Grounded Synthesizer
        answer = RAGEngine._generate_answer(question, top_chunks, conflict)

        evidence_status = "conflicting" if has_conflict else ("strong" if max_score >= 0.35 else "moderate")

        suggested_followups = RAGEngine._generate_followups(question, top_chunks, has_conflict)

        return InvestigateResponse(
            id=inv_id,
            question=question,
            answer=answer,
            confidence_score=max_score,
            evidence_status=evidence_status,
            citations=citations,
            has_conflict=has_conflict,
            conflict=conflict,
            is_uncertain=False,
            uncertainty_message=None,
            suggested_followups=suggested_followups,
            created_at=created_at
        )

    @staticmethod
    def _generate_answer(question: str, chunks: List[DocumentChunk], conflict: Optional[Conflict]) -> str:
        # Check if OpenAI or Gemini API keys are configured
        if settings.GEMINI_API_KEY:
            try:
                return RAGEngine._call_gemini_llm(question, chunks, conflict)
            except Exception as e:
                print(f"[RAGEngine] Gemini LLM call failed, falling back to local synthesizer: {e}")

        if settings.OPENAI_API_KEY:
            try:
                return RAGEngine._call_openai_llm(question, chunks, conflict)
            except Exception as e:
                print(f"[RAGEngine] OpenAI LLM call failed, falling back to local synthesizer: {e}")

        # Local Grounded Synthesizer fallback
        return RAGEngine._local_grounded_synthesis(question, chunks, conflict)

    @staticmethod
    def _call_gemini_llm(question: str, chunks: List[DocumentChunk], conflict: Optional[Conflict]) -> str:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        context_text = "\n\n".join([
            f"--- DOCUMENT: {c.document_name} | PAGE: {c.page_number} | SECTION: {c.section} ---\n{c.content}"
            for c in chunks
        ])

        system_prompt = (
            "You are DocIntel AI, an intelligent document investigation assistant.\n"
            "Answer the question strictly using only the supplied context evidence below.\n"
            "If the context contains conflicting statements, explicitly state the contradiction and reference both sources.\n"
            "If evidence is insufficient, reply that it cannot be determined.\n"
            "Always include document name and page citations in your text answer."
        )

        prompt = f"{system_prompt}\n\nEVIDENCE CONTEXT:\n{context_text}\n\nQUESTION: {question}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()

    @staticmethod
    def _call_openai_llm(question: str, chunks: List[DocumentChunk], conflict: Optional[Conflict]) -> str:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        context_text = "\n\n".join([
            f"--- DOCUMENT: {c.document_name} | PAGE: {c.page_number} | SECTION: {c.section} ---\n{c.content}"
            for c in chunks
        ])

        system_prompt = (
            "You are DocIntel AI. Answer only from the supplied document evidence. "
            "Never invent facts. If sources disagree, explicitly report the conflict with citations."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"EVIDENCE:\n{context_text}\n\nQUESTION: {question}"}
            ],
            temperature=0.1
        )
        return response.choices[0].message.content.strip()

    @staticmethod
    def _local_grounded_synthesis(question: str, chunks: List[DocumentChunk], conflict: Optional[Conflict]) -> str:
        """Deterministic, grounded synthesizer operating without external API key dependencies."""
        if conflict:
            return (
                f"**Conflict Detected:** Discrepancy found regarding '{conflict.topic}'.\n\n"
                f"• **{conflict.source_a.document_name}** (Page {conflict.source_a.page_number}, {conflict.source_a.section}): "
                f"\"{conflict.source_a.quote.strip()}\"\n\n"
                f"• **{conflict.source_b.document_name}** (Page {conflict.source_b.page_number}, {conflict.source_b.section}): "
                f"\"{conflict.source_b.quote.strip()}\"\n\n"
                f"**Summary:** {conflict.explanation}"
            )

        # Synthesize from top chunks
        primary_chunk = chunks[0]
        synthesis = [
            f"Based on **{primary_chunk.document_name}** (Page {primary_chunk.page_number}, Section: {primary_chunk.section}):\n",
            f"\"{primary_chunk.content}\""
        ]

        if len(chunks) > 1:
            secondary_chunk = chunks[1]
            if secondary_chunk.document_name != primary_chunk.document_name:
                synthesis.append(
                    f"\n\nAdditional supporting context from **{secondary_chunk.document_name}** (Page {secondary_chunk.page_number}):\n"
                    f"\"{secondary_chunk.content}\""
                )

        return "\n".join(synthesis)

    @staticmethod
    def _generate_followups(question: str, chunks: List[DocumentChunk], has_conflict: bool) -> List[str]:
        if has_conflict:
            return [
                "Which document's terms take precedence?",
                "What is the official resolution for this discrepancy?",
                "Are there amendments or newer policy versions?"
            ]

        doc_names = list(set(c.document_name for c in chunks))
        return [
            f"What other details are mentioned in {doc_names[0]}?",
            "What are the relevant exceptions or conditions?",
            "Are there any required forms or deadlines?"
        ]
