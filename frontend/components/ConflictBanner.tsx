'use client';

import React from 'react';
import { AlertTriangle, GitCompare, ShieldAlert } from 'lucide-react';
import { Conflict } from '@/lib/api';

interface Props {
  conflict: Conflict;
}

export default function ConflictBanner({ conflict }: Props) {
  return (
    <div className="p-4 rounded-xl bg-amber-950/60 border-2 border-amber-600/60 text-amber-200 shadow-xl space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-sm text-amber-300 block">⚠ CONFLICT DETECTED</span>
            <span className="text-xs text-amber-200/80 font-medium">{conflict.topic}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700/50">
          Contradictory Sources
        </span>
      </div>

      <p className="text-xs text-amber-100 font-medium leading-relaxed bg-amber-950/80 p-2.5 rounded-lg border border-amber-800/50">
        {conflict.explanation}
      </p>

      {/* Side-by-side sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        {/* Source A */}
        <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-700/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-[11px] truncate">{conflict.source_a.document_name}</span>
            <span className="text-[10px] text-amber-400 font-mono">Page {conflict.source_a.page_number}</span>
          </div>
          <p className="text-slate-300 italic text-[11px] leading-snug line-clamp-3">
            "{conflict.source_a.quote}"
          </p>
        </div>

        {/* Source B */}
        <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-700/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-[11px] truncate">{conflict.source_b.document_name}</span>
            <span className="text-[10px] text-amber-400 font-mono">Page {conflict.source_b.page_number}</span>
          </div>
          <p className="text-slate-300 italic text-[11px] leading-snug line-clamp-3">
            "{conflict.source_b.quote}"
          </p>
        </div>
      </div>
    </div>
  );
}
