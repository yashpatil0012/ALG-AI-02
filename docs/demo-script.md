# DocIntel AI — Hackathon Demo Script (2–3 Minute Judge Demo)

**Tagline:** *"Ask your documents. Get evidence, not guesses."*  
**Problem Statement:** ALG-AI-02 — Intelligent Document Investigator

---

## ⏱️ Demo Overview (3-Minute Flow)

| Time | Action / Demonstration | Key Talking Points |
|---|---|---|
| **0:00 - 0:35** | **Problem & Solution Introduction** | "Information is buried across disparate PDFs, Word docs, and contracts. DocIntel AI processes multi-format documents, grounds answers strictly in evidence, and detects policy conflicts." |
| **0:35 - 1:10** | **Click 'Load Demo Data' & Show Dashboard** | "With 1-click Demo Mode, we instantly ingest 3 enterprise documents: 2025 Refund Policy, 2026 Terms & Conditions, and SLA Agreement." Show 3 docs indexed into vector store. |
| **1:10 - 1:50** | **Demonstrate Conflict Detection (MAJOR DIFFERENTIATOR)** | Click predefined question: *"What is the refund period?"*. Show **⚠ Conflict Detected** alert. Point out Document 1 says **7 business days**, Document 2 says **14 calendar days**. Explain how DocIntel AI avoids hallucinating or picking one blindly. |
| **1:50 - 2:20** | **Demonstrate Source Citations & Inspector** | Click on citation `company_policy_2025.txt - Page 1`. Show the **Source Evidence Inspector** panel opening on the right with exact chunk text and relevance score. |
| **2:20 - 2:45** | **Demonstrate Uncertainty Handling (REQUIRED)** | Ask an out-of-scope question: *"What is the warranty policy for quantum computing hardware shipping?"*. Show **⚠ Insufficient Evidence** warning card refusing to hallucinate and offering suggested follow-ups. |
| **2:45 - 3:00** | **Architecture & Wrap Up** | "DocIntel AI runs 100% offline out-of-the-box using local TF-IDF vector indexing or hooks into Gemini/OpenAI APIs seamlessly. Deployable on Vercel + FastAPI." |

---

## 🎯 Step-by-Step Execution Guide for Presenter

1. **Launch App**: Open `http://localhost:3000`.
2. **Load Demo Suite**: Click the **⚡ Load Demo Data** button in the top navbar.
3. **Navigate to Investigate Q&A**:
   - Click preset chip 1: **"What is the refund period?"**
   - *Highlight to judges:* The system detects contradictory statements between the 2025 Policy and 2026 Terms instead of picking one arbitrary answer.
4. **Open Evidence Inspector**:
   - Click any citation pill below the answer.
   - *Highlight to judges:* Verifiable proof with page numbers and exact text chunks.
5. **Trigger Uncertainty Alert**:
   - Click preset chip 4: **"What information is not available in the documents?"**
   - *Highlight to judges:* Zero hallucination guarantee. Shows explicit warning when evidence is missing.
