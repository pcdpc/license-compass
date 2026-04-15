'use client';

import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  FileText, 
  Upload, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  FileBadge,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function StateDetailPage({ params }: { params: Promise<{ stateCode: string }> }) {
  // Mock detailed data
  const { stateCode } = use(params);
  const stateName = stateCode === 'TX' ? 'Texas' : stateCode === 'AZ' ? 'Arizona' : 'Georgia';

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
              {stateName}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">APRN & RN License Profile</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status="ready" className="text-sm px-3 py-1.5" />
            <div className="text-sm font-medium text-zinc-400">Readiness Score: <span className="text-emerald-400 font-bold">100%</span></div>
          </div>
        </div>
      </div>

      {/* Next Action Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
        <div className="flex items-start relative z-10">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mr-4 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <AlertTriangle className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Next Action</h3>
            <p className="mt-1 text-sm text-zinc-400 font-medium">
              No immediate action required. Your licenses are active and all documents are uploaded.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Core Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Licenses Card */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                <FileBadge className="w-5 h-5 text-indigo-400 mr-2" />
                License Details
              </h2>
              <button className="text-sm text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Edit</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">APRN License</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-emerald-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Active</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Number</dt><dd className="font-medium text-zinc-200">APRN123456</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Expires</dt><dd className="font-medium text-zinc-200">Jan 31, 2026</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">RN License</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-emerald-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Active</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Number</dt><dd className="font-medium text-zinc-200">RN987654</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Expires</dt><dd className="font-medium text-zinc-200">Jan 31, 2026</dd></div>
                </dl>
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
                 <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">Supervision</h3>
                 <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-zinc-500">Supervision Required</dt><dd className="font-medium text-zinc-200">Yes</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Supervisor Name</dt><dd className="font-medium text-zinc-200">Dr. Jane Smith</dd></div>
                </dl>
              </div>
              <div>
                 <h3 className="text-sm font-bold text-zinc-200 border-b border-white/10 pb-2 mb-3">Federal DEA</h3>
                 <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-emerald-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Active</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Expires</dt><dd className="font-medium text-zinc-200">May 15, 2025</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Info */}
        <div className="space-y-6">
          {/* Compliance & CEU summary */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                Compliance
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-zinc-300">Total CEUs (30 req)</span>
                  <span className="text-emerald-400 font-bold">30 / 30</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 border border-white/10">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full w-full shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                </div>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-zinc-300">Pharm CEUs (10 req)</span>
                  <span className="text-emerald-400 font-bold">10 / 10</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 border border-white/10">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full w-full shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                </div>
              </div>
              
              <button className="w-full mt-2 py-2.5 text-sm text-indigo-400 font-bold border border-indigo-500/20 rounded-xl hover:bg-indigo-500/10 hover:shadow-[0_0_10px_rgba(99,102,241,0.15)] transition-all duration-300">
                View CEU Details
              </button>
            </div>
          </div>

          {/* Document Vault preview */}
          <div className="glass-panel rounded-2xl overflow-hidden">
             <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">State Documents</h2>
              <button className="text-indigo-400 hover:text-indigo-300 p-2 rounded-lg hover:bg-white/5 transition-all"><Upload className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-zinc-500 mr-3 group-hover:text-indigo-400 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">APRN_License_Copy.pdf</p>
                      <p className="text-xs text-zinc-500 font-medium">Uploaded Oct 12, 2024</p>
                    </div>
                  </div>
                </li>
                <li className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-zinc-500 mr-3 group-hover:text-indigo-400 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Collaborative_Agreement.pdf</p>
                      <p className="text-xs text-zinc-500 font-medium">Uploaded Nov 5, 2024</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
