# DocIntel AI — Test Suite & Verification Matrix

## Test Suite Summary

The backend includes automated unit & integration tests written with `pytest` covering all core RAG pipeline requirements.

### Running Backend Tests

Ensure virtual environment is activated, then run:

```bash
cd backend
.\venv\Scripts\pytest tests/test_backend.py -v
```

### Verified Test Matrix

| Test Case | Module | Status | Description |
|---|---|---|---|
| `test_demo_data_loading_and_vector_search` | `test_backend.py` | **PASSED** | Verifies text chunking, document metadata creation, and TF-IDF cosine vector retrieval. |
| `test_conflict_detection` | `test_backend.py` | **PASSED** | Verifies cross-document conflict detector identifies contradictory values (7 days vs 14 days). |
| `test_uncertainty_handling` | `test_backend.py` | **PASSED** | Verifies queries with zero/low relevance trigger `is_uncertain=True` and insufficient evidence warning. |
| `test_grounded_qa` | `test_backend.py` | **PASSED** | Verifies factual Q&A returns exact citations and grounded text without external knowledge leakage. |

---

## Frontend Build Verification

The Next.js 14 App Router frontend is verified via production build:

```bash
cd frontend
npm run build
```

- **Output**: Clean compilation with 0 errors across static routes (`/`, `/documents`, `/investigate`, `/settings`).
