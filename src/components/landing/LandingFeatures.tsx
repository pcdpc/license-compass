import React from 'react';
import { ShieldCheck, Clock, BookOpen, Briefcase, Map, FileText, Globe, Smartphone } from 'lucide-react';

export default function LandingFeatures() {
  const features = [
    {
      label: 'LICENSE MANAGEMENT',
      name: 'Multi-state APRN & RN tracking',
      description: 'Manage multiple state licenses simultaneously with separate requirements for each.',
      icon: Map,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      label: 'LICENSE MANAGEMENT',
      name: 'Renewal countdowns & alerts',
      description: 'Never miss an expiration with automated tracking and visual urgency alerts.',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
    {
      label: 'CEU & COMPETENCY TRACKING',
      name: 'CEU & pharmacology tracking',
      description: 'Log hours once and apply them automatically to all eligible state requirements.',
      icon: BookOpen,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'CAREER HUB',
      name: 'Career Hub & application tracking',
      description: 'Track job opportunities, submitted applications, and employer follow-ups.',
      icon: Briefcase,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'MULTI-STATE READINESS',
      name: 'State readiness scoring',
      description: 'Know exactly how close you are to active licensure in any state pipeline.',
      icon: ShieldCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'DOCUMENT MANAGEMENT',
      name: 'Document organization',
      description: 'A secure vault for DEAs, malpractice policies, and collaborative agreements.',
      icon: FileText,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10'
    },
    {
      label: 'MULTI-STATE READINESS',
      name: 'Telehealth readiness',
      description: 'Designed for the modern NP practicing across state lines digitally.',
      icon: Globe,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      label: 'MOBILE ACCESS',
      name: 'Mobile dashboard access',
      description: 'Check your credentials quickly, from anywhere, right on your phone.',
      icon: Smartphone,
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10'
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-[#050505]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-6 leading-tight tracking-tight">
            Your Professional Command Center for Multi-State Practice
          </h2>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed">
            NP Compass helps nurse practitioners manage licenses, CEUs, renewals, credential requirements, documents, and career opportunities across multiple states from one centralized dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative group bg-white/[0.02]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${feature.bg} border border-white/5 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2 group-hover:text-zinc-400 transition-colors">
                {feature.label}
              </p>
              <h3 className="text-lg font-bold text-zinc-100 mb-2 leading-tight">{feature.name}</h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
