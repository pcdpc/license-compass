'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Plus, 
  AlertTriangle,
  Loader2,
  Calendar,
  CheckCircle2,
  X,
  PlusCircle,
  Award,
  History,
  Info,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getUserLicenses, 
  getUserCeus, 
  createCeu, 
  getAprnRequirementDefaults,
  getUserPracticeHours,
  getUserCertifications,
  deleteCeu
} from '@/lib/firestore';
import type { StateLicense, CeuEntry, AprnRequirementDefault, PracticeHourEntry, CertificationEntry } from '@/types/schema';
import Link from 'next/link';
import CeuForm from '@/components/forms/CeuForm';
import { Timestamp } from 'firebase/firestore';

export default function CeusPage() {
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

  const { user } = useAuth();
  const [licenses, setLicenses] = useState<StateLicense[]>([]);
  const [ceus, setCeus] = useState<CeuEntry[]>([]);
  const [defaults, setDefaults] = useState<AprnRequirementDefault[]>([]);
  const [practiceHours, setPracticeHours] = useState<PracticeHourEntry[]>([]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [lData, cData, dData, hData, certData] = await Promise.all([
          getUserLicenses(user.uid),
          getUserCeus(user.uid),
          getAprnRequirementDefaults(),
          getUserPracticeHours(user.uid),
          getUserCertifications(user.uid)
        ]);
        setLicenses(lData);
        setCeus(cData);
        setDefaults(dData);
        setPracticeHours(hData);
        setCertifications(certData);
      } catch (error) {
        console.error("Error fetching competency data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    try {
      await createCeu(user.uid, data);
      const updated = await getUserCeus(user.uid);
      setCeus(updated);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving CEU:", error);
      alert("Failed to save CEU record.");
    }
  };

  const handleDeleteCeu = async (ceuId: string) => {
    console.log("Attempting to delete CEU:", ceuId);
    try {
      await deleteCeu(user!.uid, ceuId);
      const updated = await getUserCeus(user!.uid);
      setCeus(updated);
      console.log("Delete successful");
    } catch (error) {
      console.error("Error deleting CEU:", error);
      alert("Failed to delete CEU record.");
    }
  };

  const STATE_ABBREV_MAP: Record<string, string> = {
    'District of Columbia': 'DC',
    'Arizona': 'AZ',
    'Florida': 'FL',
    'Kansas': 'KS',
    'New Mexico': 'NM',
    'Oklahoma': 'OK',
    'Virginia': 'VA',
    'Georgia': 'GA',
    'Washington': 'WA',
    'Utah': 'UT',
  };

  const getDeriveAbbrev = (l: StateLicense) => {
    if (l.stateCode && l.stateCode.length === 2) return l.stateCode.toUpperCase();
    return STATE_ABBREV_MAP[l.stateName] || l.stateCode || l.stateName;
  };

  const activeLicenses = licenses.filter(l => {
    const aprnStatusStr = String(l.aprnStatus || '').toLowerCase();
    const isAprnActive = aprnStatusStr.includes('active');
    const readiness = String((l as any).readiness || l.readyStatus || '').toLowerCase();
    const isReady = readiness === 'ready' || readiness === 'almost_ready' || readiness === 'almost ready';
    return isAprnActive && isReady;
  });

  const debugInfo = licenses.map(l => {
    const aprnStatusStr = String(l.aprnStatus || '').toLowerCase();
    const isAprnActive = aprnStatusStr.includes('active');
    const readiness = String((l as any).readiness || l.readyStatus || '').toLowerCase();
    const isReady = readiness === 'ready' || readiness === 'almost_ready' || readiness === 'almost ready';
    const abbrev = getDeriveAbbrev(l);
    const hasDefault = defaults.some(d => d.stateAbbreviation === abbrev);
    return {
      state: l.stateName,
      aprnStatus: l.aprnStatus,
      readyStatus: l.readyStatus,
      readiness: (l as any).readiness,
      isAprnActive,
      isReady,
      abbrev,
      hasDefault,
      failedReason: !isAprnActive ? 'APRN Status not active' : !isReady ? `Readiness/ReadyStatus (${readiness}) not Ready/Almost Ready` : null
    };
  });

  const getRequirementsForState = (license: StateLicense) => {
    if (license.customCeRequirements) return license.customCeRequirements as AprnRequirementDefault;
    const abbrev = getDeriveAbbrev(license);
    return defaults.find(d => d.stateAbbreviation === abbrev) || null;
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 font-medium mb-4 transition-colors">
            <X className="w-4 h-4" /> Cancel
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Log CEU Course</h1>
        </div>
        <CeuForm 
          onSubmit={handleSubmit} 
          onCancel={() => {
            setShowForm(false);
            setInitialFormData(null);
          }} 
          initialData={initialFormData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-100 to-zinc-500 tracking-tighter text-glow">
            Competency Tracker
          </h1>
          <p className="text-zinc-400 mt-2 font-medium max-w-2xl">
            Centralized APRN CEU and requirement management across all active states.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Log CEU
          </button>
        </div>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed font-medium italic">
          “CEU and APRN renewal requirements change frequently. This tool is for tracking convenience only. Always verify current requirements directly with the applicable Board of Nursing before renewal.”
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p className="font-medium animate-pulse">Loading your competency profile...</p>
        </div>
      ) : (
        <>
          {activeLicenses.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-white/5">
              <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-200 mb-2">No Active APRN Licenses</h2>
              <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">No active APRN licenses with CEU tracking data were found. If active licenses exist, check whether APRN status, readiness, and state abbreviation are mapped correctly.</p>
              <Link href="/licenses/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-all border border-white/10">
                <Plus className="w-4 h-4" /> Add License
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeLicenses.map((license) => {
                const req = getRequirementsForState(license);
                if (!req) {
                  return (
                    <div key={license.id} className="glass-panel p-6 rounded-2xl border border-white/5 opacity-80">
                       <div className="flex items-start justify-between">
                         <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                           <MapPin className="w-5 h-5 text-indigo-400" />
                           {license.stateName} <span className="text-sm text-zinc-500 ml-1">APRN</span>
                         </h2>
                       </div>
                       <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                         <p className="text-sm text-amber-400 font-medium flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" /> No APRN CEU default imported for this state.
                         </p>
                         <Link href={`/licenses/${license.id}`} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all">
                           Edit Requirement
                         </Link>
                       </div>
                    </div>
                  );
                }

                const stateCeus = ceus.filter(c => 
                  Array.isArray(c.appliesToStates) && 
                  (c.appliesToStates.includes(req.stateAbbreviation) || c.appliesToStates.includes('ALL'))
                );
                const totalHours = stateCeus.reduce((sum, c) => sum + (c.hours || 0), 0);
                const pharmHours = stateCeus.reduce((sum, c) => sum + (c.pharmacologyHours || 0), 0);
                const controlledHours = stateCeus.reduce((sum, c) => sum + (c.controlledSubstanceHours || 0), 0);

                return (
                  <div key={license.id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-indigo-400" />
                            {license.stateName}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                              {req.renewalCycle} Cycle
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Deadline: {formatDisplayDate(license.aprnExpirationDate) || 'Set Expiration'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">State Progress</p>
                          <p className="text-2xl font-black text-zinc-100">
                            {totalHours} <span className="text-zinc-500 text-sm">/ {req.totalCeHoursRequired || 0} hrs</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hours Section */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Hourly Requirements
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                             <div className="text-xs font-bold text-zinc-300">Total CE Hours</div>
                             <div className="text-xs font-black text-zinc-100">{totalHours} / {req.totalCeHoursRequired || 0}</div>
                          </div>
                          {req.pharmacologyHoursRequired !== null && (
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                               <div className="text-xs font-bold text-zinc-300">Pharmacology</div>
                               <div className={`text-xs font-black ${pharmHours >= req.pharmacologyHoursRequired ? 'text-emerald-400' : 'text-amber-400'}`}>
                                 {pharmHours} / {req.pharmacologyHoursRequired}
                               </div>
                            </div>
                          )}
                          {req.controlledSubstanceHoursRequired !== null && (
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                               <div className="text-xs font-bold text-zinc-300">Controlled Substances</div>
                               <div className={`text-xs font-black ${controlledHours >= req.controlledSubstanceHoursRequired ? 'text-emerald-400' : 'text-amber-400'}`}>
                                 {controlledHours} / {req.controlledSubstanceHoursRequired}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Competency Section */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Award className="w-3 h-3" /> Competencies
                        </h3>
                        <div className="space-y-2">
                          {req.requiresNationalCertification && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${certifications.length > 0 ? 'text-emerald-400' : 'text-zinc-700'}`} />
                              National Certification
                            </div>
                          )}
                          {req.requiresPracticeHours && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${practiceHours.length > 0 ? 'text-emerald-400' : 'text-zinc-700'}`} />
                              Clinical Practice Hours ({req.practiceHoursRequired} hrs)
                            </div>
                          )}
                          {(req.mandatoryTopics || []).map((topic, i) => (
                            <div key={topic+i} className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto p-4 bg-zinc-900/50 border-t border-white/5 flex items-center justify-between">
                      <Link href={`/licenses/${license.id}`} className="text-[10px] font-black text-zinc-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                        View Details & Documents
                      </Link>
                      <button 
                        onClick={() => {
                          setInitialFormData({
                            appliesToStates: [req.stateAbbreviation],
                            courseDate: new Date().toISOString().split('T')[0]
                          });
                          setShowForm(true);
                        }}
                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" /> Log Activity
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Log History Section */}
          {!loading && ceus.length > 0 && (
            <div className="space-y-6 mt-12">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-400" />
                  Log History
                </h2>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {ceus.length} Records Total
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ceus.map((ceu) => (
                  <div key={ceu.id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (ceu.id) handleDeleteCeu(ceu.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-rose-500/20 text-rose-500 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-[100] cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="mb-4 relative z-10">
                      <h3 className="text-sm font-black text-zinc-100 truncate pr-8 leading-tight">{ceu.courseName}</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{ceu.provider}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-xs font-bold text-zinc-200">{new Date(ceu.courseDate).toLocaleDateString()}</p>
                      </div>
                      <div className="p-2.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Hrs</p>
                        <p className="text-xs font-black text-white">{ceu.hours} hrs</p>
                      </div>
                    </div>

                    {(ceu.pharmacologyHours > 0 || ceu.controlledSubstanceHours > 0) && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 relative z-10">
                        {ceu.pharmacologyHours > 0 && (
                          <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                            Pharm: {ceu.pharmacologyHours}h
                          </div>
                        )}
                        {ceu.controlledSubstanceHours > 0 && (
                          <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            Substance: {ceu.controlledSubstanceHours}h
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
                      {Array.isArray(ceu.appliesToStates) && ceu.appliesToStates.map(st => (
                        <span key={st} className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-zinc-500 rounded border border-white/5">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
