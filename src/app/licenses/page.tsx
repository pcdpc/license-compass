'use client';

import React from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReadyStatus } from '@/types/schema';
import { Plus, ArrowRight } from 'lucide-react';

// Mock list based on the spec "Seed Data" section
const mockLicenses: { id: string, state: string, rnAction: string, aprnAction: string, readyStatus: ReadyStatus, nextAction: string }[] = [
  { id: 'GA', state: 'Georgia', rnAction: 'Active - Expires 1/2026', aprnAction: 'Active - Expires 1/2026', readyStatus: 'ready', nextAction: 'None' },
  { id: 'TX', state: 'Texas', rnAction: 'Active', aprnAction: 'Active', readyStatus: 'almost_ready', nextAction: 'Needs Collaborative Agreement' },
  { id: 'AZ', state: 'Arizona', rnAction: 'Pending', aprnAction: 'Pending', readyStatus: 'blocked', nextAction: 'Awaiting Fingerprints' },
];

export default function LicensesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">My Licenses</h1>
        <Link href="/licenses/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30">
          <Plus className="w-4 h-4" />
          Add State
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  State
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  RN Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  APRN Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Readiness
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Next Action
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mockLicenses.map((license, idx) => (
                <tr key={license.id} className={`hover:bg-white/5 transition-all duration-300 group ${idx !== mockLicenses.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-zinc-100">{license.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-400 font-medium">{license.rnAction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-400 font-medium">{license.aprnAction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={license.readyStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-500 font-medium">{license.nextAction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/licenses/${license.id}`} className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors group/link">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

