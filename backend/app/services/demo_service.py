import os
import uuid
from typing import List
from app.models.schemas import DocumentMetadata
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import vector_store
from app.config import settings

SAMPLE_DOC_1 = """DOCINTEL ENTERPRISE REFUND & RETURN POLICY 2025
SECTION 1: OVERVIEW & SCOPE
This document outlines the standard customer refund and return policies governing all software subscriptions purchased prior to January 1, 2026.

SECTION 2: REFUND ELIGIBILITY WINDOW
All refund requests for software subscriptions must be submitted within 7 business days of initial purchase. Any refund requested after 7 business days will be automatically rejected.

SECTION 3: MANDATORY VERIFICATION DOCUMENTS
To request a refund, customers must submit an original purchase receipt along with a valid government-issued ID to support@docintel.ai. Failure to provide physical proof of identity will void the request.

SECTION 4: FEES & DEDUCTIONS
Late refund requests that are accepted on an exceptional basis incur a non-refundable 15% restocking fee.
"""

SAMPLE_DOC_2 = """DOCINTEL MASTER TERMS & CONDITIONS 2026 (REVISED)
SECTION 4.1: GENERAL BILLING TERMS
These revised Master Terms govern all user accounts, SaaS subscriptions, and platform access effective January 2026 onwards.

SECTION 4.2: REFUND TIMELINE & DISPATCH
Section 4.2 - Refund Timeline: Customers are eligible for a full refund within 14 calendar days of subscription purchase or renewal. Requests within 14 days will be processed with zero penalty.

SECTION 4.3: REQUIRED CLAIM DOCUMENTATION
Section 4.3 - Required Documentation: Refund claims only require a valid order transaction number submitted via the online support portal. No paper documentation or government ID is necessary.

SECTION 4.4: CANCELLATION POLICY
Subscriptions may be canceled at any time from the account dashboard. Service remains active until the end of the current billing cycle.
"""

SAMPLE_DOC_3 = """DOCINTEL ENTERPRISE SERVICE LEVEL AGREEMENT (SLA)
SECTION 9: SERVICE LEVEL GUARANTEES
DocIntel AI guarantees a 99.9% platform availability uptime per calendar month. If monthly uptime drops below 99.9%, enterprise clients receive proportional SLA credit refunds.

SECTION 10: SUPPORT RESPONSE TIMES & SEVERITY
Priority 1 (Critical Outage): Response within 1 hour. Resolution target within 4 hours.
Priority 2 (High Severity): Response within 4 hours.
Priority 3 (General Inquiries): Response within 24 business hours.

SECTION 11: SECURITY & DATA PROTECTION
All customer documents uploaded to DocIntel AI are encrypted in transit via TLS 1.3 and at rest using AES-256 encryption. Customer vectors are strictly isolated.
"""

class DemoService:
    @staticmethod
    def ensure_demo_files_exist():
        os.makedirs(settings.DEMO_DIR, exist_ok=True)
        
        file1 = os.path.join(settings.DEMO_DIR, "company_policy_2025.txt")
        file2 = os.path.join(settings.DEMO_DIR, "terms_and_conditions_2026.txt")
        file3 = os.path.join(settings.DEMO_DIR, "enterprise_sla_agreement.txt")
        
        if not os.path.exists(file1):
            with open(file1, 'w', encoding='utf-8') as f:
                f.write(SAMPLE_DOC_1)
        if not os.path.exists(file2):
            with open(file2, 'w', encoding='utf-8') as f:
                f.write(SAMPLE_DOC_2)
        if not os.path.exists(file3):
            with open(file3, 'w', encoding='utf-8') as f:
                f.write(SAMPLE_DOC_3)

    @staticmethod
    def load_demo_data() -> List[DocumentMetadata]:
        DemoService.ensure_demo_files_exist()
        
        # Remove old demo documents from vector store to avoid duplication
        existing_docs = list(vector_store.documents.values())
        for doc in existing_docs:
            if doc.id.startswith("demo_") or doc.filename in ["company_policy_2025.txt", "terms_and_conditions_2026.txt", "enterprise_sla_agreement.txt"]:
                vector_store.delete_document(doc.id)

        demo_files = [
            ("company_policy_2025.txt", os.path.join(settings.DEMO_DIR, "company_policy_2025.txt")),
            ("terms_and_conditions_2026.txt", os.path.join(settings.DEMO_DIR, "terms_and_conditions_2026.txt")),
            ("enterprise_sla_agreement.txt", os.path.join(settings.DEMO_DIR, "enterprise_sla_agreement.txt"))
        ]
        
        loaded_docs = []
        for filename, filepath in demo_files:
            doc_id = f"demo_{uuid.uuid4().hex[:8]}"
            metadata, chunks = DocumentProcessor.extract_and_chunk(
                file_path=filepath,
                document_id=doc_id,
                filename=filename
            )
            vector_store.add_document(metadata, chunks)
            loaded_docs.append(metadata)
            
        return loaded_docs
