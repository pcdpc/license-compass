'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Files, Upload, FileText, Trash2, Filter, Loader2, Eye, Download, Edit2, Calendar, AlertCircle } from 'lucide-react';
import type { DocumentCategory, LicenseDocument } from '@/types/schema';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentEditModal } from '@/components/documents/DocumentEditModal';
import { useAuth } from '@/context/AuthContext';
import { getUserDocuments, deleteDocument, toDate } from '@/lib/firestore';

const categoryLabels: Record<DocumentCategory, string> = {
  rn_license: 'RN License',
  aprn_license: 'APRN License',
  dea: 'DEA',
  state_controlled_substance: 'DEA',
  supervisor_agreement: 'Supervisor Agreement',
  collaborative_agreement: 'Collaborative Agreement',
  malpractice: 'Malpractice Insurance',
  ceu_certificate: 'CEU',
  background_check: 'Background Check',
  fingerprint: 'Fingerprint',
  board_correspondence: 'Board Correspondence',
  application_receipt: 'Application Receipt',
  other: 'Other',
};

interface MockDoc {
  id: string;
  fileName: string;
  category: DocumentCategory;
  stateCode: string;
  uploadedAt: string;
  fileSize: number;
}

const mockDocs: MockDoc[] = [
  { id: '1', fileName: 'APRN_License_GA.pdf', category: 'aprn_license', stateCode: 'GA', uploadedAt: '2024-10-12', fileSize: 245000 },
  { id: '2', fileName: 'RN_License_GA.pdf', category: 'rn_license', stateCode: 'GA', uploadedAt: '2024-10-12', fileSize: 198000 },
  { id: '3', fileName: 'Collaborative_Agreement_GA.pdf', category: 'collaborative_agreement', stateCode: 'GA', uploadedAt: '2024-11-05', fileSize: 312000 },
  { id: '4', fileName: 'DEA_Registration.pdf', category: 'dea', stateCode: 'ALL', uploadedAt: '2024-09-20', fileSize: 156000 },
  { id: '5', fileName: 'Malpractice_Policy_2025.pdf', category: 'malpractice', stateCode: 'ALL', uploadedAt: '2025-01-15', fileSize: 489000 },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const categoryColors: Record<string, string> = {
  rn_license: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  aprn_license: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  dea: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  malpractice: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  collaborative_agreement: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  supervisor_agreement: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  ceu_certificate: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  background_check: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  fingerprint: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  other: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

function DateDisplay({ date, icon: Icon, label, colorClass = "text-zinc-500" }: { date: any, icon?: any, label?: string, colorClass?: string }) {
  const d = toDate(date);
  if (!d) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label && <span>{label}: </span>}
      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  );
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<LicenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LicenseDocument | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDocs = async () => {
      try {
        const data = await getUserDocuments(user.uid);
        setDocs(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [user]);

  const filtered = filterCategory === 'all' ? docs : docs.filter((d) => d.category === filterCategory);

  const handleUploadComplete = async () => {
    if (!user) return;
    try {
      const data = await getUserDocuments(user.uid);
      setDocs(data);
    } catch (error) {
       console.error('Error refreshing documents:', error);
    }
  };

  const handleUpload = async ({ file, category, stateCode, docId }: { file: File; category: DocumentCategory; stateCode: string; docId: string }) => {
    // The modal already handles the firestore create, we just refresh local state
    handleUploadComplete();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(user.uid, id);
        setDocs((prev) => prev.filter((d) => d.id !== id));
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Documents</h1>
        <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); /* handleFiles(e.dataTransfer.files); */ setIsUploadModalOpen(true); }}
        className={`glass-panel rounded-2xl p-8 border-2 border-dashed text-center transition-all cursor-pointer ${
          isDragging ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => setIsUploadModalOpen(true)}
      >
        <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragging ? 'text-indigo-400' : 'text-zinc-500'}`} />
        <p className="text-sm font-bold text-zinc-300">
          {isDragging ? 'Drop files here...' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-zinc-500 mt-1 font-medium">PDF, JPG, PNG up to 10MB</p>
      </div>

      <DocumentUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload} 
      />

      <DocumentEditModal
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        document={editingDoc}
        onUpdate={handleUploadComplete}
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-zinc-500" />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${filterCategory === 'all' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}>
            All
          </button>
          {['aprn_license', 'rn_license', 'dea', 'malpractice', 'ceu_certificate'].map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${filterCategory === cat ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}>
              {cat === 'ceu_certificate' ? 'CEUs' : (cat === 'dea' ? 'DEA' : categoryLabels[cat as DocumentCategory])}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.map((doc) => (
            <div key={doc.id} className="px-6 py-4 hover:bg-white/5 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl border ${categoryColors[doc.category] || categoryColors.other}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">{doc.fileName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-zinc-500 font-medium">{categoryLabels[doc.category]}</span>
                    <span className="text-xs text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 font-medium">{doc.stateCode}</span>
                    <span className="text-xs text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 font-medium">{formatFileSize(doc.fileSize)}</span>
                    <span className="text-xs text-zinc-600">·</span>
                    <DateDisplay date={doc.uploadedAt} />
                    {doc.expirationDate && (
                      <>
                        <span className="text-xs text-zinc-600">·</span>
                        <DateDisplay 
                          date={doc.expirationDate} 
                          icon={Calendar} 
                          label="Expires"
                          colorClass={toDate(doc.expirationDate)! < new Date() ? "text-rose-400" : "text-amber-400/80"} 
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a 
                   href={doc.downloadURL} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-2 rounded-lg text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all"
                   title="View Document"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a 
                   href={doc.downloadURL} 
                   download
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-2 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all"
                   title="Download Document"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setEditingDoc(doc)} 
                  className="p-2 rounded-lg text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit info"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id!)} 
                  className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm font-medium text-zinc-500">No documents found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
