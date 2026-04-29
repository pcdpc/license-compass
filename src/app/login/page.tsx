'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, ShieldCheck, Zap, Lock, Mail, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, loading, isSigningIn } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      displayName: ''
    }
  });

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: any) => {
    setError(null);
    setResetSent(false);
    try {
      if (authMode === 'login') {
        await signInWithEmail(data.email, data.password);
      } else {
        await signUpWithEmail(data.email, data.password, data.displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };
  
  const handleForgotPassword = async () => {
    const email = (getValues() as any).email;
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    
    setError(null);
    setIsResetLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setIsResetLoading(false);
    }
  };

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
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Left side - Product Info */}
      <div className="hidden lg:flex flex-[1.2] flex-col justify-center p-12 bg-white/5 backdrop-blur-md text-zinc-100 border-r border-white/10 relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center mb-12">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/50">
              <Compass className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="ml-4 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 text-glow leading-none">NP Compass</h1>
              <p className="ml-4 mt-1 text-[10px] font-medium text-zinc-500 italic tracking-wider uppercase opacity-70">powered by Primary Clinic</p>
            </div>
          </div>
          <h2 className="text-5xl font-extrabold mb-8 leading-tight text-white drop-shadow-md">
            Track Every License. <span className="text-indigo-400">Never Miss a Renewal.</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-2 font-medium leading-relaxed">
            CEUs, expirations, and multi-state licensing—all in one place.
          </p>
          <p className="text-sm text-indigo-400/80 mb-12 font-bold uppercase tracking-wider">
            Built for nurse practitioners managing multiple state licenses.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start glass-panel p-6 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mr-5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-lg">Automated Compliance</h3>
                <p className="text-zinc-400 text-sm font-medium mt-1">We track licenses, CEUs, and expirations so you don’t miss anything.</p>
              </div>
            </div>
            <div className="flex items-start glass-panel p-6 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 mr-5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                 <Zap className="w-6 h-6 text-amber-400 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-lg">Smart CEU Application</h3>
                <p className="text-zinc-400 text-sm font-medium mt-1">Upload once. Apply CEUs across all eligible states instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-transparent relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 glass-panel p-8 md:p-10 rounded-[2rem] relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-inner mb-6 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Lock className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.4)]" />
            </div>
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight text-glow">
              Access Your Dashboard
            </h2>
            <p className="text-zinc-400 mt-2 font-medium">
              {authMode === 'login' 
                ? 'Sign in to manage your licenses and stay compliant.' 
                : 'Sign up to start your free trial and stay compliant.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    {...register('displayName', { required: authMode === 'signup' })}
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
                  type="email"
                  placeholder="name@provider.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-400 ml-1 font-bold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none">Password</label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={isResetLoading}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    {isResetLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Forgot?'}
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
              {errors.password && <p className="text-[10px] text-rose-400 ml-1 font-bold">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 text-center">
                {error}
              </div>
            )}

            {resetSent && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 text-center">
                Password reset link sent! <br/>
                <span className="text-[10px] opacity-80 font-medium">(Check your spam folder if you don't see it)</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="group relative w-full flex justify-center items-center py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:shadow-indigo-500/20 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
            >
              {isSigningIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="mr-2">{authMode === 'login' ? 'Sign In' : 'Start Free Trial'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#0a0a0a] px-4 text-zinc-500 font-bold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isSigningIn}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 font-bold text-zinc-200 group disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <div className="text-center pt-4 border-t border-white/5">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="group/btn flex flex-col items-center gap-1 w-full"
            >
              <span className="text-xs font-bold text-indigo-400 transition-colors uppercase tracking-widest">
                {authMode === 'login' 
                  ? "Start your free 14-day trial — create an account" 
                  : "Already have an account? Sign In"}
              </span>
              {authMode === 'login' && (
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No credit card required</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

