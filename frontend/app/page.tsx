'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Upload, Sparkles, FileText, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import DashboardStats from '@/components/DashboardStats';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import { fetchDashboardStats, loadDemoData, DashboardStats as StatsType } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoData();
      await loadStats();
      alert('✓ Demo documents loaded & indexed successfully! Try asking demo questions in Investigate tab.');
    } catch (e) {
      alert('Failed to load demo documents. Check backend server connection.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 p-6 md:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ALGOTHON'26 MVP — ALG-AI-02</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            DocIntel AI — Intelligent Document Investigator
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Multi-document extraction, vector RAG search, grounded citation answers, explicit conflict detection, and uncertainty handling.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/investigate"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-lg shadow-red-950/60"
            >
              <Search className="w-4 h-4" />
              <span>Start Q&A Investigation</span>
            </Link>

            <button
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs transition border border-slate-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isDemoLoading ? 'Loading Demo...' : 'Load 3-Doc Demo Suite'}</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs transition border border-slate-800"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Docs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">Platform Metrics Overview</h2>
          <button onClick={loadStats} className="text-slate-400 hover:text-white p-1 rounded transition">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <DashboardStats stats={stats} />
      </div>

      {/* Two Column Layout: Recent Documents & Recent Investigations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">Indexed Documents</h3>
            </div>
            <Link href="/documents" className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.recent_documents || stats.recent_documents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No documents indexed yet.</p>
              <button
                onClick={handleLoadDemo}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-medium hover:bg-red-900/80 transition"
              >
                Click to load hackathon demo data
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 font-mono text-[10px] font-bold border border-blue-800/50">
                      {doc.file_type}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate">{doc.filename}</span>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0 text-[11px] text-slate-400">
                    <span>{doc.total_chunks} Chunks</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-medium">
                      ✓ {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Investigations */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white text-sm">Recent Q&A Investigations</h3>
            </div>
            <Link href="/investigate" className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1">
              <span>Investigate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.recent_investigations || stats.recent_investigations.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No investigations run yet.</p>
              <Link
                href="/investigate"
                className="inline-block px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition"
              >
                Ask a natural-language question
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_investigations.map((inv: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{inv.question}</span>
                    {inv.has_conflict ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800/60 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Conflict</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                        {inv.evidence_status}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {inv.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadStats()}
      />
    </div>
  );
}
