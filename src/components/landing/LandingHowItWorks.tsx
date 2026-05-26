import React from 'react';
import { LayoutDashboard, FileCheck, Layers, FolderHeart, GraduationCap, Check } from 'lucide-react';

export default function LandingHowItWorks() {
  const systems = [
    {
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      color: "text-indigo-400",
      bullets: ["Active states", "Applications in progress", "Expiring soon", "Needs action", "Readiness overview"]
    },
    {
      title: "My Licenses",
      icon: Layers,
      color: "text-blue-400",
      bullets: ["RN/APRN tracking", "DEA tracking", "Expiration management", "Compact/non-compact", "Readiness scoring"]
    },
    {
      title: "CEU & Competency",
      icon: GraduationCap,
      color: "text-amber-400",
      bullets: ["Pharmacology hours", "Controlled substance", "State requirements", "Renewal cycles", "Competency progress"]
    },
    {
      title: "Documents",
      icon: FolderHeart,
      color: "text-rose-400",
      bullets: ["APRN & RN licenses", "DEA documentation", "Malpractice insurance", "Certifications", "CEU records"]
    },
    {
      title: "Career Hub",
      icon: FileCheck,
      color: "text-emerald-400",
      bullets: ["Saved jobs", "Application tracking", "Employer follow-ups", "Specialty organization", "Compensation tracking"]
    }
  ];

  return (
    <section className="py-20 relative bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Comprehensive System Architecture
          </h2>
          <p className="text-lg text-zinc-400 font-medium">
            A fully integrated workflow engine designed for the operational complexities of multi-state practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((sys, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all duration-300 relative group bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <sys.icon className={`w-6 h-6 ${sys.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{sys.title}</h3>
              </div>
              <ul className="space-y-3">
                {sys.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-indigo-400/70 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
