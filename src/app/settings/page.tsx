'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Clock, 
  Globe, 
  User, 
  Save, 
  ShieldCheck, 
  CreditCard, 
  GraduationCap, 
  Stethoscope, 
  Calendar,
  Check,
  X,
  Plus,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, toDate } from '@/lib/firestore';
import { generateUserDataCSV, downloadCSV } from '@/lib/export-utils';
import type { UserProfile, Timestamp } from '@/types/schema';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
  'America/Anchorage', 'Pacific/Honolulu', 'America/Phoenix', 'UTC'
];

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";
const labelClass = "block text-sm font-bold text-zinc-300 mb-1.5";
const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none";

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (userProfile) {
      setForm(userProfile);
    }
  }, [userProfile]);

  const update = (path: string, value: any) => {
    setForm(prev => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };
      
      const newForm = { ...prev };
      let current: any = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user || !userProfile) return;
    setExporting(true);
    try {
      const csv = await generateUserDataCSV(user.uid, userProfile);
      const filename = `license_compass_data_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const formatDateForInput = (dateVal: any): string => {
    const d = toDate(dateVal);
    if (!d) return '';
    return d.toISOString().split('T')[0];
  };

  if (!userProfile) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Settings</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Manage your personal and notification preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30 disabled:opacity-50"
        >
          {loading ? 'Saving...' : success ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Details */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Professional Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input 
                  type="text" 
                  value={form.displayName || ''} 
                  onChange={(e) => update('displayName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" 
                  value={form.email || ''} 
                  className={inputClass + " opacity-50 cursor-not-allowed"} 
                  disabled
                />
              </div>
              <div>
                <label className={labelClass}>Credentials (e.g. NP-C, FNP-BC)</label>
                <input 
                  type="text" 
                  value={form.credentials || ''} 
                  onChange={(e) => update('credentials', e.target.value)}
                  className={inputClass}
                  placeholder="NP-C"
                />
              </div>
              <div>
                <label className={labelClass}>NPI Number</label>
                <input 
                  type="text" 
                  value={form.npiNumber || ''} 
                  onChange={(e) => update('npiNumber', e.target.value)}
                  className={inputClass}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className={labelClass}>Primary State of Residence</label>
                <select 
                  value={form.primaryState || ''} 
                  onChange={(e) => update('primaryState', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select State...</option>
                  {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input 
                  type="number" 
                  value={form.yearsExperience || ''} 
                  onChange={(e) => update('yearsExperience', parseInt(e.target.value))}
                  className={inputClass}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className={labelClass}>Specialty</label>
                <input 
                  type="text" 
                  value={form.specialty || ''} 
                  onChange={(e) => update('specialty', e.target.value)}
                  className={inputClass}
                  placeholder="Family Practice"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-200">Board Certification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Certifying Body (ANCC, AANP, etc)</label>
                  <input 
                    type="text" 
                    value={form.certifyingBody || ''} 
                    onChange={(e) => update('certifyingBody', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certificate Number</label>
                  <input 
                    type="text" 
                    value={form.certNumber || ''} 
                    onChange={(e) => update('certNumber', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certification Expiration</label>
                  <input 
                    type="date" 
                    value={formatDateForInput(form.certExpiration)} 
                    onChange={(e) => update('certExpiration', e.target.value ? new Date(e.target.value) : null)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-200">Malpractice Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Policy Number</label>
                  <input 
                    type="text" 
                    value={form.malpracticeNumber || ''} 
                    onChange={(e) => update('malpracticeNumber', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certificate/Version ID</label>
                  <input 
                    type="text" 
                    value={form.malpracticeCertNumber || ''} 
                    onChange={(e) => update('malpracticeCertNumber', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Expiration Date</label>
                  <input 
                    type="date" 
                    value={formatDateForInput(form.malpracticeCertExpiration)} 
                    onChange={(e) => update('malpracticeCertExpiration', e.target.value ? new Date(e.target.value) : null)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Misc */}
        <div className="space-y-8">
          
          {/* Notifications */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm font-bold text-zinc-200">Alerts Enabled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={form.settings?.notificationsEnabled || false}
                    onChange={(e) => update('settings.notificationsEnabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {form.settings?.notificationsEnabled && (
                <div className="space-y-2 pl-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Alert Thresholds</p>
                  {[
                    { key: 'license180', label: '180 Days Before Exp.' },
                    { key: 'license90', label: '90 Days Before Exp.' },
                    { key: 'license60', label: '60 Days Before Exp.' },
                    { key: 'license30', label: '30 Days Before Exp.' },
                    { key: 'license7', label: '7 Days Before Exp.' },
                    { key: 'deaExpiration', label: 'DEA Expiration' },
                    { key: 'missingDocuments', label: 'Missing Documents (Weekly)' },
                  ].map((alert) => (
                    <div key={alert.key} className="flex items-center justify-between py-2 group">
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{alert.label}</span>
                      <input 
                        type="checkbox" 
                        checked={(form.settings?.alertSettings as any)?.[alert.key] || false}
                        onChange={(e) => update(`settings.alertSettings.${alert.key}`, e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Localization */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Localization</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Timezone</label>
                <select 
                  value={form.settings?.timezone || ''} 
                  onChange={(e) => update('settings.timezone', e.target.value)}
                  className={selectClass}
                >
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <p className="text-xs text-zinc-500 mt-2">Adjusts how expiration dates are calculated.</p>
              </div>
            </div>
          </div>
          {/* Data & Portability */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Download className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Data & Portability</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Download a complete record of your professional profile, licenses, and CEU history in an Excel-compatible CSV format.
              </p>
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-zinc-100 font-bold text-sm rounded-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export All Data (.csv)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
