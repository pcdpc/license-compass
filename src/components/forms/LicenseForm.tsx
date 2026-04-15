'use client';

import React, { useState } from 'react';
import type { StateLicense, CredentialStatus, DeaStatus, ApplicationStatus } from '@/types/schema';
import { Save, X } from 'lucide-react';

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
  isEditing?: boolean;
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";
const labelClass = "block text-sm font-bold text-zinc-300 mb-1.5";
const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none";

export function LicenseForm({ initialData, onSubmit, onCancel, isEditing = false }: LicenseFormProps) {
  const [form, setForm] = useState<Partial<StateLicense>>({
    stateCode: '',
    stateName: '',
    rnRequired: true,
    aprnRequired: true,
    rnStatus: 'not_started',
    rnLicenseNumber: '',
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
    malpracticeRequired: true,
    malpracticeDocumentIds: [],
    readyStatus: 'blocked',
    readinessScore: 0,
    nextAction: 'Begin application',
    notes: '',
    tags: [],
    archived: false,
    ...initialData,
  });

  const [saving, setSaving] = useState(false);

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
      {/* State Selection */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">State Information</h2>
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
            </select>
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
              <input type="date" value={form.rnExpirationDate ? new Date(form.rnExpirationDate as any).toISOString().split('T')[0] : ''} onChange={(e) => update('rnExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
            </div>
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
              <input type="date" value={form.aprnExpirationDate ? new Date(form.aprnExpirationDate as any).toISOString().split('T')[0] : ''} onChange={(e) => update('aprnExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
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
              <input type="date" value={form.deaExpirationDate ? new Date(form.deaExpirationDate as any).toISOString().split('T')[0] : ''} onChange={(e) => update('deaExpirationDate', e.target.value ? new Date(e.target.value) : null)} className={inputClass} />
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

      {/* Requirements */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-5">Requirements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { field: 'backgroundCheckRequired', label: 'Background Check' },
            { field: 'fingerprintRequired', label: 'Fingerprints' },
            { field: 'malpracticeRequired', label: 'Malpractice Insurance' },
            { field: 'stateControlledSubstanceRequired', label: 'State Controlled Substance' },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center gap-3">
              <input type="checkbox" checked={!!form[field as keyof StateLicense]} onChange={(e) => update(field, e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
              <label className="text-sm font-medium text-zinc-300">{label}</label>
            </div>
          ))}
        </div>
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
        <button type="submit" disabled={saving || !form.stateCode} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isEditing ? 'Update License' : 'Add License'}
        </button>
      </div>
    </form>
  );
}
