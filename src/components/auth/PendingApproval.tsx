'use client';

import React from 'react';
import { Clock, LogOut, Compass, ShieldAlert, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const PendingApproval = () => {
  const { userProfile, signOut } = useAuth();

  const isDenied = userProfile?.status === 'denied';
  const isSuspended = userProfile?.status === 'suspended';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        
        <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 shadow-inner">
          {isDenied ? (
            <XCircle className="w-12 h-12 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          ) : isSuspended ? (
            <ShieldAlert className="w-12 h-12 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          ) : (
            <Clock className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight text-glow mb-4">
          {isDenied ? 'Access Denied' : isSuspended ? 'Account Suspended' : 'Approval Pending'}
        </h1>
        
        <p className="text-zinc-400 font-medium leading-relaxed mb-8">
          {isDenied 
            ? 'Your application for access has been declined. Please contact support if you believe this is an error.' 
            : isSuspended 
            ? 'Your account has been temporarily suspended by an administrator.' 
            : "Thanks for joining License Compass! Your account is currently under review. You'll have full access once an administrator approves your profile."}
        </p>

        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 break-all">
             User: {userProfile?.email}
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-zinc-100 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-300 group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="mt-12 flex items-center opacity-40">
        <Compass className="w-5 h-5 text-indigo-400 mr-2" />
        <span className="text-sm font-bold tracking-tighter text-zinc-300">LICENSE COMPASS</span>
      </div>
    </div>
  );
};
