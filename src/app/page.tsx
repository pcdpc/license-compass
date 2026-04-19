'use client';
/** Re-trigger deployment rollout - 2026-04-19 **/

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Map, AlertCircle, Clock, CheckCircle, Loader2, Briefcase, Bookmark, Send, Building } from 'lucide-react';
import { getUserLicenses, getUserDocuments, getUserCareers, toDate } from '@/lib/firestore';
import { LicenseDocument, StateLicense, CareerOpportunity } from '@/types/schema';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [licenses, setLicenses] = useState<StateLicense[]>([]);
  const [documents, setDocuments] = useState<LicenseDocument[]>([]);
  const [careers, setCareers] = useState<CareerOpportunity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [licenseData, docData, careerData] = await Promise.all([
          getUserLicenses(user.uid),
          getUserDocuments(user.uid),
          getUserCareers(user.uid)
        ]);
        if (isMounted) {
          setLicenses(licenseData);
          setDocuments(docData);
          setCareers(careerData);
          setDataLoading(false);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) setDataLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [user]);

  if (loading || !user) {
    return null;
  }

  // Calculate real metrics based on fetched licenses
  const activeStates = licenses.filter(l => l.applicationStatus === 'active');
  const readyStates = licenses.filter(l => l.readyStatus === 'ready');
  const pipelineStatesList = licenses.filter(l => l.applicationStatus === 'not_started' || l.applicationStatus === 'researching');
  const pendingStates = licenses.filter(l => ['in_progress', 'submitted', 'awaiting_documents', 'awaiting_board'].includes(l.applicationStatus));

  const stats = {
    totalStates: licenses.length,
    activeStates: activeStates.length,
    pendingStates: pendingStates.length,
    readyStates: readyStates.length
  };

  // Career Metrics
  const careerStats = {
    saved: careers.filter(c => c.type === 'saved').length,
    applied: careers.filter(c => c.type === 'applied').length,
    active: careers.filter(c => c.type === 'active').length,
    followUps: careers.filter(c => {
      if (!c.followUpDate) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const fuDate = toDate(c.followUpDate);
      return fuDate ? fuDate <= today && c.status !== 'accepted' && c.status !== 'rejected' : false;
    }).length
  };

  // Compile Expiring Soon items (within 90 days)
  const expiringSoon: { state: string, type: string, date: string, id: string }[] = [];
  const addIfExpiring = (license: StateLicense, type: string, date: any) => {
    if (!date) return;
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    const dUntil = Math.ceil((jsDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (dUntil > 0 && dUntil <= 90) {
      expiringSoon.push({ state: license.stateName, type, date: `${dUntil} days`, id: license.id || '' });
    } else if (dUntil <= 0) {
      expiringSoon.push({ state: license.stateName, type, date: 'Expired', id: license.id || '' });
    }
  };

  licenses.forEach(l => {
    addIfExpiring(l, 'RN License', l.rnExpirationDate);
    addIfExpiring(l, 'APRN License', l.aprnExpirationDate);
    addIfExpiring(l, 'DEA Registration', l.deaExpirationDate);
    addIfExpiring(l, 'State Controlled Sub.', l.stateControlledSubstanceExpirationDate);
  });

  // Also check all standalone documents for expiration
  documents.forEach(d => {
    if (d.expirationDate) {
      const jsDate = d.expirationDate.toDate ? d.expirationDate.toDate() : new Date(d.expirationDate);
      const dUntil = Math.ceil((jsDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      const categoryLabel = d.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (dUntil > 0 && dUntil <= 90) {
        expiringSoon.push({ 
          state: (d.stateCode && d.stateCode !== 'ALL') ? d.stateCode : 'General', 
          type: `${categoryLabel}: ${d.fileName}`, 
          date: `${dUntil} days`, 
          id: d.id || '' 
        });
      } else if (dUntil <= 0) {
        expiringSoon.push({ 
          state: (d.stateCode && d.stateCode !== 'ALL') ? d.stateCode : 'General', 
          type: `${categoryLabel}: ${d.fileName}`, 
          date: 'Expired', 
          id: d.id || '' 
        });
      }
    }
  });

  // Sort expiring soon by days
  expiringSoon.sort((a, b) => {
    if (a.date === 'Expired') return -1;
    if (b.date === 'Expired') return 1;
    return parseInt(a.date) - parseInt(b.date);
  });

  // Compile Needs Action (blocked or with immediate next steps)
  const needsAction = licenses
    .filter(l => l.readyStatus === 'not_ready' || l.nextAction || ['in_progress', 'awaiting_documents'].includes(l.applicationStatus))
    .slice(0, 5)
    .map(l => ({
      state: l.stateName,
      action: l.nextAction || 'Update application status',
      id: l.id
    }));

  const statCards = [
    { name: 'Total States', value: stats.totalStates, icon: Map, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100/60', bg: 'bg-white/40' },
    { name: 'Active States', value: stats.activeStates, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100/60', bg: 'bg-white/40' },
    { name: 'Pending Apps', value: stats.pendingStates, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-100/60', bg: 'bg-white/40' },
    { name: 'Ready to Practice', value: stats.readyStates, icon: AlertCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-100/60', bg: 'bg-white/40' },
  ];

  const careerStatCards = [
    { name: 'Saved Jobs', value: careerStats.saved, icon: Bookmark, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10', color: 'indigo' },
    { name: 'Applications', value: careerStats.applied, icon: Send, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', color: 'emerald' },
    { name: 'Active Jobs', value: careerStats.active, icon: Building, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10', color: 'amber' },
    { name: 'Follow-ups Due', value: careerStats.followUps, icon: Clock, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', color: 'rose' },
  ];

  return (
    <div className="space-y-8 relative z-10 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Dashboard Overview</h1>
      </div>

      {dataLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.name} className={`glass-card rounded-2xl relative overflow-hidden group`}>
                <div className={`absolute -right-6 -top-6 w-32 h-32 ${stat.iconBg} rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-all duration-700 ease-out z-0`}></div>
                <div className="p-6 flex flex-col justify-between h-full relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-white/5 border border-white/10`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor} drop-shadow-md`} aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-zinc-400 mb-1">{stat.name}</dt>
                    <dd className="text-4xl font-extrabold text-zinc-100 tracking-tight drop-shadow-sm">{stat.value}</dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Career Pipeline
              </h2>
              <Link href="/career-hub" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Manage Hub</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {careerStatCards.map((stat) => (
                <div key={stat.name} className="glass-panel rounded-2xl p-6 border border-white/5 group relative overflow-hidden">
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.iconBg} rounded-full blur-2xl opacity-40 group-hover:scale-125 transition-transform duration-500`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      {stat.name === 'Follow-ups Due' && stat.value > 0 && (
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 truncate">{stat.name}</p>
                    <p className="text-2xl sm:text-3xl font-black text-zinc-100">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Expiring Soon */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col group relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-rose-500/5 to-transparent blur-xl pointer-events-none z-0"></div>
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 mr-3 shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  Expiring Soon
                </h2>
              </div>
              <div className="p-2 flex-1 relative z-10">
                <ul className="space-y-1">
                  {expiringSoon.map((item, idx) => (
                    <li key={idx} className="p-4 rounded-xl hover:bg-white/5 flex justify-between items-center transition-all duration-300 hover:shadow-sm hover:-translate-y-[2px] border border-transparent hover:border-white/10 cursor-default">
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{item.state}</p>
                        <p className="text-sm text-zinc-400 font-medium">{item.type}</p>
                      </div>
                      <span className="inline-flex items-center rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]">
                        {item.date === 'Expired' ? 'Expired' : `in ${item.date}`}
                      </span>
                    </li>
                  ))}
                  {expiringSoon.length === 0 && (
                    <li className="p-6 text-center text-sm font-medium text-zinc-500">No items expiring in the next 90 days.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Needs Action */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col group relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-500/5 to-transparent blur-xl pointer-events-none z-0"></div>
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mr-3 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  Needs Action
                </h2>
              </div>
              <div className="p-2 flex-1 relative z-10">
                <ul className="space-y-1">
                  {needsAction.map((item, idx) => (
                    <li key={idx} className="p-4 rounded-xl hover:bg-white/5 flex justify-between items-center transition-all duration-300 hover:shadow-sm hover:-translate-y-[2px] border border-transparent hover:border-white/10 group/item cursor-default">
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{item.state}</p>
                        <p className="text-sm text-zinc-400 font-medium">{item.action}</p>
                      </div>
                      <Link href={`/licenses/${item.id}`} className="px-4 py-2 text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-all duration-300">
                        Fix
                      </Link>
                    </li>
                  ))}
                  {needsAction.length === 0 && (
                    <li className="p-6 text-center text-sm font-medium text-zinc-500">All caught up!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Ready States */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                <h2 className="text-lg font-bold text-zinc-100 mb-5 flex items-center relative z-10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mr-3 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                  Ready States
                </h2>
                <div className="flex flex-wrap gap-3 relative z-10">
                  {readyStates.length > 0 ? readyStates.map(l => (
                    <Link href={`/licenses/${l.id}`} key={l.id} className="flex items-center px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-sm hover:-translate-y-[2px] hover:bg-white/10 transition-all cursor-pointer">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2.5 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
                      <span className="text-sm font-extrabold text-zinc-100">{l.stateName}</span>
                    </Link>
                  )) : (
                    <p className="text-sm font-medium text-zinc-500">No states ready yet.</p>
                  )}
                </div>
            </div>

            {/* Pipeline States */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-5 relative z-10">
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mr-3 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Map className="h-5 w-5" />
                    </span>
                    Pipeline States
                  </h2>
                  <Link href="/pipeline" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
                </div>
                
                <div className="flex flex-wrap gap-3 relative z-10">
                  {pipelineStatesList.length > 0 ? pipelineStatesList.map(l => (
                    <Link href={`/licenses/${l.id}`} key={l.id} className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm text-sm font-bold text-zinc-200 hover:-translate-y-[2px] hover:bg-white/10 transition-all cursor-pointer">
                      {l.stateName}
                    </Link>
                  )) : (
                    <p className="text-sm font-medium text-zinc-500">No states in the pipeline yet.</p>
                  )}
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
