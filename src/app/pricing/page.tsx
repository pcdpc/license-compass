import React from 'react';
import LandingPricing from '@/components/landing/LandingPricing';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing | NP Compass',
  description: 'Simple, transparent pricing for NP Compass.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300">
      <header className="border-b border-white/10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-black text-white tracking-tight text-glow">NP Compass</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
          Sign In
        </Link>
      </header>

      <main className="py-12">
        <LandingPricing />
        
        <div className="text-center mt-12 mb-20">
          <Link 
            href="/login" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-black rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:-translate-y-[2px]"
          >
            Create an Account to Subscribe
          </Link>
        </div>
      </main>
    </div>
  );
}
