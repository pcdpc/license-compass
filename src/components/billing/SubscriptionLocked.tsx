'use client';

import React from 'react';
import { Lock } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export function SubscriptionLocked() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    // Redirect to Polar checkout
    // Use an environment variable for the link or default to the provided one
    const checkoutLink = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_LINK || "https://polar.sh/checkout/polar_c_iRU0afzoNq2ycCp1Dlvv0jZkLamkJVo1G9Cb20DTvch";
    
    // Add user metadata if available
    let url = checkoutLink;
    if (user) {
      const email = encodeURIComponent(user.email || '');
      url += `?customer_email=${email}&metadata[firebaseUid]=${user.uid}&metadata[source]=np_compass`;
    }
    
    window.location.href = url;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#050505]">
      <div className="glass-panel p-8 md:p-12 rounded-[2rem] max-w-xl w-full text-center space-y-6 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="inline-flex items-center justify-center p-5 bg-indigo-500/10 rounded-2xl mb-2 border border-indigo-500/20">
          <Lock className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Subscription Required</h1>
          <p className="text-zinc-400 font-medium leading-relaxed">
            Your NP Compass subscription has expired or is currently inactive. Please choose a plan below to restore full access to your dashboard, licenses, and CEUs.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
          <button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-600/20 to-blue-700/20 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50 sm:col-span-2"
          >
            <span className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
              {loading ? 'Redirecting...' : 'Join Now'}
            </span>
            <span className="text-xs text-indigo-400/80 font-bold uppercase tracking-widest mt-1">NP Compass Subscription</span>
          </button>
        </div>

        <div className="pt-6">
          <button 
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
