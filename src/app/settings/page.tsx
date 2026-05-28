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
  Download,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, toDate } from '@/lib/firestore';
import { generateUserDataCSV, downloadCSV } from '@/lib/export-utils';
import type { UserProfile, Timestamp } from '@/types/schema';
import { auth } from '@/lib/firebase';
import { hasPremiumAccess } from '@/lib/billing';

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
  const [showCancelSubModal, setShowCancelSubModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (userProfile) {
      setForm(userProfile);
    }
  }, [userProfile]);

  // Subscription Info Helper
  const getSubscriptionInfo = () => {
    if (!userProfile) return null;
    
    const role = userProfile.role;
    if (role === 'admin') {
      return {
        statusLabel: 'Super Admin Access',
        colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        message: 'You have full system administrator privileges and bypass all subscription controls.',
        details: []
      };
    }

    const provider = userProfile.subscriptionProvider || 'NP Compass (Internal)';
    const status = userProfile.subscriptionStatus || 'none';
    const accStatus = userProfile.accountStatus;
    const isSuspended = userProfile.paymentSuspended === true || accStatus === 'suspended';
    
    const trialStart = toDate(userProfile.trialStartDate) || toDate(userProfile.createdAt) || new Date();
    const trialEnd = toDate(userProfile.trialEndDate);
    const now = new Date();
    
    // 1. Payment Suspended
    if (isSuspended) {
      return {
        statusLabel: 'Payment Required',
        colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        message: 'Your account is suspended due to a payment issue or failed renewal. Access is restricted until payment is resolved.',
        details: [
          { label: 'Provider', value: provider },
          { label: 'Status', value: 'Suspended' }
        ]
      };
    }

    // 2. Trial Status / Expired Trial Status
    if (status === 'trialing' || accStatus === 'trial' || accStatus === 'trialing' || trialEnd) {
      if (trialEnd) {
        const totalTrialMs = trialEnd.getTime() - trialStart.getTime();
        const totalDays = Math.max(1, Math.round(totalTrialMs / (1000 * 60 * 60 * 24)));
        const elapsedMs = now.getTime() - trialStart.getTime();
        const elapsedDays = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));
        const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const dayNumber = Math.min(totalDays, elapsedDays);
        
        const isExpired = trialEnd < now;
        if (isExpired) {
          return {
            statusLabel: 'Expired Trial',
            colorClass: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20 border',
            message: 'Your 14-day free trial has expired. Upgrade your account to keep access to licenses and CEU management.',
            details: [
              { label: 'Trial Started', value: trialStart.toLocaleDateString() },
              { label: 'Trial Ended', value: trialEnd.toLocaleDateString() }
            ]
          };
        }

        if (status === 'trialing' || accStatus === 'trial' || accStatus === 'trialing') {
          return {
            statusLabel: `Trial Active — Day ${dayNumber} of ${totalDays}`,
            colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
            message: `You are currently on a free trial. You have ${daysLeft} days remaining to explore premium features.`,
            details: [
              { label: 'Trial Start Date', value: trialStart.toLocaleDateString() },
              { label: 'Trial End Date', value: trialEnd.toLocaleDateString() },
              { label: 'Days Remaining', value: `${daysLeft} days` }
            ]
          };
        }
      }
    }

    // 3. Subscription Active
    if (status === 'active' || accStatus === 'active') {
      const renewalDate = userProfile.currentPeriodEnd ? toDate(userProfile.currentPeriodEnd) : null;
      return {
        statusLabel: 'Subscription Active',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        message: 'Thank you for being a premium subscriber! You have full access to all features, trackers, and notifications.',
        details: [
          { label: 'Subscription Provider', value: provider },
          { label: 'Current Period End', value: renewalDate ? renewalDate.toLocaleDateString() : 'N/A' },
          { label: 'Status', value: 'Active' }
        ]
      };
    }

    // 4. Subscription Canceled (Grace Period checking)
    if (status === 'canceled' || accStatus === 'canceled') {
      const periodEnd = userProfile.currentPeriodEnd ? toDate(userProfile.currentPeriodEnd) : null;
      const isPast = periodEnd ? periodEnd < now : true;
      
      if (isPast) {
        return {
          statusLabel: 'Canceled',
          colorClass: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
          message: 'Your subscription has been canceled and the active billing period has ended. Access is locked.',
          details: [
            { label: 'Subscription Provider', value: provider },
            { label: 'Access Ended', value: periodEnd ? periodEnd.toLocaleDateString() : 'N/A' }
          ]
        };
      }

      return {
        statusLabel: 'Canceled — Ending Soon',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        message: 'Your subscription has been canceled, but you retain access until the end of your current billing period.',
        details: [
          { label: 'Subscription Provider', value: provider },
          { label: 'Access Expiration', value: periodEnd ? periodEnd.toLocaleDateString() : 'N/A' }
        ]
      };
    }

    // 5. Default fallback
    return {
      statusLabel: 'No Active Subscription',
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      message: 'Your account does not have an active subscription or trial. Please upgrade to unlock NP Compass.',
      details: []
    };
  };

  const subInfo = getSubscriptionInfo();

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
    try {
      const d = toDate(dateVal);
      if (!d || isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleCancelSubscription = () => {
    // Direct them to support email for cancellation right now, or the billing page
    window.location.href = "mailto:support@npcompass.app?subject=Cancel%20Subscription%20(No%20Refund)&body=Please%20cancel%20my%20subscription.%20I%20understand%20there%20are%20no%20refunds.";
    setShowCancelSubModal(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !user) return;
    setIsDeleting(true);
    try {
      // Import this dynamically or ensure it's available
      const { deleteUserFullAccount } = await import('@/lib/firestore');
      await deleteUserFullAccount(user.uid);
      await user.delete();
      // Auth context will detect deletion and log them out
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, you must log out and log back in before deleting your account.");
      } else {
        alert("Failed to delete account. Please contact support.");
      }
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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

          {/* Other Professional Affiliations */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Other Professional Affiliations</h2>
            </div>

            <div className="space-y-4">
              {(form.otherAffiliations || []).map((aff, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <button 
                    onClick={() => {
                      const newAffs = [...(form.otherAffiliations || [])];
                      newAffs.splice(idx, 1);
                      update('otherAffiliations', newAffs);
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="md:col-span-1">
                    <label className={labelClass}>Affiliation/Org Name</label>
                    <input 
                      type="text" 
                      value={aff.name || ''} 
                      onChange={(e) => {
                        const newAffs = [...(form.otherAffiliations || [])];
                        newAffs[idx] = { ...newAffs[idx], name: e.target.value };
                        update('otherAffiliations', newAffs);
                      }}
                      className={inputClass}
                      placeholder="e.g. AANP Member"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Certification # (Optional)</label>
                    <input 
                      type="text" 
                      value={aff.certNumber || ''} 
                      onChange={(e) => {
                        const newAffs = [...(form.otherAffiliations || [])];
                        newAffs[idx] = { ...newAffs[idx], certNumber: e.target.value };
                        update('otherAffiliations', newAffs);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expiration Date (Optional)</label>
                    <input 
                      type="date" 
                      value={formatDateForInput(aff.expirationDate)} 
                      onChange={(e) => {
                        const newAffs = [...(form.otherAffiliations || [])];
                        newAffs[idx] = { ...newAffs[idx], expirationDate: e.target.value ? new Date(e.target.value) : null };
                        update('otherAffiliations', newAffs);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={() => {
                  const newAffs = [...(form.otherAffiliations || []), { name: '', certNumber: '', expirationDate: null }];
                  update('otherAffiliations', newAffs);
                }}
                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
                type="button"
              >
                <Plus className="w-4 h-4" /> Add Affiliation
              </button>
            </div>
          </div>

          {/* General Notes */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-zinc-500/10 rounded-xl">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Additional Information</h2>
            </div>
            
            <div>
              <label className={labelClass}>Notes</label>
              <textarea 
                value={form.generalNotes || ''} 
                onChange={(e) => update('generalNotes', e.target.value)}
                rows={6}
                className={inputClass + " resize-none"}
                placeholder="Store any additional information not captured in the web app here..."
              />
              <p className="text-xs text-zinc-500 mt-2 font-medium">Use this area for passwords, specific state-board login hints, or any other professional details.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Misc */}
        <div className="space-y-8">
          
          {/* Subscription & Billing Status Section */}
          {subInfo && (
            <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-zinc-100">Subscription Status</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-400">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${subInfo.colorClass}`}>
                    {subInfo.statusLabel}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 font-medium leading-relaxed bg-white/5 border border-white/5 p-4 rounded-xl">
                  {subInfo.message}
                </p>

                {subInfo.details.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-white/5">
                    {subInfo.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-semibold">{detail.label}</span>
                        <span className="text-zinc-200 font-bold">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
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
                type="button"
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

          {/* Danger Zone */}
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6 border border-rose-500/20">
            <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-rose-500">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200">Cancel Subscription</h3>
                  <p className="text-xs text-zinc-400 mt-1">Cancel your premium access. You will retain access until the end of your billing cycle. No refunds are provided.</p>
                </div>
                <button 
                  onClick={() => setShowCancelSubModal(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel Subscription
                </button>
              </div>

              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-rose-400">Delete Account</h3>
                  <p className="text-xs text-zinc-400 mt-1">Permanently delete your account, personal data, licenses, and documents. This cannot be undone.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white border border-rose-400/50 text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setShowCancelSubModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Cancel Subscription?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period. <strong>Please note that per our Refund Policy, no refunds will be issued for partial months or unused time.</strong>
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCancelSubModal(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-200"
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold rounded-xl transition-all"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-rose-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative">
            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-rose-500">Delete Account</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              This action is <strong>permanent and cannot be undone</strong>. All your personal data, licenses, CEUs, documents, and settings will be permanently erased from our servers.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Type "DELETE" to confirm</label>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-black border border-rose-500/30 rounded-xl px-4 py-2.5 text-sm text-rose-100 placeholder-rose-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/30 disabled:text-rose-200/50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center min-w-[120px]"
              >
                {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
