'use client';

import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LicenseForm } from '@/components/forms/LicenseForm';
import { 
  FileText, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  FileBadge,
  ArrowLeft,
  Loader2,
  Trash2,
  Edit,
  Upload,
  Globe,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLicense, updateLicense, deleteLicense, getDocumentsByState, toDate } from '@/lib/firestore';
import { calculateReadiness } from '@/lib/readiness';
import type { StateLicense, DocumentCategory, LicenseDocument } from '@/types/schema';
import { DocumentSelectorModal } from '@/components/documents/DocumentSelectorModal';

export default function StateDetailPage({ params }: { params: Promise<{ licenseId: string }> }) {
  const { licenseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [license, setLicense] = useState<StateLicense | null>(null);
  const [associatedDocs, setAssociatedDocs] = useState<LicenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Selector State
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState<{ field: keyof StateLicense; category?: DocumentCategory; title: string }>({
    field: 'rnDocumentId',
    title: 'Select Document'
  });

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [licenseData, docsData] = await Promise.all([
          getLicense(user.uid, licenseId),
          // We'll fetch documents after we have the license to get the stateCode
          null 
        ]);

        if (isMounted) {
          if (!licenseData) {
            router.push('/licenses');
            return;
          }
          setLicense(licenseData);
          
          // Now fetch docs for this state
          const docs = await getDocumentsByState(user.uid, licenseData.stateCode);
          setAssociatedDocs(docs);
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [user, licenseId, router]);

  const handleUpdate = async (updatedData: Partial<StateLicense>) => {
    if (!user || !license) return;
    
    try {
      const fullLicenseData = { ...license, ...updatedData } as StateLicense;
      const readiness = calculateReadiness(fullLicenseData);
      
      const payload = {
        ...updatedData,
        readyStatus: readiness.readyStatus,
        readinessScore: readiness.readinessScore,
        nextAction: readiness.nextAction,
      };

      await updateLicense(user.uid, licenseId, payload);
      setLicense({ ...license, ...payload });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating license:', error);
      alert('Failed to update license.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this license? This cannot be undone.")) {
      try {
        await deleteLicense(user.uid, licenseId);
        router.push('/licenses');
      } catch (error) {
         console.error('Error deleting license:', error);
         alert('Failed to delete license.');
      }
    }
  };

  const openSelector = (field: keyof StateLicense, category?: DocumentCategory, title: string = 'Select Document') => {
    setSelectorConfig({ field, category, title });
    setIsSelectorOpen(true);
  };

  const handleDocumentSelect = async (docId: string) => {
    if (!user || !license) return;
    
    const field = selectorConfig.field;
    await handleUpdate({ [field]: docId });
    setIsSelectorOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
      </div>
    );
  }

  if (!license) return null;

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link href="/licenses" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 font-medium mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Licenses
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow flex items-center">
              <MapPin className="w-8 h-8 text-indigo-400 mr-3 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              {license.stateName}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">APRN & RN License Profile</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={license.readyStatus} className="text-sm px-3 py-1.5" />
              <div className="text-sm font-medium text-zinc-400">Readiness Score: <span className="text-emerald-400 font-bold">{license.readinessScore}%</span></div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 text-zinc-200 font-bold text-sm rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100">Edit License Details</h2>
              <button onClick={handleDelete} className="text-sm text-rose-400 font-bold hover:text-rose-300 flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Delete License
              </button>
           </div>
           <LicenseForm 
             initialData={license} 
             onSubmit={handleUpdate} 
             onCancel={() => setIsEditing(false)} 
             onDelete={handleDelete}
             isEditing={true} 
           />
        </div>
      ) : (
        <>
          {/* Next Action Banner */}
          {license.nextAction && license.nextAction !== 'None' && (
            <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>
              <div className="flex items-start relative z-10">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl mr-4 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Attention Required</h3>
                  <p className="mt-1 text-sm text-zinc-400 font-medium">
                    {license.nextAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Core Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Licenses Card */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                    <FileBadge className="w-5 h-5 text-indigo-400 mr-2" />
                    License Details
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">APRN License</h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-200 capitalize">{license.aprnStatus.replace('_', ' ')}</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Number</dt><dd className="font-medium text-zinc-200">{license.aprnLicenseNumber || 'N/A'}</dd></div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Expires</dt>
                        <dd className="font-medium text-zinc-200">
                          {toDate(license.aprnExpirationDate)?.toLocaleDateString() || 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/5 mt-2">
                        <dt className="text-zinc-500">Document</dt>
                        <dd className="font-medium">
                          {license.aprnDocumentId ? (
                            <div className="flex items-center gap-1.5">
                              <button className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <span className="text-zinc-700">|</span>
                              <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                <Download className="w-3 h-3" /> Save
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => openSelector('aprnDocumentId', 'aprn_license', 'Select APRN License')}
                              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"
                            >
                              <LinkIcon className="w-3 h-3" /> Link Copy
                            </button>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">RN License</h3>
                    {license.isRnCompact ? (
                       <dl className="space-y-3 text-sm">
                         <div className="flex justify-between"><dt className="text-zinc-500">Compact State</dt><dd className="font-medium text-emerald-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Yes</dd></div>
                         <div className="flex justify-between"><dt className="text-zinc-500">Original State</dt><dd className="font-medium text-zinc-200">{license.rnCompactOriginalState}</dd></div>
                       </dl>
                    ) : (
                       <dl className="space-y-3 text-sm">
                         <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-200 capitalize">{license.rnStatus.replace('_', ' ')}</dd></div>
                         <div className="flex justify-between"><dt className="text-zinc-500">Number</dt><dd className="font-medium text-zinc-200">{license.rnLicenseNumber || 'N/A'}</dd></div>
                         <div className="flex justify-between">
                           <dt className="text-zinc-500">Expires</dt>
                           <dd className="font-medium text-zinc-200">
                             {toDate(license.rnExpirationDate)?.toLocaleDateString() || 'N/A'}
                           </dd>
                         </div>
                       </dl>
                    )}
                  </div>
                </div>
              </div>

              {/* Practice Authority & DEA */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                 <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-lg font-bold text-zinc-100">Practice Authority & DEA</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">DEA Registration</h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-200 capitalize">{license.deaStatus.replace('_', ' ')}</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Number</dt><dd className="font-medium text-zinc-200">{license.deaNumber || 'N/A'}</dd></div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Expires</dt>
                        <dd className="font-medium text-zinc-200">
                          {toDate(license.deaExpirationDate)?.toLocaleDateString() || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">Supervision</h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-zinc-500">Required</dt><dd className="font-medium text-zinc-200">{license.supervisionRequired ? 'Yes' : 'No'}</dd></div>
                      {license.supervisionRequired && (
                        <div className="flex justify-between"><dt className="text-zinc-500">Supervisor</dt><dd className="font-medium text-zinc-200">{license.supervisorName || 'N/A'}</dd></div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>

              {/* Portal Links */}
              {(license.portalLinks?.boardWebsite || license.portalLinks?.renewalPage) && (
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                      <Globe className="w-5 h-5 text-indigo-400 mr-2" />
                      Quick Links
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {license.portalLinks?.boardWebsite && (
                      <a href={license.portalLinks.boardWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                         <div>
                            <p className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400">Board of Nursing</p>
                            <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px]">{license.portalLinks.boardWebsite}</p>
                         </div>
                         <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400" />
                      </a>
                    )}
                    {license.portalLinks?.renewalPage && (
                      <a href={license.portalLinks.renewalPage} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                         <div>
                            <p className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400">License Portal</p>
                            <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px]">{license.portalLinks.renewalPage}</p>
                         </div>
                         <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Secondary Info */}
            <div className="space-y-6">
              {/* General Requirements */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-4">General Requirements</h2>
                <ul className="space-y-3 text-sm">
                   {[
                    { label: 'Background Check', field: 'backgroundCheckDocumentId' as keyof StateLicense, category: 'background_check' as DocumentCategory, required: !!license.backgroundCheckRequired, met: !!license.backgroundCheckCompleted || !!license.backgroundCheckDocumentId },
                    { label: 'Fingerprints', field: 'fingerprintDocumentId' as keyof StateLicense, category: 'fingerprint' as DocumentCategory, required: !!license.fingerprintRequired, met: !!license.fingerprintCompleted || !!license.fingerprintDocumentId },
                    { label: 'Malpractice Insurance', field: 'malpracticeDocumentIds' as keyof StateLicense, category: 'malpractice' as DocumentCategory, required: !!license.malpracticeRequired, met: license.malpracticeDocumentIds && license.malpracticeDocumentIds.length > 0 },
                    { label: 'DEA', field: 'stateControlledSubstanceDocumentId' as keyof StateLicense, category: 'state_controlled_substance' as DocumentCategory, required: !!license.stateControlledSubstanceRequired, met: license.stateControlledSubstanceStatus === 'active' || !!license.stateControlledSubstanceDocumentId },
                    { label: 'Prescriber License', field: 'id' as keyof StateLicense, category: 'other' as DocumentCategory, required: !!license.prescriberLicenseRequired, met: true } // Prescriber license is a simple checkbox for now
                  ].map((req, i) => (
                    req.required && (
                      <li key={i} className="flex items-center justify-between group/req">
                        <span className="text-zinc-400 font-medium">{req.label}</span>
                        <div className="flex items-center gap-2">
                           {req.met ? (
                             <CheckCircle className="w-4 h-4 text-emerald-400" />
                           ) : (
                             <button 
                               onClick={() => openSelector(req.field, req.category, `Link ${req.label}`)}
                               className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 py-1 bg-indigo-500/10 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                             >
                               Link doc
                             </button>
                           )}
                        </div>
                      </li>
                    )
                  ))}
                  {(!license.backgroundCheckRequired && !license.fingerprintRequired && !license.malpracticeRequired && !license.stateControlledSubstanceRequired && !license.prescriberLicenseRequired) && (
                    <li className="text-zinc-500 text-xs text-center py-2">No additional requirements logged.</li>
                  )}
                </ul>
              </div>

              {/* CEU Requirements */}
              {license.ceuRequirementsNotes && (
                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-4">CEU Requirements</h2>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                      {license.ceuRequirementsNotes}
                    </p>
                  </div>
                </div>
              )}

                {/* Associated Documents */}
                <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                  <h2 className="text-sm font-bold text-zinc-200">State Documents</h2>
                  <Link href="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Manage All</Link>
                </div>
                
                {associatedDocs.length > 0 ? (
                  <div className="space-y-3">
                    {associatedDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-indigo-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-zinc-200 truncate">{doc.fileName}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">{doc.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={doc.downloadURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a 
                            href={doc.downloadURL} 
                            download
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-3">
                      <FileText className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">No documents yet for<br/>{license.stateName}</p>
                    <Link href="/documents" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Add Document
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Selector Modal */}
      <DocumentSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleDocumentSelect}
        filterCategory={selectorConfig.category}
        filterState={license.stateCode}
        title={selectorConfig.title}
      />
    </div>
  );
}
