import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const productShowcase = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'A birds-eye view of your credentials, expiring licenses, and action items across all states.',
    desktopSrc: '/screenshots/dashboard-overview.webp',
    mobileSrc: '/screenshots/mobile-dashboard-overview.webp'
  },
  {
    id: 'licenses',
    title: 'My Licenses',
    description: 'Track RN and APRN numbers, compact statuses, and DEA registrations in one table.',
    desktopSrc: '/screenshots/my-licenses-table.webp',
    mobileSrc: '/screenshots/mobile-my-licenses.webp'
  },
  {
    id: 'competency',
    title: 'CEU & Competency',
    description: 'Log pharmacology, ethics, and general hours to instantly see readiness across states.',
    desktopSrc: '/screenshots/competency-tracker-dashboard.webp',
    mobileSrc: '/screenshots/mobile-ceu-tracker.webp'
  },
  {
    id: 'career',
    title: 'Career Hub',
    description: 'Track active applications, interview follow-ups, and organize your professional pipeline.',
    desktopSrc: '/screenshots/career-hub-dashboard.webp',
    mobileSrc: '/screenshots/mobile-career-pipeline.webp'
  },
  {
    id: 'readiness',
    title: 'State Readiness',
    description: 'Instantly view a readiness score for any pending state application.',
    desktopSrc: '/screenshots/state-readiness-dashboard.webp',
    mobileSrc: '/screenshots/mobile-state-mandates..webp' // Note: the file has two dots based on file system
  }
];

export default function LandingProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate screenshots slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % productShowcase.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 mb-6 tracking-tight">
            Built for Serious Multi-State Practice
          </h2>
          <p className="text-lg text-zinc-400 font-medium">
            Everything you need organized into a clean, professional command center. Explore the platform built for nurse practitioners.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Navigation/Thumbnails */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            {productShowcase.map((item, idx) => (
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
                <div className={`overflow-hidden transition-all duration-500 ${activeIndex === idx ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
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
              
              {/* Screen Content */}
              <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                {productShowcase.map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <Image
                      src={item.desktopSrc}
                      alt={item.title}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Phone Mockup Overlay */}
            <div className="absolute -right-6 -bottom-10 lg:-right-12 lg:-bottom-16 w-[140px] md:w-[180px] lg:w-[200px] aspect-[9/19] rounded-[2rem] border-[6px] border-zinc-900 bg-zinc-950 overflow-hidden shadow-[-20px_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/20 z-30 transition-transform duration-700 hover:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-4 bg-zinc-900 z-20 rounded-b-xl mx-auto w-1/2"></div>
              <div className="relative w-full h-full">
                {productShowcase.map((item, idx) => (
                  <div 
                    key={`m-${item.id}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <Image
                      src={item.mobileSrc}
                      alt={`${item.title} Mobile`}
                      fill
                      className="object-cover"
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
