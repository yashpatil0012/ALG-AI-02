'use client';

import React from 'react';
import { Files, CheckCircle2, AlertTriangle, HelpCircle, Layers } from 'lucide-react';
import { DashboardStats as StatsType } from '@/lib/api';

interface Props {
  stats: StatsType | null;
}

export default function DashboardStats({ stats }: Props) {
  const cards = [
    {
      title: 'Total Documents',
      value: stats?.total_documents ?? 0,
      subtext: `${stats?.processed_documents ?? 0} indexed`,
      icon: Files,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-800/30',
    },
    {
      title: 'Processed Chunks',
      value: stats?.total_chunks ?? 0,
      subtext: 'Indexed in vector store',
      icon: Layers,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/30',
    },
    {
      title: 'Detected Conflicts',
      value: stats?.detected_conflicts_count ?? 0,
      subtext: 'Contradictory policies found',
      icon: AlertTriangle,
      color: (stats?.detected_conflicts_count ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400',
      bg: (stats?.detected_conflicts_count ?? 0) > 0 ? 'bg-amber-950/50 border-amber-600/50 animate-pulse' : 'bg-slate-900 border-slate-800',
    },
    {
      title: 'Questions Answered',
      value: stats?.questions_asked ?? 0,
      subtext: '100% grounded in evidence',
      icon: HelpCircle,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-xl border ${card.bg} backdrop-blur-sm transition hover:border-slate-700 shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</span>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-3xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 font-medium">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
