import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const webScreenshots = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'A birds-eye view of your credentials, expiring licenses, and action items across all states.',
    src: '/screenshots/dashboard-overview.webp'
  },
  {
    id: 'licenses',
    title: 'My Licenses',
    description: 'Track RN and APRN numbers, compact statuses, and DEA registrations in one table.',
    src: '/screenshots/my-licenses-table.webp'
  },
  {
    id: 'competency',
    title: 'CEU & Competency',
    description: 'Log pharmacology, ethics, and general hours to instantly see readiness across states.',
    src: '/screenshots/competency-tracker-dashboard.webp'
  },
  {
    id: 'career',
    title: 'Career Hub',
    description: 'Track active applications, interview follow-ups, and organize your professional pipeline.',
    src: '/screenshots/career-hub-dashboard.webp'
  },
  {
    id: 'documents',
    title: 'Document Vault',
    description: 'Securely store and organize board correspondence, malpractice policies, and CE certificates.',
    src: '/screenshots/document-library-dashboard.webp'
  }
];

export default function LandingWebShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate screenshots slowly if not paused
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % webScreenshots.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-20 relative overflow-hidden bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 mb-6 tracking-tight">
            Built for Serious Multi-State Practice
          </h2>
          <p className="text-lg text-zinc-400 font-medium">
            Everything you need organized into a clean, professional command center. Explore the platform built for nurse practitioners.
          </p>
        </div>

        <div 
          className="flex flex-col lg:flex-row gap-12 items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation/Thumbnails (Fixed Height Content) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            {webScreenshots.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`text-left p-5 rounded-2xl transition-all duration-300 border relative overflow-hidden group ${
                  activeIndex === idx 
                    ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {activeIndex === idx && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
                )}
                <h3 className={`text-base font-bold mb-2 transition-colors ${activeIndex === idx ? 'text-indigo-400' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                  {item.title}
                </h3>
                {/* Text is always fully visible to prevent layout shift, but color changes */}
                <p className={`text-sm font-medium leading-relaxed transition-colors duration-300 ${activeIndex === idx ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          {/* Screenshot Display */}
          <div className="w-full lg:w-2/3 relative mt-8 lg:mt-0">
            {/* Desktop Browser Mockup */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative z-10 group transition-transform duration-700">
              {/* Browser Chrome */}
              <div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <div className="ml-4 flex-1 flex justify-center">
                  <div className="w-1/3 max-w-[200px] h-4 bg-white/5 rounded-md border border-white/5"></div>
                </div>
              </div>
              
              {/* Screen Content - Fixed Aspect Ratio ensures no layout shift */}
              <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                {webScreenshots.map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover object-top"
                      priority={idx === 0}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle glow behind the screens */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-500/20 blur-[120px] -z-10 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
