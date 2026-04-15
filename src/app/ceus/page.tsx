'use client';

import React, { useState } from 'react';
import { Award, Plus, BookOpen, FlaskConical, Scale, X } from 'lucide-react';
import { CeuForm } from '@/components/forms/CeuForm';
import type { CeuCategory } from '@/types/schema';

// Mock CEU data
const mockCeus: { id: string; title: string; provider: string; courseDate: string; hours: number; category: CeuCategory; appliesToStates: string[] }[] = [
  { id: '1', title: 'Advanced Pharmacology Update 2025', provider: 'AANP', courseDate: '2025-03-15', hours: 10, category: 'pharmacology', appliesToStates: ['GA', 'TX'] },
  { id: '2', title: 'Ethics in Telehealth', provider: 'ANCC', courseDate: '2025-02-20', hours: 3, category: 'ethics', appliesToStates: ['GA'] },
  { id: '3', title: 'Controlled Substance Prescribing', provider: 'State Board CE', courseDate: '2025-01-10', hours: 2, category: 'controlled_substance', appliesToStates: ['GA', 'TX', 'AZ'] },
  { id: '4', title: 'Primary Care Review', provider: 'Medscape', courseDate: '2024-12-05', hours: 15, category: 'general', appliesToStates: ['GA', 'TX', 'AZ'] },
];

const categoryIcons: Record<CeuCategory, React.ReactNode> = {
  general: <BookOpen className="w-4 h-4" />,
  pharmacology: <FlaskConical className="w-4 h-4" />,
  ethics: <Scale className="w-4 h-4" />,
  controlled_substance: <Award className="w-4 h-4" />,
  prescribing: <BookOpen className="w-4 h-4" />,
  jurisprudence: <Scale className="w-4 h-4" />,
  other: <BookOpen className="w-4 h-4" />,
};

const categoryColors: Record<CeuCategory, string> = {
  general: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  pharmacology: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  ethics: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  controlled_substance: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  prescribing: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  jurisprudence: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  other: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

export default function CeusPage() {
  const [showForm, setShowForm] = useState(false);
  const [ceus, setCeus] = useState(mockCeus);

  const totalHours = ceus.reduce((sum, c) => sum + c.hours, 0);
  const pharmHours = ceus.filter((c) => c.category === 'pharmacology').reduce((sum, c) => sum + c.hours, 0);
  const ethicsHours = ceus.filter((c) => c.category === 'ethics').reduce((sum, c) => sum + c.hours, 0);

  const handleSubmit = async (data: any) => {
    const newCeu = { id: String(ceus.length + 1), ...data };
    setCeus((prev) => [newCeu, ...prev]);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 font-medium mb-4 transition-colors">
            <X className="w-4 h-4" />
            Cancel
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Log CEU</h1>
        </div>
        <CeuForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">CEU Tracker</h1>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30">
          <Plus className="w-4 h-4" />
          Log CEU
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Hours', value: totalHours, color: 'text-indigo-400', glow: 'bg-indigo-500/10' },
          { label: 'Pharmacology', value: pharmHours, color: 'text-purple-400', glow: 'bg-purple-500/10' },
          { label: 'Ethics', value: ethicsHours, color: 'text-amber-400', glow: 'bg-amber-500/10' },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.glow} rounded-full blur-2xl opacity-30 group-hover:scale-150 transition-all duration-700`}></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-zinc-400 mb-1">{card.label}</p>
              <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}<span className="text-lg ml-1 text-zinc-500">hrs</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* CEU List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-zinc-100">Logged CEUs</h2>
        </div>
        <div className="divide-y divide-white/5">
          {ceus.map((ceu) => (
            <div key={ceu.id} className="px-6 py-4 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl border ${categoryColors[ceu.category]}`}>
                    {categoryIcons[ceu.category]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100">{ceu.title}</p>
                    <p className="text-xs text-zinc-500 font-medium">{ceu.provider} · {new Date(ceu.courseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {ceu.appliesToStates.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-bold bg-white/5 border border-white/10 rounded text-zinc-400">{s}</span>
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-zinc-200 whitespace-nowrap">{ceu.hours} hrs</span>
                </div>
              </div>
            </div>
          ))}
          {ceus.length === 0 && (
            <div className="px-6 py-12 text-center text-sm font-medium text-zinc-500">No CEUs logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
