import os
import json
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.schemas import DocumentChunk, DocumentMetadata
from app.config import settings

class LocalVectorStore:
    def __init__(self, storage_dir: str = settings.STORAGE_DIR):
        self.storage_dir = storage_dir
        self.meta_file = os.path.join(storage_dir, "documents.json")
        self.chunks_file = os.path.join(storage_dir, "chunks.json")
        
        self.documents: Dict[str, DocumentMetadata] = {}
        self.chunks: List[DocumentChunk] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        
        self.load_from_disk()

    def load_from_disk(self):
        if os.path.exists(self.meta_file):
            try:
                with open(self.meta_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.documents = {k: DocumentMetadata(**v) for k, v in data.items()}
            except Exception as e:
                print(f"[VectorStore] Error loading metadata: {e}")
                
        if os.path.exists(self.chunks_file):
            try:
                with open(self.chunks_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.chunks = [DocumentChunk(**item) for item in data]
                self._rebuild_index()
            except Exception as e:
                print(f"[VectorStore] Error loading chunks: {e}")

    def save_to_disk(self):
        try:
            with open(self.meta_file, 'w', encoding='utf-8') as f:
                json.dump({k: v.model_dump() for k, v in self.documents.items()}, f, indent=2)
            with open(self.chunks_file, 'w', encoding='utf-8') as f:
                json.dump([c.model_dump() for c in self.chunks], f, indent=2)
        except Exception as e:
            print(f"[VectorStore] Error saving to disk: {e}")

    def _rebuild_index(self):
        if not self.chunks:
            self.vectorizer = None
            self.tfidf_matrix = None
            return

        corpus = [f"{c.document_name} {c.section} {c.content}" for c in self.chunks]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
            stop_words='english'
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def add_document(self, metadata: DocumentMetadata, chunks: List[DocumentChunk]):
        self.documents[metadata.id] = metadata
        self.chunks = [c for c in self.chunks if c.document_id != metadata.id]
        self.chunks.extend(chunks)
        self._rebuild_index()
        self.save_to_disk()

    def delete_document(self, document_id: str) -> bool:
        if document_id in self.documents:
            del self.documents[document_id]
            self.chunks = [c for c in self.chunks if c.document_id != document_id]
            self._rebuild_index()
            self.save_to_disk()
            return True
        return False

    def get_document(self, document_id: str) -> Optional[DocumentMetadata]:
        return self.documents.get(document_id)

    def list_documents(self) -> List[DocumentMetadata]:
        return list(self.documents.values())

    def search(self, query: str, top_k: int = settings.TOP_K_RESULTS, document_ids: Optional[List[str]] = None) -> List[Tuple[DocumentChunk, float]]:
        if not self.chunks or not self.vectorizer or self.tfidf_matrix is None:
            return []

        indices_to_consider = list(range(len(self.chunks)))
        if document_ids:
            indices_to_consider = [i for i, c in enumerate(self.chunks) if c.document_id in document_ids]

        if not indices_to_consider:
            return []

        query_vec = self.vectorizer.transform([query])
        sub_matrix = self.tfidf_matrix[indices_to_consider]
        
        sims = cosine_similarity(query_vec, sub_matrix).flatten()
        
        # Only evaluate scores if there's actual similarity
        boosted_sims = []
        for idx_in_sub, orig_idx in enumerate(indices_to_consider):
            raw_score = float(sims[idx_in_sub])
            if raw_score <= 0.001:
                continue
                
            chunk = self.chunks[orig_idx]
            score = raw_score
            boosted_sims.append((orig_idx, score))

        if not boosted_sims:
            return []

        boosted_sims.sort(key=lambda x: x[1], reverse=True)

        # Document Diversity Selection
        selected_results = []
        seen_docs_count: Dict[str, int] = {}
        
        # First pass: max 1 chunk per document
        for orig_idx, score in boosted_sims:
            if len(selected_results) >= top_k:
                break
            chunk = self.chunks[orig_idx]
            doc_id = chunk.document_id
            
            if seen_docs_count.get(doc_id, 0) < 1:
                selected_results.append((chunk, round(score, 4)))
                seen_docs_count[doc_id] = 1

        # Second pass: fill remaining slots if top_k not reached
        if len(selected_results) < top_k:
            already_added_ids = set(c.id for c, _ in selected_results)
            for orig_idx, score in boosted_sims:
                if len(selected_results) >= top_k:
                    break
                chunk = self.chunks[orig_idx]
                if chunk.id not in already_added_ids:
                    selected_results.append((chunk, round(score, 4)))
                    already_added_ids.add(chunk.id)

        return selected_results

vector_store = LocalVectorStore()
