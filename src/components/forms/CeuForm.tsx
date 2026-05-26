'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  MapPin, 
  FileText, 
  Plus,
  X,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface CeuFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function CeuForm({ onSubmit, onCancel, initialData }: CeuFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      courseName: '',
      provider: '',
      courseDate: new Date().toISOString().split('T')[0],
      hours: 0,
      pharmacologyHours: 0,
      controlledSubstanceHours: 0,
      appliesToStates: ['ALL'],
      category: 'General CEU',
      notes: '',
      certificateUrl: ''
    }
  });

  const internalOnSubmit = async (data: any) => {
    // Convert string date to Firestore Timestamp
    const formattedData = {
      ...data,
      courseDate: Timestamp.fromDate(new Date(data.courseDate)),
      hours: Number(data.hours),
      pharmacologyHours: Number(data.pharmacologyHours),
      controlledSubstanceHours: Number(data.controlledSubstanceHours),
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(internalOnSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl space-y-8">
        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Course Name</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                {...register('courseName', { required: 'Course name is required' })}
                placeholder="e.g. Advanced Pharmacology Update"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>
            {errors.courseName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.courseName.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Provider</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                {...register('provider')}
                placeholder="e.g. AANP, Medscape, etc."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Date Completed</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="date"
                {...register('courseDate', { required: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all font-bold [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
            <select 
              {...register('category')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none"
            >
              <option value="General CEU">General CEU</option>
              <option value="Pharmacology">Pharmacology</option>
              <option value="Controlled Substance">Controlled Substance</option>
              <option value="Mandatory Topic">Mandatory Topic</option>
              <option value="In-Service">In-Service</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Applies to States</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                {...register('appliesToStates')}
                placeholder="e.g. GA, VA, ALL"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>
            <p className="text-[9px] text-zinc-600 font-bold ml-1 italic">Comma separated or "ALL"</p>
          </div>
        </div>

        {/* Hours Section */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Credit Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Contact Hours</label>
              <input 
                type="number"
                step="0.1"
                {...register('hours')}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pharmacology Hours</label>
              <input 
                type="number"
                step="0.1"
                {...register('pharmacologyHours')}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Controlled Substance</label>
              <input 
                type="number"
                step="0.1"
                {...register('controlledSubstanceHours')}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-amber-400 focus:outline-none focus:border-amber-500/50 transition-all font-bold text-lg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Notes</label>
          <textarea 
            {...register('notes')}
            placeholder="Add any details about this course..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 text-zinc-400 font-bold text-sm hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save CEU Record
        </button>
      </div>
    </form>
  );
}
