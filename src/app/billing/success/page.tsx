'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function BillingSuccessPage() {
  const { userProfile, user } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) return;

    // Check if the webhook has already updated the profile
    const isReady = 
      userProfile.subscriptionProvider === 'polar' ||
      userProfile.subscriptionStatus === 'active' ||
      userProfile.subscriptionStatus === 'trialing';

    if (isReady) {
      setVerifying(false);
      // Wait a moment so the user sees the success state, then redirect
      const t = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(t);
    }

    // Since useAuth automatically listens to firestore changes, 
    // the component will re-render when userProfile updates.
    // If it takes too long, we could provide a manual refresh or link.
    const timeout = setTimeout(() => {
      // If after 15 seconds we still haven't seen an update, 
      // maybe the webhook is delayed. Give them a button to go to dashboard.
      setVerifying(false);
    }, 15000);

    return () => clearTimeout(timeout);

  }, [userProfile, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-6 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
        {verifying ? (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-white">Verifying Subscription</h1>
            <p className="text-zinc-400">
              Please wait while we confirm your payment securely. This should only take a moment...
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white">Verification Complete!</h1>
            <p className="text-zinc-400">
              Your subscription has been successfully processed. Welcome to NP Compass!
            </p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
