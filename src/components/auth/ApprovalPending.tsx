'use client';

import React from 'react';
import { Compass, Clock, ShieldCheck, Mail, LogOut, ShieldAlert } from 'lucide-react';

export function ApprovalPending({ email, status, onSignOut }: { email: string; status?: string; onSignOut: () => void }) {
  const isSuspended = status === 'suspended';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-2xl w-full glass-panel p-10 md:p-16 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] text-center relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className={`absolute inset-0 ${isSuspended ? 'bg-rose-500/20' : 'bg-indigo-500/20'} blur-2xl rounded-full`}></div>
            <div className={`relative p-5 bg-gradient-to-br ${isSuspended ? 'from-rose-500 to-pink-600 border-rose-400/50' : 'from-indigo-500 to-blue-600 border-indigo-400/50'} rounded-[32px] border shadow-xl`}>
              {isSuspended ? <ShieldAlert className="w-16 h-16 text-white" /> : <Compass className="w-16 h-16 text-white animate-[spin_10s_linear_infinite]" />}
            </div>
            <div className={`absolute -bottom-2 -right-2 p-2.5 bg-zinc-900 border border-white/10 rounded-2xl shadow-lg`}>
              {isSuspended ? <ShieldAlert className="w-6 h-6 text-rose-400" /> : <Clock className="w-6 h-6 text-indigo-400" />}
            </div>
          </div>
        </div>

        <h1 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${isSuspended ? 'from-rose-100 via-rose-200 to-rose-400' : 'from-zinc-100 via-indigo-200 to-zinc-400'} tracking-tight text-glow mb-4`}>
          {isSuspended ? 'Account Suspended' : 'Account Under Review'}
        </h1>
        
        <p className="text-xl text-zinc-300 font-medium mb-8 leading-relaxed max-w-lg mx-auto">
          {isSuspended ? (
            <>Your account has been suspended, please email <span className="text-rose-400 font-bold">provider@primary.clinic</span></>
          ) : (
            <>Thanks for joining <span className="text-white font-bold">License Compass</span>. Your account is currently on our waitlist.</>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className={`p-2 rounded-xl ${isSuspended ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
              {isSuspended ? <ShieldAlert className="w-5 h-5 text-rose-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">{isSuspended ? 'Policy Violation' : 'Vetting Process'}</h3>
              <p className="text-[12px] text-zinc-500 mt-1">
                {isSuspended ? 'Your account has been flagged for a policy review.' : 'We review every practitioner to ensure data integrity and security.'}
              </p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className={`p-2 rounded-xl ${isSuspended ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}>
              <Mail className={`w-5 h-5 ${isSuspended ? 'text-amber-400' : 'text-indigo-400'}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Contact Support</h3>
              <p className="text-[12px] text-zinc-500 mt-1">
                {isSuspended ? 'Email our team to resolve the suspension.' : 'You\'ll be granted access once your profile has been verified.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/5">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[12px] text-zinc-400 font-medium">
            Logged in as: <span className="text-zinc-200">{email}</span>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-rose-400 transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
        
        <p className="mt-12 text-[11px] text-zinc-600 font-bold uppercase tracking-[0.2em] italic">
          Powered by Primary Clinic
        </p>
      </div>
    </div>
  );
}
