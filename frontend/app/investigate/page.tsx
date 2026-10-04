'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Sparkles, AlertTriangle, ShieldCheck, FileText, Bookmark, Loader2, RefreshCw, HelpCircle } from 'lucide-react';
import DemoPromptChips from '@/components/DemoPromptChips';
import EvidencePanel from '@/components/EvidencePanel';
import ConflictBanner from '@/components/ConflictBanner';
import UncertaintyBanner from '@/components/UncertaintyBanner';
import { investigateQuestion, fetchDocuments, loadDemoData, InvestigateResponse, Citation, DocumentMetadata } from '@/lib/api';

export const dynamic = 'force-dynamic';

function InvestigateContent() {
  const searchParams = useSearchParams();
  const docFilterParam = searchParams.get('doc');

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; response?: InvestigateResponse; text?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [availableDocs, setAvailableDocs] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docFilterParam);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadDocs = async () => {
    try {
      const docs = await fetchDocuments();
      setAvailableDocs(docs);
      if (docs.length === 0) {
        await loadDemoData();
        const reloaded = await fetchDocuments();
        setAvailableDocs(reloaded);
      }
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  const handleAsk = async (queryToAsk?: string) => {
    const q = queryToAsk || question;
    if (!q || !q.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMessage]);
    if (!queryToAsk) setQuestion('');
    setIsLoading(true);

    try {
      const docIds = selectedDocId ? [selectedDocId] : undefined;
      const res = await investigateQuestion(q, docIds);
      setMessages((prev) => [...prev, { role: 'assistant', response: res }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'An error occurred while running the investigation. Please ensure backend is active.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 animate-in fade-in duration-300">
      {/* Header & Scope Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h1 className="text-lg font-bold text-white tracking-tight">Document Investigation Q&A</h1>
          </div>
          <p className="text-xs text-slate-400">
            Answers are strictly grounded in retrieved document evidence with clickable citations.
          </p>
        </div>

        {/* Scope selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Document Scope:</span>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value || null)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Documents ({availableDocs.length})</option>
            {availableDocs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Ask your documents. Get evidence, not guesses.</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                DocIntel AI uses vector embedding search to find exact relevant passages, detects contradictory information across sources, and highlights uncertainty when data is missing.
              </p>
            </div>

            {/* Presets */}
            <div className="w-full text-left pt-2">
              <DemoPromptChips onSelectPrompt={(p) => handleAsk(p)} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-2xl rounded-2xl bg-red-600 text-white px-4 py-3 text-xs font-medium shadow-md">
                    {msg.text}
                  </div>
                ) : msg.response ? (
                  <div className="w-full max-w-4xl space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Evidence Status:</span>
                      {msg.response.has_conflict ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 text-xs font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Conflicting Information</span>
                        </span>
                      ) : msg.response.is_uncertain ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 text-xs font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <span>Insufficient Evidence</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-bold">
                          ✓ {msg.response.evidence_status.toUpperCase()} EVIDENCE
                        </span>
                      )}
                    </div>

                    {/* Conflict Warning Card */}
                    {msg.response.has_conflict && msg.response.conflict && (
                      <ConflictBanner conflict={msg.response.conflict} />
                    )}

                    {/* Uncertainty Warning Card */}
                    {msg.response.is_uncertain && (
                      <UncertaintyBanner
                        message={msg.response.uncertainty_message}
                        onAskFollowup={(prompt) => handleAsk(prompt)}
                      />
                    )}

                    {/* Grounded Answer Card */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs space-y-3 leading-relaxed shadow-md">
                      <div className="font-semibold text-xs text-red-400 uppercase tracking-wider">Answer</div>
                      <div className="whitespace-pre-wrap font-sans text-slate-200 select-text">
                        {msg.response.answer}
                      </div>

                      {/* Clickable Source Citations */}
                      {msg.response.citations && msg.response.citations.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Supporting Sources ({msg.response.citations.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.response.citations.map((cite) => (
                              <button
                                key={cite.id}
                                onClick={() => setActiveCitation(cite)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700 transition hover:border-red-500/50 shadow-xs"
                              >
                                <Bookmark className="w-3.5 h-3.5 text-red-400" />
                                <span className="font-medium">{cite.document_name}</span>
                                <span className="text-slate-400 text-[10px] font-mono">Page {cite.page_number}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Questions */}
                    {msg.response.suggested_followups && msg.response.suggested_followups.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Suggested Follow-ups:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.response.suggested_followups.map((f, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleAsk(f)}
                              className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-red-400 text-xs">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Searching vector index & evaluating evidence grounding...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="space-y-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask a natural-language question about uploaded documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition shadow-md"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-red-950/60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Investigate</span>
          </button>
        </form>

        {/* Preset chips quick bar */}
        <div className="hidden sm:block">
          <DemoPromptChips onSelectPrompt={(p) => handleAsk(p)} />
        </div>
      </div>

      {/* Evidence Inspector Side Panel */}
      <EvidencePanel citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </div>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Investigation Interface...</div>}>
      <InvestigateContent />
    </Suspense>
  );
}
