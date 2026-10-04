'use client';

import React from 'react';
import { X, FileText, Bookmark, Target, ExternalLink } from 'lucide-react';
import { Citation } from '@/lib/api';

interface EvidencePanelProps {
  citation: Citation | null;
  onClose: () => void;
}

export default function EvidencePanel({ citation, onClose }: EvidencePanelProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-white text-base">Source Evidence Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-red-400">
              <FileText className="w-4 h-4" />
              <span className="font-semibold text-sm text-white">{citation.document_name}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block">Page Number</span>
                <span className="font-medium text-slate-200">Page {citation.page_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Section</span>
                <span className="font-medium text-slate-200 truncate block">{citation.section}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Relevance Score</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {(citation.relevance_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Quoted Text Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>Extracted Source Chunk</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap select-text">
              {citation.quoted_text}
            </div>
          </div>

          {/* Grounding Notice */}
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-start space-x-2">
            <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <p>
              This chunk was retrieved directly from the vector store index. All AI answers are mathematically constrained to draw facts exclusively from these retrieved excerpts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
