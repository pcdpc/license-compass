'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent relative z-0">
      {/* Decorative large glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Left side - Product Info */}
      <div className="flex-1 flex flex-col justify-center p-12 bg-white/5 backdrop-blur-md text-zinc-100 border-r border-white/10 relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center mb-8">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/50">
              <Compass className="w-12 h-12 text-white" />
            </div>
            <h1 className="ml-4 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 text-glow">License Compass</h1>
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight text-white drop-shadow-md">
            Know exactly where you can practice.
          </h2>
          <p className="text-lg text-zinc-400 mb-10 font-medium">
            Multi-state APRN license tracker, CEU deficit calculator, and dynamic state practice readiness engine.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start glass-panel p-5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mr-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Never Miss Renewals</h3>
                <p className="text-zinc-400 text-sm font-medium mt-1">Automated expiration tracking for licenses, DEAs, and malpractice.</p>
              </div>
            </div>
            <div className="flex items-start glass-panel p-5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 mr-4 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                 <Zap className="w-6 h-6 text-amber-400 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">One CEU = Multistate</h3>
                <p className="text-zinc-400 text-sm font-medium mt-1">Upload one certificate and apply it to requirements across multiple states.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center p-12 bg-transparent relative overflow-hidden">
        <div className="w-full max-w-sm space-y-8 glass-panel p-10 rounded-3xl relative z-10 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-inner mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Lock className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]" />
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight text-glow">Welcome Back</h2>
            <p className="text-zinc-400 mt-2 font-medium">Sign in to your practitioner dashboard</p>
          </div>
          
          <button
            onClick={signInWithGoogle}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:outline-none hover:-translate-y-[2px] transition-all duration-300 font-bold text-white group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
