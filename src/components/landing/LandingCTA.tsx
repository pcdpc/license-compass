import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function LandingCTA() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 relative overflow-hidden bg-zinc-950">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white mb-6 tracking-tight drop-shadow-lg">
          Start organizing your licenses today.
        </h2>
        <p className="text-xl text-zinc-300 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
          Built specifically for nurse practitioners managing multi-state practice, telehealth expansion, credentialing, CEUs, and career growth.
        </p>
        
        <button 
          onClick={scrollToTop}
          className="group inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
        >
          Start your free 14-day trial
          <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
        
        <p className="mt-6 text-sm text-zinc-500 font-medium">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
