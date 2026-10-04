'use client';

import React from 'react';
import { Sparkles, AlertTriangle, HelpCircle, FileCheck } from 'lucide-react';

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

export default function DemoPromptChips({ onSelectPrompt }: Props) {
  const demoPrompts = [
    {
      text: 'What is the refund period?',
      badge: 'Conflict Test',
      color: 'bg-amber-950/60 border-amber-700/60 text-amber-300 hover:bg-amber-900/80',
      icon: AlertTriangle
    },
    {
      text: 'What documents are required?',
      badge: 'Multi-doc Citation',
      color: 'bg-blue-950/60 border-blue-700/60 text-blue-300 hover:bg-blue-900/80',
      icon: FileCheck
    },
    {
      text: 'What is the cancellation policy?',
      badge: 'Grounded Answer',
      color: 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/80',
      icon: FileCheck
    },
    {
      text: 'What information is not available in the documents?',
      badge: 'Uncertainty Test',
      color: 'bg-purple-950/60 border-purple-700/60 text-purple-300 hover:bg-purple-900/80',
      icon: HelpCircle
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-red-400" />
        <span>Judges Demo Questions (1-Click Presets):</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {demoPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(p.text)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition shadow-sm ${p.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{p.text}</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/40 border border-white/10 font-mono">
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
