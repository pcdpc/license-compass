'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StateLicense } from '@/types/schema';
import { Plus, ArrowRight, Loader2, Map } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserLicenses } from '@/lib/firestore';

export default function PipelinePage() {
  const { user } = useAuth();
  const [pipelineLicenses, setPipelineLicenses] = useState<StateLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const fetchLicenses = async () => {
      try {
        const data = await getUserLicenses(user.uid);
        if (isMounted) {
          // Filter to only include 'not_started' or 'researching'
          setPipelineLicenses(
            data.filter(l => l.applicationStatus === 'not_started' || l.applicationStatus === 'researching')
          );
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching licenses:', error);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchLicenses();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Pipeline States</h1>
        <Link href="/licenses/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30">
          <Plus className="w-4 h-4" />
          Add State to Pipeline
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="font-medium">Loading your pipeline...</p>
          </div>
        ) : pipelineLicenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Map className="w-10 h-10 text-indigo-400 opacity-80" />
            </div>
            <p className="text-lg font-bold text-zinc-300 mb-2">Your pipeline is empty</p>
            <p className="text-sm">You haven't added any states for future consideration.</p>
            <Link href="/licenses/add" className="mt-6 text-indigo-400 hover:text-indigo-300 font-bold text-sm">
              + Add a state to pipeline
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    State
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Target Application
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Readiness
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pipelineLicenses.map((license, idx) => (
                  <tr key={license.id} className={`hover:bg-white/5 transition-all duration-300 group ${idx !== pipelineLicenses.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-zinc-100">{license.stateName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* For pipeline, maybe we just show "Not Started" or similar, or Notes */}
                      <div className="text-sm text-zinc-400 font-medium">Unknown Timeline</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-400 font-medium capitalize">{license.applicationStatus.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <StatusBadge status={license.readyStatus || 'not_ready'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/licenses/${license.id}`} className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors group/link px-4 py-2 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20">
                        Begin Application
                        <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
