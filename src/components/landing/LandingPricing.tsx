'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';

export default function LandingPricing() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 relative overflow-hidden bg-transparent border-y border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-zinc-400 font-medium">
            Everything you need for multi-state practice. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Monthly Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all duration-300 relative group flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Monthly Professional</h3>
              <p className="text-zinc-400 text-sm">Perfect for tracking current credentials</p>
            </div>
            
            <div className="mb-8 flex items-baseline">
              <span className="text-5xl font-black text-white">$9.99</span>
              <span className="text-zinc-500 ml-2 font-bold">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Unlimited state license tracking",
                "Automated renewal alerts",
                "CEU & pharmacology mapping",
                "Secure document vault",
                "Career pipeline & readiness scores",
                "Mobile dashboard access"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={scrollToTop}
              className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Annual Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-indigo-500/50 bg-indigo-500/5 relative shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" /> Most Popular
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-indigo-400 mb-2">Annual Professional</h3>
              <p className="text-zinc-400 text-sm">Save ~18% with annual billing</p>
            </div>
            
            <div className="mb-8 flex items-baseline">
              <span className="text-5xl font-black text-white">$99</span>
              <span className="text-zinc-500 ml-2 font-bold">/yr</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Everything in Monthly",
                "Save ~$20 annually",
                "Priority email support",
                "Early access to new features"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={scrollToTop}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-black shadow-lg shadow-indigo-900/20 transition-all hover:-translate-y-[2px]"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Billing is securely processed by Polar. NP Compass does not store full credit card numbers.
          </p>
        </div>
      </div>
    </section>
  );
}
