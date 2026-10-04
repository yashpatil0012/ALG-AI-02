# DocIntel AI Architecture & Technical Design

## System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (Next.js 14 / Tailwind CSS)"]
        UI["Dashboard & Chat Interface"]
        DocLib["Document Library View"]
        CitePanel["Source Evidence Inspector"]
        ConflictUI["Conflict Warning Card"]
        UncertainUI["Uncertainty Alert Card"]
    end

    subgraph Backend ["Backend API Layer (FastAPI)"]
        API["REST API Router (/api)"]
        DocProc["Document Processor (PyMuPDF / python-docx / txt)"]
        VectorEngine["Local Vector Index (TF-IDF + Cosine Similarity)"]
        ConflictEngine["Conflict Detector (Cross-Document Rule & Semantic Engine)"]
        RAGEngine["RAG Pipeline Controller"]
    end

    subgraph Storage ["Persistence Layer"]
        DiskStore["File Storage & Local Vector DB (JSON Index)"]
    end

    subgraph AI ["AI / Generation Tier"]
        LLM["Gemini 2.5 Flash / OpenAI GPT-4o / Grounded Synthesizer"]
    end

    UI -->|HTTP Request| API
    DocLib -->|Upload PDF/DOCX/TXT| API
    API --> DocProc
    DocProc -->|Extracted Chunks + Metadata| VectorEngine
    VectorEngine <--> DiskStore

    API -->|Investigate Question| RAGEngine
    RAGEngine -->|Vector Search Query| VectorEngine
    VectorEngine -->|Top-K Relevant Chunks| RAGEngine

    RAGEngine -->|Evaluate Cross-Chunk Differences| ConflictEngine
    ConflictEngine -->|Detected Discrepancies| ConflictUI

    RAGEngine -->|Check Relevance Threshold| UncertaintyCheck{Score >= 0.15?}
    UncertaintyCheck -->|No| UncertainUI
    UncertaintyCheck -->|Yes| LLM

    LLM -->|Grounded Answer + Citations| UI
    RAGEngine --> CitePanel
```

## Component Breakdown

1. **Document Processor**:
   - Parses `.pdf` using PyMuPDF (`fitz`), preserving page numbers and heading-based sections.
   - Parses `.docx` using `python-docx`, maintaining paragraph structure and headings.
   - Parses `.txt` / `.md` preserving clean string boundaries.
   - Generates sliding window text chunks (approx 600 chars with 100 char overlap) and attaches metadata (`document_id`, `document_name`, `page_number`, `section`).

2. **Vector Index & Storage**:
   - Implements a fast, zero-dependency `LocalVectorStore` abstraction using scikit-learn `TfidfVectorizer` (sublinear TF, n-gram range 1-2) + Cosine Similarity.
   - Enables document diversity selection across multiple uploaded documents to guarantee multi-document evidence retrieval.
   - Optional support for `pgvector` / Postgres when database credentials are present.

3. **Conflict Detection Engine**:
   - Performs cross-document semantic and numerical comparison across top retrieved chunks.
   - Detects contradictory numbers (e.g. 7 business days vs 14 calendar days), contradictory terms (must require vs optional), and differing conditions.
   - Generates a structured `Conflict` payload detailing `topic`, `source_a` quote, `source_b` quote, and `explanation`.

4. **Uncertainty Handling Engine**:
   - Measures vector similarity score of query against index chunks.
   - If max score is below threshold or query fails to match available documents, returns an explicit `⚠ Insufficient Evidence` status rather than hallucinating facts.
