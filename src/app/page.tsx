'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Map, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // or a nice skeleton
  }

  // Placeholder mock data based on prompt requirements
  const stats = userProfile?.stats || {
    totalStates: 3,
    activeStates: 2,
    pendingStates: 1,
    readyStates: 1
  };

  const expiringSoon = [
    { state: 'Georgia', type: 'APRN License', date: '35 days' },
    { state: 'Texas', type: 'DEA Registration', date: '42 days' }
  ];

  const needsAction = [
    { state: 'Texas', action: 'Upload Collaborative Agreement' },
    { state: 'Arizona', action: 'Complete 3 Pharm CEUs' }
  ];

  const statCards = [
    { name: 'Total States', value: stats.totalStates, icon: Map, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100/60', bg: 'bg-white/40' },
    { name: 'Active States', value: stats.activeStates, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100/60', bg: 'bg-white/40' },
    { name: 'Pending Apps', value: stats.pendingStates, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-100/60', bg: 'bg-white/40' },
    { name: 'Ready to Practice', value: stats.readyStates, icon: AlertCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-100/60', bg: 'bg-white/40' },
  ];

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className={`glass-card rounded-2xl relative overflow-hidden group`}>
            {/* Deep glow effect */}
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
                    in {item.date}
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
                  <button className="px-4 py-2 text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-all duration-300">
                    Fix
                  </button>
                </li>
              ))}
              {needsAction.length === 0 && (
                <li className="p-6 text-center text-sm font-medium text-zinc-500">All caught up!</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Ready and Pipeline Stats preview */}
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
                <div className="flex items-center px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-sm hover:-translate-y-[2px] hover:bg-white/10 transition-all cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2.5 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
                  <span className="text-sm font-extrabold text-zinc-100">Georgia</span>
                </div>
            </div>
         </div>

         {/* Pipeline States */}
         <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
             <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
             <h2 className="text-lg font-bold text-zinc-100 mb-5 flex items-center relative z-10">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mr-3 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Map className="h-5 w-5" />
              </span>
              Pipeline States
            </h2>
             <div className="flex flex-wrap gap-3 relative z-10">
                <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm text-sm font-bold text-zinc-200 hover:-translate-y-[2px] hover:bg-white/10 transition-all cursor-pointer">
                  North Carolina
                </div>
                <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm text-sm font-bold text-zinc-200 hover:-translate-y-[2px] hover:bg-white/10 transition-all cursor-pointer">
                  Colorado
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
