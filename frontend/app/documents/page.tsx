'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Search, Trash2, Eye, Plus, CheckCircle2, Sparkles, Filter, AlertCircle, X, Layers } from 'lucide-react';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import { fetchDocuments, deleteDocument, fetchDocumentDetails, loadDemoData, DocumentMetadata, DocumentChunk } from '@/lib/api';

export default function DocumentLibraryPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<{ metadata: DocumentMetadata; chunks: DocumentChunk[] } | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, selectedType, documents]);

  const loadDocs = async () => {
    setIsLoading(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Error fetching documents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let result = [...documents];
    if (searchQuery.trim()) {
      result = result.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedType !== 'ALL') {
      result = result.filter(d => d.file_type === selectedType);
    }
    setFilteredDocs(result);
  };

  const handleDelete = async (id: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await deleteDocument(id);
        await loadDocs();
      } catch (e) {
        alert('Failed to delete document');
      }
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await fetchDocumentDetails(id);
      setSelectedDocDetails(details);
    } catch (e) {
      alert('Failed to fetch document details');
    }
  };

  const handleLoadDemo = async () => {
    try {
      await loadDemoData();
      await loadDocs();
    } catch (e) {
      alert('Failed to load demo data');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Document Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Indexed document repository with extracted page chunks and section metadata.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLoadDemo}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Suite</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-md shadow-red-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Filtering */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PDF', 'DOCX', 'TXT'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === type
                  ? 'bg-red-950 border border-red-700/60 text-red-300 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading document store...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No documents found</p>
            <p className="text-xs text-slate-500">Upload custom documents or click "Load Demo Suite" to populate test data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Document Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Chunks</th>
                  <th className="py-3.5 px-4">Pages</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-950/50 transition">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {doc.file_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {doc.total_chunks}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {doc.page_count}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{doc.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(doc.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Chunks & Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/investigate?doc=${doc.id}`}
                          className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 transition border border-red-800/40"
                          title="Investigate this Document"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-base">{selectedDocDetails.metadata.filename}</h3>
              </div>
              <button onClick={() => setSelectedDocDetails(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Extracted Chunks ({selectedDocDetails.chunks.length})
              </span>
              {selectedDocDetails.chunks.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Chunk #{c.chunk_index + 1} • Page {c.page_number}</span>
                    <span className="text-red-400 truncate max-w-[200px]">{c.section}</span>
                  </div>
                  <p className="text-slate-300 font-mono leading-relaxed select-text">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadDocs()}
      />
    </div>
  );
}
