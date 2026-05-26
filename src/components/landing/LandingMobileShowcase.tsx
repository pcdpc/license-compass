import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const mobileScreenshots = [
  {
    id: 'dashboard',
    title: 'Mobile Dashboard',
    description: 'Check your alerts on the go.',
    src: '/screenshots/mobile-dashboard-overview.webp'
  },
  {
    id: 'licenses',
    title: 'My Licenses',
    description: 'All your state credentials in your pocket.',
    src: '/screenshots/mobile-my-licenses.webp'
  },
  {
    id: 'detail',
    title: 'License Details',
    description: 'Quickly reference board numbers and dates.',
    src: '/screenshots/mobile-license-detail.webp'
  },
  {
    id: 'ceu',
    title: 'CEU Tracker',
    description: 'Log conference hours right from your phone.',
    src: '/screenshots/mobile-ceu-tracker.webp'
  },
  {
    id: 'career',
    title: 'Career Pipeline',
    description: 'Respond to opportunities instantly.',
    src: '/screenshots/mobile-career-pipeline.webp'
  }
];

export default function LandingMobileShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % mobileScreenshots.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-20 relative overflow-hidden bg-[#050505]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 mb-4 tracking-tight">
            Manage Your Licenses From Anywhere
          </h2>
          <p className="text-base text-zinc-400 font-medium">
            Whether you're at the clinic, traveling, or at a conference, NP Compass works flawlessly on your phone.
          </p>
        </div>

        <div 
          className="flex flex-col lg:flex-row-reverse gap-12 items-center justify-center max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation/Thumbnails */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            {mobileScreenshots.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`text-left p-5 rounded-2xl transition-all duration-300 border relative overflow-hidden group ${
                  activeIndex === idx 
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {activeIndex === idx && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                )}
                <h3 className={`text-base font-bold mb-2 transition-colors ${activeIndex === idx ? 'text-blue-400' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm font-medium leading-relaxed transition-colors duration-300 ${activeIndex === idx ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          {/* Single Phone Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0 relative">
            <div className="w-[280px] md:w-[300px] aspect-[9/19] rounded-[2.5rem] border-[8px] border-zinc-900 bg-zinc-950 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 relative z-10">
              <div className="absolute top-0 inset-x-0 h-5 bg-zinc-900 z-20 rounded-b-2xl mx-auto w-1/2"></div>
              
              <div className="relative w-full h-full bg-zinc-900 overflow-hidden">
                {mobileScreenshots.map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[100px] -z-10 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
