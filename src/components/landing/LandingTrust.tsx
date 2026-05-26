import React from 'react';

export default function LandingTrust() {
  return (
    <section className="py-16 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <p className="text-xl md:text-2xl font-medium text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Designed specifically for nurse practitioners managing complex multi-state practice workflows, telehealth expansion, and credentialing pipelines.
        </p>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
    </section>
  );
}
