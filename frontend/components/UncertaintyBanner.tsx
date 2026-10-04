'use client';

import React from 'react';
import { HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  message?: string | null;
  onAskFollowup?: (question: string) => void;
}

export default function UncertaintyBanner({ message, onAskFollowup }: Props) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-700 text-slate-200 shadow-xl space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-red-950/80 flex items-center justify-center border border-red-800/60">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <span className="font-bold text-sm text-red-400 block">⚠ INSUFFICIENT EVIDENCE</span>
          <span className="text-xs text-slate-400 font-medium">No confident match in document store</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
        "I couldn't find enough information in the uploaded documents to answer this question confidently."
      </p>

      {onAskFollowup && (
        <div className="pt-1 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Next Steps:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAskFollowup('What is the refund period?')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition border border-slate-700"
            >
              Ask a more specific policy question
            </button>
            <button
              onClick={() => onAskFollowup('What documents are required?')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition border border-slate-700"
            >
              Check documentation requirements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
