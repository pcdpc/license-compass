'use client';

import React from 'react';
import { ShieldCheck, MapPin, Clock, Award, AlertTriangle, ExternalLink, CheckCircle2, Info, Plus } from 'lucide-react';
import type { StateLicense, AprnRequirementDefault, CeuEntry, PracticeHourEntry, CertificationEntry } from '@/types/schema';

interface CeuRequirementPanelProps {
  license: StateLicense;
  requirement: AprnRequirementDefault;
  ceus: CeuEntry[];
  practiceHours: PracticeHourEntry[];
  certifications: CertificationEntry[];
  manualNotes?: string;
  onLogCeu?: () => void;
}

export default function CeuRequirementPanel({ 
  license, 
  requirement, 
  ceus, 
  practiceHours, 
  certifications,
  manualNotes,
  onLogCeu
}: CeuRequirementPanelProps) {
  const formatDisplayDate = (dateVal: any) => {
    if (!dateVal) return null;
    try {
      // Handle Firestore Timestamp
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal + (typeof dateVal === 'string' && !dateVal.includes('T') ? 'T00:00:00' : ''));
      return isNaN(d.getTime()) ? null : d.toLocaleDateString();
    } catch (e) {
      return null;
    }
  };

  const stateCeus = ceus.filter(c => 
    Array.isArray(c.appliesToStates) && 
    (c.appliesToStates.includes(requirement.stateAbbreviation) || c.appliesToStates.includes('ALL'))
  );
  const totalHours = stateCeus.reduce((sum, c) => sum + (c.hours || 0), 0);
  const pharmHours = stateCeus.reduce((sum, c) => sum + (c.pharmacologyHours || 0), 0);
  const controlledHours = stateCeus.reduce((sum, c) => sum + (c.controlledSubstanceHours || 0), 0);

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          APRN Requirement Summary
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            {requirement.renewalCycle} Renewal Cycle
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Deadline: {formatDisplayDate(license.aprnExpirationDate) || 'Set Expiration'}
          </span>
        </div>
        {onLogCeu && (
          <button 
            onClick={onLogCeu}
            className="absolute right-6 top-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Log CEU
          </button>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Hours</p>
            <p className="text-2xl font-black text-white">{totalHours} <span className="text-sm text-zinc-500">/ {requirement.totalCeHoursRequired || 0}</span></p>
            <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalHours / (requirement.totalCeHoursRequired || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pharmacology</p>
            <p className="text-2xl font-black text-white">{pharmHours} <span className="text-sm text-zinc-500">/ {requirement.pharmacologyHoursRequired || 0}</span></p>
            <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (pharmHours / (requirement.pharmacologyHoursRequired || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Practice Hours</p>
            <p className="text-2xl font-black text-white">
              {practiceHours.length > 0 ? 'Verified' : 'Required'}
            </p>
          </div>
        </div>

        {/* Detailed Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Specific Requirements */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              State Mandates
            </h3>
            <div className="space-y-3">
              {(requirement.mandatoryTopics || []).map((topic, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-700 mt-0.5" />
                  {topic}
                </div>
              ))}
              {(requirement.oneTimeRequirements || []).length > 0 && (
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">One-Time Requirements</p>
                  <ul className="space-y-2">
                    {(requirement.oneTimeRequirements || []).map((item, idx) => (
                      <li key={idx} className="text-[11px] font-bold text-zinc-400 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Source and Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-500" />
              Board Info
            </h3>
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-4">
              {requirement.sourceUrl && (
                <a 
                  href={requirement.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Visit Official Board Rules <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {requirement.notes && (
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Board Notes</p>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">{requirement.notes}</p>
                </div>
              )}
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last Verified</p>
                <p className="text-xs text-zinc-400">{requirement.lastVerified}</p>
              </div>
            </div>

            {manualNotes && manualNotes.trim() && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Manual Addendum</p>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{manualNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
