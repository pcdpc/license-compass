'use client';

import React from 'react';
import { CreditCard, Check, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toDate } from '@/lib/firestore';
import { hasPremiumAccess } from '@/lib/billing';

export default function BillingPage() {
  const { userProfile, user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const formatDate = (dateVal: any): string => {
    try {
      const d = toDate(dateVal);
      if (!d || isNaN(d.getTime())) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const handleUpgrade = () => {
    try {
      setLoading(true);
      const checkoutLink = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_LINK;
      
      if (!checkoutLink) {
        throw new Error("Missing Polar checkout link. Please configure NEXT_PUBLIC_POLAR_CHECKOUT_LINK.");
      }

      let url = checkoutLink;
      if (user) {
        const email = encodeURIComponent(user.email || '');
        url += `?customer_email=${email}&metadata[firebaseUid]=${user.uid}&metadata[source]=np_compass`;
      }
      window.location.href = url;
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  const isActive = hasPremiumAccess(userProfile);
  const status = userProfile.subscriptionStatus || 'none';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Billing</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Manage your subscription and billing details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-6 border border-indigo-500/30">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Current Subscription</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</p>
                  <p className="text-lg font-bold text-zinc-100 capitalize">{isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    status === 'trialing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    status === 'canceled' || status === 'revoked' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                    status === 'past_due' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {userProfile.currentPeriodEnd && (
                <p className="text-sm text-zinc-400 font-medium">
                  Current period ends: <span className="text-zinc-200">{formatDate(userProfile.currentPeriodEnd)}</span>
                </p>
              )}

              {userProfile.trialEndDate && status === 'trialing' && (
                <p className="text-sm text-amber-400 font-medium">
                  Trial ends on: <span className="text-amber-300">{formatDate(userProfile.trialEndDate)}</span>
                </p>
              )}
              
              <div className="pt-4 border-t border-white/5">
                {!isActive || status === 'canceled' || status === 'none' ? (
                  <button 
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Redirecting...' : 'Upgrade / Subscribe'}
                  </button>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <p className="text-sm text-zinc-300 font-medium">
                      To manage your billing, update payment methods, or cancel your subscription:
                    </p>
                    <a 
                      href="mailto:support@npcompass.app?subject=NP%20Compass%20Billing"
                      className="w-full py-3 bg-transparent border border-white/20 text-zinc-300 font-bold text-sm rounded-xl hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" /> Contact Support (support@npcompass.app)
                    </a>
                    {/* TODO: Add direct Polar Customer Portal link integration here when available */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Secure Billing</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your payments are securely processed by Polar. NP Compass does not store your full credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
