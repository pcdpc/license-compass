'use client';

import React, { useState } from 'react';
import type { StateLicense, CredentialStatus, DeaStatus, ApplicationStatus, DocumentCategory } from '@/types/schema';
import { Save, X, Link as LinkIcon, FileText, Award } from 'lucide-react';
import { DocumentSelectorModal } from '../documents/DocumentSelectorModal';

function formatDateForInput(dateVal: any): string {
  if (!dateVal) return '';
  try {
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else if (dateVal?.toDate) {
      d = dateVal.toDate();
    } else if (dateVal?.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

// US states
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
];

interface LicenseFormProps {
  initialData?: Partial<StateLicense>;
  onSubmit: (data: Partial<StateLicense>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";
const labelClass = "block text-sm font-bold text-zinc-300 mb-1.5";
const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none";

export function LicenseForm({ initialData, onSubmit, onCancel, onDelete, isEditing = false }: LicenseFormProps) {
  const [form, setForm] = useState<Partial<StateLicense>>({
    stateCode: '',
    stateName: '',
    rnRequired: true,
    aprnRequired: true,
    rnStatus: 'not_started',
    rnLicenseNumber: '',
    isRnCompact: false,
    rnCompactOriginalState: '',
    aprnStatus: 'not_started',
    aprnLicenseNumber: '',
    applicationStatus: 'not_started',
    independentPractice: false,
    supervisionRequired: false,
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    supervisorDocumentIds: [],
    deaRequired: true,
    deaStatus: 'not_applied',
    deaNumber: '',
    stateControlledSubstanceRequired: false,
    stateControlledSubstanceStatus: 'not_required',
    stateControlledSubstanceNumber: '',
    backgroundCheckRequired: false,
    backgroundCheckCompleted: false,
    fingerprintRequired: false,
    fingerprintCompleted: false,
    prescriberLicenseRequired: false,
    ceuRequirementsNotes: '',
    malpracticeRequired: true,
    malpracticeDocumentIds: [],
    readyStatus: 'not_ready',
    readinessScore: 0,
    nextAction: 'Begin application',
    notes: '',
    tags: [],
    archived: false,
    portalLinks: {
      boardWebsite: '',
      renewalPage: '',
      ceRequirementPage: '',
    },
    ...initialData,
  });

  const [saving, setSaving] = useState(false);
  
  // Selector State
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState<{ field: keyof StateLicense; category?: DocumentCategory; title: string }>({
    field: 'rnDocumentId',
    title: 'Select Document'
  });

  const openSelector = (field: keyof StateLicense, category?: DocumentCategory, title: string = 'Select Document') => {
    setSelectorConfig({ field, category, title });
    setIsSelectorOpen(true);
  };

  const handleDocumentSelect = (docId: string) => {
    update(selectorConfig.field, docId);
    setIsSelectorOpen(false);
  };

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (code: string) => {
    const state = US_STATES.find((s) => s.code === code);
    update('stateCode', code);
    update('stateName', state?.name || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* State & Status */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">State & Application Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>State</label>
            <select
              value={form.stateCode}
              onChange={(e) => handleStateChange(e.target.value)}
              className={selectClass}
              disabled={isEditing}
              required
            >
              <option value="">Select a state...</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Application Status</label>
            <select
              value={form.applicationStatus}
              onChange={(e) => update('applicationStatus', e.target.value)}
              className={selectClass}
            >
              <option value="not_started">Not Started</option>
              <option value="researching">Researching</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="awaiting_documents">Awaiting Documents</option>
              <option value="awaiting_board">Awaiting Board</option>
              <option value="active">Active</option>
              <option value="avoid_licensing">Avoid Licensing</option>
            </select>
          </div>
        </div>

        {/* Board Links */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Board Portals & Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Board of Nursing Website</label>
              <input 
                type="url" 
                value={form.portalLinks?.boardWebsite || ''} 
                onChange={(e) => update('portalLinks', { ...form.portalLinks, boardWebsite: e.target.value })} 
                className={inputClass} 
                placeholder="https://..." 
              />
            </div>
            <div>
              <label className={labelClass}>License Portal / Management</label>
              <input 
                type="url" 
                value={form.portalLinks?.renewalPage || ''} 
                onChange={(e) => update('portalLinks', { ...form.portalLinks, renewalPage: e.target.value })} 
                className={inputClass} 
                placeholder="https://..." 
              />
            </div>
          </div>
        </div>
      </div>

      {/* RN & APRN Credentials */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2">RN License</h3>
            
            <div className="flex items-center gap-3 py-1">
              <input type="checkbox" checked={form.isRnCompact} onChange={(e) => update('isRnCompact', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
              <label className="text-sm font-bold text-zinc-300">This is a Compact State</label>
            </div>

            {form.isRnCompact ? (
              <div>
                <label className={labelClass}>Original Compact State</label>
                <select
                  value={form.rnCompactOriginalState}
                  onChange={(e) => update('rnCompactOriginalState', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select original state...</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-2 font-medium">State-specific RN license is not needed.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.rnStatus} onChange={(e) => update('rnStatus', e.target.value)} className={selectClass}>
                    <option value="not_started">Not Started</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>License Number</label>
                  <input type="text" value={form.rnLicenseNumber} onChange={(e) => update('rnLicenseNumber', e.target.value)} className={inputClass} placeholder="RN123456" />
                </div>
                <div>
                  <label className={labelClass}>Expiration Date</label>
                  <input type="date" value={formatDateForInput(form.rnExpirationDate)} onChange={(e) => update('rnExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
                </div>
              </>
            )}
          </div>

          {/* APRN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2">APRN License</h3>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.aprnStatus} onChange={(e) => update('aprnStatus', e.target.value)} className={selectClass}>
                <option value="not_started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>License Number</label>
              <input type="text" value={form.aprnLicenseNumber} onChange={(e) => update('aprnLicenseNumber', e.target.value)} className={inputClass} placeholder="APRN789012" />
            </div>
            <div>
              <label className={labelClass}>Expiration Date</label>
              <input type="date" value={formatDateForInput(form.aprnExpirationDate)} onChange={(e) => update('aprnExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
               <label className={labelClass}>License Copy (APRN)</label>
               {form.aprnDocumentId ? (
                 <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-zinc-100 font-medium truncate flex-1">Linked Document: {form.aprnDocumentId}</span>
                    <button type="button" onClick={() => openSelector('aprnDocumentId', 'aprn_license', 'Change APRN License')} className="text-[10px] font-bold text-indigo-400 uppercase">Change</button>
                 </div>
               ) : (
                 <button 
                   type="button" 
                   onClick={() => openSelector('aprnDocumentId', 'aprn_license', 'Select APRN License')}
                   className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-white/10 rounded-xl text-zinc-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm font-medium"
                 >
                   <LinkIcon className="w-4 h-4" /> Link from Vault
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* DEA & Supervision */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">DEA & Practice Authority</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>DEA Status</label>
              <select value={form.deaStatus} onChange={(e) => update('deaStatus', e.target.value)} className={selectClass}>
                <option value="not_required">Not Required</option>
                <option value="not_applied">Not Applied</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>DEA Number</label>
              <input type="text" value={form.deaNumber} onChange={(e) => update('deaNumber', e.target.value)} className={inputClass} placeholder="DEA Number" />
            </div>
            <div>
              <label className={labelClass}>DEA Expiration Date</label>
              <input type="date" value={formatDateForInput(form.deaExpirationDate)} onChange={(e) => update('deaExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.supervisionRequired} onChange={(e) => update('supervisionRequired', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
              <label className="text-sm font-bold text-zinc-300">Supervision Required</label>
            </div>
            {form.supervisionRequired && (
              <>
                <div>
                  <label className={labelClass}>Supervisor Name</label>
                  <input type="text" value={form.supervisorName} onChange={(e) => update('supervisorName', e.target.value)} className={inputClass} placeholder="Dr. Jane Smith" />
                </div>
                <div>
                  <label className={labelClass}>Supervisor Email</label>
                  <input type="email" value={form.supervisorEmail} onChange={(e) => update('supervisorEmail', e.target.value)} className={inputClass} placeholder="supervisor@clinic.com" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* General Requirements */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">General Requirements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { field: 'backgroundCheckRequired', label: 'Background Check' },
            { field: 'fingerprintRequired', label: 'Fingerprints' },
            { field: 'malpracticeRequired', label: 'Malpractice Insurance' },
            { field: 'stateControlledSubstanceRequired', label: 'DEA' },
            { field: 'prescriberLicenseRequired', label: 'Prescriber License' },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center gap-3">
              <input type="checkbox" checked={!!form[field as keyof StateLicense]} onChange={(e) => update(field, e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
              <label className="text-sm font-medium text-zinc-300">{label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* CEU Addendum */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">CEU Addendum</h2>
        <textarea
          value={form.ceuRequirementsNotes || ''}
          onChange={(e) => update('ceuRequirementsNotes', e.target.value)}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Enter state-specific CEU notes or manual requirements (e.g., 30 hours per year, 10 pharm hours)..."
        />
      </div>

      {/* Notes */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">Notes</h2>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Any additional notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-400 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
          <X className="w-4 h-4" />
          Cancel
        </button>
        {isEditing && onDelete && (
          <button 
            type="button" 
            onClick={onDelete} 
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-400 rounded-xl border border-rose-500/10 hover:bg-rose-500/5 transition-all"
          >
            Delete License
          </button>
        )}
        <button type="submit" disabled={saving || !form.stateCode} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isEditing ? 'Update License' : 'Add License'}
        </button>
      </div>

      {/* Clear Overrides Utility (Only if they exist) */}
      {isEditing && initialData?.customCeRequirements && (
        <div className="mt-12 p-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-amber-400">Manual Override Detected</h3>
            <p className="text-xs text-zinc-400 mt-1">This license is currently using custom requirements instead of the official Board rules. Would you like to reset it?</p>
          </div>
          <button 
            type="button" 
            onClick={() => {
              if (window.confirm("This will clear all manual requirement overrides for this license and return to the official Board of Nursing rules. Your CEU logs will NOT be affected. Continue?")) {
                update('customCeRequirements', null);
                alert("Overrides cleared! Click 'Update License' to save the change.");
              }
            }}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black transition-all"
          >
            Reset to Official Rules
          </button>
        </div>
      )}

      {/* Selector Modal */}
      <DocumentSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleDocumentSelect}
        filterCategory={selectorConfig.category}
        filterState={form.stateCode}
        title={selectorConfig.title}
      />
    </form>
  );
}
