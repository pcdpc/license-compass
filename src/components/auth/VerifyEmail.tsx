import React, { useState } from 'react';
import { Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const VerifyEmail = () => {
  const { user, sendVerificationEmail } = useAuth();
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResend = async () => {
    try {
      setResendStatus('sending');
      setErrorMsg('');
      await sendVerificationEmail();
      setResendStatus('sent');
      // Reset after 60 seconds to allow resending again
      setTimeout(() => setResendStatus('idle'), 60000);
    } catch (error: any) {
      console.error(error);
      setResendStatus('error');
      setErrorMsg(error.message || 'Failed to send verification email.');
    }
  };

  const handleRefresh = () => {
    // Reload the page to force Firebase to grab the latest user token
    // which will update user.emailVerified if they clicked the link.
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#050505]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-[2rem] border border-white/10 text-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div className="mx-auto w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Mail className="w-10 h-10 text-indigo-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Verify Your Email</h1>
        
        <p className="text-zinc-400 font-medium mb-2">
          We sent a verification link to:
        </p>
        <p className="text-indigo-300 font-bold bg-white/5 border border-white/10 rounded-xl py-2 px-4 inline-block mb-8">
          {user?.email}
        </p>

        <p className="text-sm text-zinc-500 mb-8 max-w-[280px] mx-auto">
          Please click the link in that email to verify your account and unlock your dashboard.
        </p>

        <div className="space-y-4 w-full">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all uppercase tracking-widest text-sm"
          >
            I've Verified My Email
          </button>

          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-bold rounded-xl transition-all uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {resendStatus === 'sending' && <RefreshCw className="w-4 h-4 animate-spin" />}
            {resendStatus === 'sending' && 'Sending...'}
            {resendStatus === 'sent' && 'Email Sent!'}
            {resendStatus === 'idle' && 'Resend Verification Email'}
            {resendStatus === 'error' && 'Retry Sending Email'}
          </button>
        </div>

        {resendStatus === 'sent' && (
          <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
            Link sent! Check your spam folder.
          </p>
        )}

        {resendStatus === 'error' && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <p className="text-[10px] text-rose-300 font-medium">
              {errorMsg}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
