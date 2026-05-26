'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Loader2, Calendar, MapPin, Tag } from 'lucide-react';
import type { DocumentCategory, LicenseDocument } from '@/types/schema';
import { useAuth } from '@/context/AuthContext';
import { updateDocument, toDate } from '@/lib/firestore';

const US_STATES = [
  { code: 'ALL', name: 'All States / General' },
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

const categories: { value: DocumentCategory; label: string }[] = [
  { value: 'rn_license', label: 'RN License' },
  { value: 'aprn_license', label: 'APRN License' },
  { value: 'dea', label: 'DEA' },
  { value: 'supervisor_agreement', label: 'Supervisor Agreement' },
  { value: 'malpractice', label: 'Malpractice Insurance' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'fingerprint', label: 'Fingerprints' },
  { value: 'ceu_certificate', label: 'CEU Certificate' },
  { value: 'other', label: 'Other' },
];

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LicenseDocument | null;
  onUpdate: () => void;
}

export function DocumentEditModal({ isOpen, onClose, document: docData, onUpdate }: DocumentEditModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [stateCode, setStateCode] = useState('ALL');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (docData) {
      setFileName(docData.fileName);
      setCategory(docData.category);
      setStateCode(docData.stateCode || 'ALL');
      setNotes(docData.notes || '');
      
      const expDate = toDate(docData.expirationDate);
      if (expDate) {
        setExpirationDate(expDate.toISOString().split('T')[0]);
      } else {
        setExpirationDate('');
      }
    }
  }, [docData]);

  if (!isOpen || !docData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !docData.id) return;

    setLoading(true);
    try {
      await updateDocument(user.uid, docData.id, {
        fileName,
        category,
        stateCode,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update document metadata.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Edit Document Info
            </h2>
            <button type="button" onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* File Info Read-only */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-zinc-400 border border-white/5">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                <input 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-transparent border-none p-0 text-sm font-bold text-zinc-100 focus:ring-0 w-full"
                  placeholder="Document Name"
                />
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Original filename shown in vault</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> State Association
                </label>
                 <select 
                  value={stateCode} 
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> Expiration Date
              </label>
              <input 
                type="date" 
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">Clear date if this document does not expire.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider text-glow-indigo">Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any helpful notes here..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
