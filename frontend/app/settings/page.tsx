'use client';

import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Database, Key, CheckCircle2, AlertCircle, RefreshCw, Trash2, Sparkles } from 'lucide-react';
import { fetchHealth, loadDemoData } from '@/lib/api';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setIsLoading(true);
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch (e) {
      setHealthData({ status: 'offline' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadDemo = async () => {
    try {
      await loadDemoData();
      await checkBackend();
      alert('✓ Demo data successfully re-indexed into vector storage!');
    } catch (e) {
      alert('Failed to reload demo data');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">
          Backend API health status, vector store configuration, and hackathon demo controls.
        </p>
      </div>

      {/* Backend Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-white text-base">FastAPI Backend Status</h3>
          </div>
          <button onClick={checkBackend} className="text-slate-400 hover:text-white p-1 rounded transition">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {healthData?.status === 'healthy' ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Backend Service Connected & Healthy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block">Service</span>
                <span className="text-slate-200 font-medium">{healthData.service}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Version</span>
                <span className="text-slate-200 font-mono font-medium">{healthData.version}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Indexed Docs</span>
                <span className="text-slate-200 font-mono font-medium">{healthData.indexed_documents}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Vector Chunks</span>
                <span className="text-slate-200 font-mono font-medium">{healthData.total_chunks}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>Backend service is offline. Please launch FastAPI backend on port 8000.</span>
          </div>
        )}
      </div>

      {/* Vector Engine & API Keys Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white text-base">LLM & Embedding Engine Configuration</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          DocIntel AI features a dual-mode engine: it runs completely offline out-of-the-box using the built-in TF-IDF vector index and grounded local synthesizer, or connects to OpenAI / Google Gemini APIs if environment keys are supplied.
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Local Vector Index (scikit-learn TF-IDF + Cosine Similarity)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              ACTIVE (100% Offline Ready)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Google Gemini API Key</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              healthData?.has_gemini_key ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {healthData?.has_gemini_key ? 'CONNECTED' : 'NOT CONFIGURED (Using Local Fallback)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">OpenAI API Key</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              healthData?.has_openai_key ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {healthData?.has_openai_key ? 'CONNECTED' : 'NOT CONFIGURED (Using Local Fallback)'}
            </span>
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white text-base">Hackathon Demo Controls</h3>
        </div>

        <p className="text-xs text-slate-400">
          Reset vector store and re-index the pre-configured sample document suite (Company Policy 2025, Master Terms 2026, SLA Agreement).
        </p>

        <button
          onClick={handleReloadDemo}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center space-x-2 shadow-md shadow-purple-950/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>Reload Hackathon Demo Data</span>
        </button>
      </div>
    </div>
  );
}
