'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import type { DocumentCategory } from '@/types/schema';
import { useAuth } from '@/context/AuthContext';
import { uploadLicenseDocument } from '@/lib/storage';

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
  { value: 'dea', label: 'DEA Registration' },
  { value: 'state_controlled_substance', label: 'DEA' },
  { value: 'supervisor_agreement', label: 'Supervisor Agreement' },
  { value: 'malpractice', label: 'Malpractice Insurance' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'fingerprint', label: 'Fingerprints' },
  { value: 'ceu_certificate', label: 'CEU Certificate' },
  { value: 'other', label: 'Other' },
];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { file: File; category: DocumentCategory; stateCode: string; docId: string }) => Promise<void>;
  initialState?: string;
  initialCategory?: DocumentCategory;
}

export function DocumentUploadModal({ isOpen, onClose, onUpload, initialState = 'ALL', initialCategory = 'other' }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(initialCategory);
  const [stateCode, setStateCode] = useState(initialState);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !user) return;
    setUploading(true);
    setProgress(0);
    try {
      const docId = await uploadLicenseDocument(
        user.uid, 
        file, 
        { 
          category, 
          stateCode,
          expirationDate: expirationDate ? new Date(expirationDate) : null
        },
        (p) => setProgress(p)
      );
      onUpload({ file, category, stateCode, docId });
      onClose();
      setFile(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Upload Document
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Selection */}
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-white/5">
                <FileText className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-zinc-300">Select document to upload</p>
              <p className="text-xs text-zinc-500 mt-1 font-medium italic">PDF, JPG, PNG up to 10MB</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-2">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-zinc-100 truncate">{file.name}</p>
                <p className="text-xs text-emerald-400/70 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-2 py-1 rounded"
              >
                Change
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Document Category</label>
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
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Applicable State</label>
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
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Expiration Date (Optional)</label>
            <input 
              type="date" 
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
            />
            <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">Leave blank if this document doesn't expire.</p>
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
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Complete Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
