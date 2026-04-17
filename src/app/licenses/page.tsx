'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StateLicense } from '@/types/schema';
import { Plus, ArrowRight, Loader2, Map, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserLicenses, deleteLicense } from '@/lib/firestore';

export default function LicensesPage() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<StateLicense[]>([]);
  const [loading, setLoading] = useState(true);

  type SortKey = 'stateName' | 'rnStatus' | 'aprnStatus' | 'readyStatus';
  type SortDirection = 'asc' | 'desc';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const fetchLicenses = async () => {
      try {
        const data = await getUserLicenses(user.uid);
        if (isMounted) {
          setLicenses(data);
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

  const getStatusDisplay = (status: string, expiration?: any, isCompact?: boolean) => {
    if (isCompact) {
      return 'Compact';
    }
    if (status === 'active') {
      if (expiration) {
        const date = expiration.toDate ? expiration.toDate() : new Date(expiration);
        return `Active - Exp ${date.toLocaleDateString(undefined, {month: 'numeric', year: 'numeric'})}`;
      }
      return 'Active';
    }
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev && prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedLicenses = React.useMemo(() => {
    const sortableLicenses = [...licenses];
    if (sortConfig !== null) {
      sortableLicenses.sort((a, b) => {
        let aVal = String(a[sortConfig.key] || '').toLowerCase();
        let bVal = String(b[sortConfig.key] || '').toLowerCase();

        if (sortConfig.key === 'rnStatus') {
          aVal = getStatusDisplay(a.rnStatus, a.rnExpirationDate, a.isRnCompact).toLowerCase();
          bVal = getStatusDisplay(b.rnStatus, b.rnExpirationDate, b.isRnCompact).toLowerCase();
        } else if (sortConfig.key === 'aprnStatus') {
          aVal = getStatusDisplay(a.aprnStatus, a.aprnExpirationDate).toLowerCase();
          bVal = getStatusDisplay(b.aprnStatus, b.aprnExpirationDate).toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableLicenses;
  }, [licenses, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig?.key !== columnKey) return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30 inline-block ml-1 transition-opacity" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-3 h-3 inline-block ml-1 text-indigo-400" /> : 
      <ChevronDown className="w-3 h-3 inline-block ml-1 text-indigo-400" />;
  };

  const handleDelete = async (licenseId: string, stateName: string) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete the license for ${stateName}? This cannot be undone.`)) {
      try {
        await deleteLicense(user.uid, licenseId);
        setLicenses(prev => prev.filter(l => l.id !== licenseId));
      } catch (error) {
        console.error('Error deleting license:', error);
        alert('Failed to delete license.');
      }
    }
  };

  const SortableHeader = ({ label, columnKey }: { label: string, columnKey: SortKey }) => (
    <th 
      scope="col" 
      className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer group select-none hover:text-zinc-300 transition-colors"
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">My Licenses</h1>
        <Link href="/licenses/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] transition-all duration-300 border border-indigo-400/30">
          <Plus className="w-4 h-4" />
          Add State
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="font-medium">Loading your licenses...</p>
          </div>
        ) : licenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Map className="w-10 h-10 text-indigo-400 opacity-80" />
            </div>
            <p className="text-lg font-bold text-zinc-300 mb-2">No licenses found</p>
            <p className="text-sm">You haven't tracked any state licenses yet.</p>
            <Link href="/licenses/add" className="mt-6 text-indigo-400 hover:text-indigo-300 font-bold text-sm">
              + Add your first state
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <SortableHeader label="State" columnKey="stateName" />
                    <SortableHeader label="RN Status" columnKey="rnStatus" />
                    <SortableHeader label="APRN Status" columnKey="aprnStatus" />
                    <SortableHeader label="Readiness" columnKey="readyStatus" />
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Next Action
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLicenses.map((license, idx) => (
                    <tr key={license.id} className={`hover:bg-white/5 transition-all duration-300 group ${idx !== sortedLicenses.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-zinc-100">{license.stateName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-400 font-medium">{getStatusDisplay(license.rnStatus, license.rnExpirationDate, license.isRnCompact)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-400 font-medium">{getStatusDisplay(license.aprnStatus, license.aprnExpirationDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={license.readyStatus || 'not_ready'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-500 font-medium">{license.nextAction || 'Review Application'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-4">
                          <button 
                            onClick={() => license.id && handleDelete(license.id, license.stateName)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete State"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link href={`/licenses/${license.id || ''}`} className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors group/link">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {sortedLicenses.map((license) => (
                <div key={license.id} className="p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">{license.stateName}</h3>
                      <div className="mt-1 flex items-center gap-2">
                         <StatusBadge status={license.readyStatus || 'not_ready'} className="text-[10px] px-2 py-0.5" />
                      </div>
                    </div>
                    <button 
                      onClick={() => license.id && handleDelete(license.id, license.stateName)}
                      className="p-2 text-zinc-600 hover:text-rose-400 bg-white/5 rounded-lg border border-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">RN Status</p>
                      <p className="text-sm text-zinc-300 font-medium">{getStatusDisplay(license.rnStatus, license.rnExpirationDate, license.isRnCompact)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">APRN Status</p>
                      <p className="text-sm text-zinc-300 font-medium">{getStatusDisplay(license.aprnStatus, license.aprnExpirationDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-[11px] text-zinc-500 font-medium italic">
                      {license.nextAction || 'Review Application'}
                    </div>
                    <Link href={`/licenses/${license.id || ''}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl font-bold text-sm transition-all">
                      Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

