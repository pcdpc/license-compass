'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, FileText, Check, Plus, Loader2, FolderOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserDocuments } from '@/lib/firestore';
import type { LicenseDocument, DocumentCategory } from '@/types/schema';
import { DocumentUploadModal } from './DocumentUploadModal';

interface DocumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (documentId: string, documentName: string) => void;
  filterCategory?: DocumentCategory;
  filterState?: string;
  title?: string;
}

export function DocumentSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  filterCategory, 
  filterState,
  title = 'Select Document'
}: DocumentSelectorModalProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<LicenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const fetchDocs = async () => {
        setLoading(true);
        try {
          const allDocs = await getUserDocuments(user.uid);
          setDocuments(allDocs);
        } catch (error) {
          console.error('Error fetching documents:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDocs();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    const matchesState = !filterState || doc.stateCode === filterState || doc.stateCode === 'ALL';
    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {filterCategory ? `Filtering for ${filterCategory.replace('_', ' ')}` : 'Showing all documents'}
            </p>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload New
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
              <p className="text-sm font-medium">Crunching your vault...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold text-zinc-300">No matching documents</p>
              <p className="text-xs font-medium mt-1">Try a different search or upload a new file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => doc.id && onSelect(doc.id, doc.fileName)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100 truncate max-w-[300px]">{doc.fileName}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">{doc.category.replace('_', ' ')} • {doc.stateCode}</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/5 bg-white/5 text-center">
          <p className="text-[10px] text-zinc-500 font-medium">Select a document to link it to this requirement.</p>
        </div>
      </div>

      <DocumentUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={async (data) => {
          setIsUploadOpen(false);
          // Automatically select the newly uploaded document
          if ((data as any).docId) {
            onSelect((data as any).docId, data.file.name);
          } else if (user) {
            // Fallback: Refresh list
            const allDocs = await getUserDocuments(user.uid);
            setDocuments(allDocs);
          }
        }}
        initialCategory={filterCategory}
        initialState={filterState}
      />
    </div>
  );
}
