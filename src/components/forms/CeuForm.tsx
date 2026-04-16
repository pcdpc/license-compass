'use client';

import React, { useState, useRef } from 'react';
import type { CeuCategory } from '@/types/schema';
import { Save, X, Upload, FileText, CheckCircle } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

interface CeuFormProps {
  onSubmit: (data: {
    title: string;
    provider: string;
    courseDate: string;
    hours: number;
    category: CeuCategory;
    appliesToStates: string[];
    notes: string;
    certificateFile?: File | null;
  }) => void | Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";
const labelClass = "block text-sm font-bold text-zinc-300 mb-1.5";
const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none";

export function CeuForm({ onSubmit, onCancel }: CeuFormProps) {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [courseDate, setCourseDate] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [category, setCategory] = useState<CeuCategory>('general');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleState = (code: string) => {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ 
        title, 
        provider, 
        courseDate, 
        hours, 
        category, 
        appliesToStates: selectedStates, 
        notes,
        certificateFile: file
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-zinc-100">Course Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Course Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Pharmacology Update 2025" required />
          </div>
          <div>
            <label className={labelClass}>Provider / Institution</label>
            <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} className={inputClass} placeholder="AANP" required />
          </div>
          <div>
            <label className={labelClass}>Course Date</label>
            <input type="date" value={courseDate} onChange={(e) => setCourseDate(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Hours</label>
            <input type="number" step="0.5" min="0.5" value={hours || ''} onChange={(e) => setHours(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="2.0" required />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as CeuCategory)} className={selectClass}>
              <option value="general">General</option>
              <option value="pharmacology">Pharmacology</option>
              <option value="ethics">Ethics</option>
              <option value="controlled_substance">Controlled Substance</option>
              <option value="prescribing">Prescribing</option>
              <option value="jurisprudence">Jurisprudence</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* File Upload Section */}
          <div className="md:col-span-2">
            <label className={labelClass}>Certificate Document (Optional)</label>
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
              >
                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-300">Upload Certificate</p>
                <p className="text-xs text-zinc-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-100 truncate">{file.name}</p>
                    <p className="text-xs text-emerald-400/70 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-3">Applies to States</h2>
        <p className="text-sm text-zinc-400 mb-4 font-medium">Select which states this CEU should count toward.</p>
        <div className="flex flex-wrap gap-2">
          {US_STATES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleState(code)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                selectedStates.includes(code)
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-3">Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass + ' resize-none'} placeholder="Optional notes..." />
      </div>

      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-400 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button type="submit" disabled={saving || !title} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Log CEU'}
        </button>
      </div>
    </form>
  );
}

