const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface DocumentMetadata {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'indexed' | 'failed';
  uploaded_at: string;
  total_chunks: number;
  page_count: number;
  error_message?: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section: string;
  content: string;
  chunk_index: number;
}

export interface Citation {
  id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section: string;
  quoted_text: string;
  relevance_score: number;
}

export interface ConflictSource {
  document_name: string;
  page_number: number;
  section: string;
  quote: string;
}

export interface Conflict {
  id: string;
  topic: string;
  source_a: ConflictSource;
  source_b: ConflictSource;
  explanation: string;
  severity: string;
}

export interface InvestigateResponse {
  id: string;
  question: string;
  answer: string;
  confidence_score: number;
  evidence_status: 'strong' | 'moderate' | 'insufficient' | 'conflicting';
  citations: Citation[];
  has_conflict: boolean;
  conflict?: Conflict | null;
  is_uncertain: boolean;
  uncertainty_message?: string | null;
  suggested_followups: string[];
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  processed_documents: number;
  total_chunks: number;
  detected_conflicts_count: number;
  questions_asked: number;
  recent_documents: DocumentMetadata[];
  recent_investigations: any[];
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    return { status: 'offline' };
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocumentDetails(id: string): Promise<{ metadata: DocumentMetadata; chunks: DocumentChunk[] }> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document details');
  return res.json();
}

export async function uploadDocuments(files: FileList | File[]): Promise<DocumentMetadata[]> {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to upload documents');
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function investigateQuestion(question: string, document_ids?: string[]): Promise<InvestigateResponse> {
  const res = await fetch(`${API_BASE_URL}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_ids }),
  });
  if (!res.ok) throw new Error('Investigation failed');
  return res.json();
}

export async function loadDemoData(): Promise<{ success: boolean; message: string; documents_loaded: DocumentMetadata[] }> {
  const res = await fetch(`${API_BASE_URL}/demo/load`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to load demo data');
  return res.json();
}

export async function fetchInvestigationHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/investigate/history`);
  if (!res.ok) throw new Error('Failed to fetch investigation history');
  return res.json();
}
