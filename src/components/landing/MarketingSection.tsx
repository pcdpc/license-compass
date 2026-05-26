'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Award, 
  Map, 
  FileText,
  ShieldCheck,
  Zap,
  Bell,
  CheckCircle2,
  BookOpen,
  Calendar,
  Activity,
  Globe
} from 'lucide-react';

export default function MarketingSection() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" />,
      image: '/screenshots/mobile-dashboard-overview.webp'
    },
    {
      id: 'expirations',
      title: 'Expiration Countdowns',
      icon: <Clock className="w-5 h-5 text-rose-400" />,
      image: '/screenshots/mobile-my-licenses.webp'
    },
    {
      id: 'ce',
      title: 'CE Tracking',
      icon: <Award className="w-5 h-5 text-amber-400" />,
      image: '/screenshots/mobile-ceu-tracker.webp'
    },
    {
      id: 'states',
      title: 'State Details',
      icon: <Map className="w-5 h-5 text-emerald-400" />,
      image: '/screenshots/mobile-ready-states.webp'
    },
    {
      id: 'applications',
      title: 'Pending Apps',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      image: '/screenshots/mobile-career-pipeline.webp'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [screens.length]);

  return (
    <div className="w-full bg-[#050505] relative z-10 py-24 border-t border-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Mobile Preview Area */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="flex-1 space-y-8 lg:pr-12">
            <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
              A Complete View of Your Professional Standing
            </h3>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              We've consolidated everything you need into a single, intuitive interface. From tracking multiple state licenses to ensuring your pharmacology CEUs are up to date, NP Compass does the heavy lifting so you can focus on patient care.
            </p>
            
            <div className="space-y-2 pt-4">
              {screens.map((screen, idx) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(idx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-left ${
                    activeScreen === idx 
                      ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.2)]' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${activeScreen === idx ? 'bg-black/50 shadow-inner' : 'bg-white/5'}`}>
                    {screen.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${activeScreen === idx ? 'text-white' : 'text-zinc-400'}`}>
                      {screen.title}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex justify-center w-full relative">
            {/* Phone Mockup Frame */}
            <div className="relative w-[320px] h-[650px] bg-[#0a0a0a] rounded-[3rem] border-[8px] border-[#1f1f22] shadow-[0_0_50px_rgba(0,0,0,0.5),_inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-32 h-6 bg-[#1f1f22] rounded-b-3xl"></div>
              </div>
              
              {/* Screen Content */}
              <div className="flex-1 bg-[#050505] overflow-y-auto overflow-x-hidden relative z-10 flex flex-col">
                <img 
                  key={activeScreen}
                  src={screens[activeScreen].image} 
                  alt={screens[activeScreen].title}
                  className="w-full h-auto object-cover animate-in fade-in duration-500"
                />
              </div>
              
              {/* Bottom Home Indicator */}
              <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center z-20">
                <div className="w-24 h-1 bg-white/20 rounded-full"></div>
              </div>
            </div>
            
            {/* Abstract Floating Elements around the phone */}
            <div className="absolute top-[10%] -left-6 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[20%] -right-6 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Everything You Need to Stay Compliant</h3>
          <p className="text-zinc-400 max-w-2xl mx-auto">A purpose-built toolset for modern Nurse Practitioners.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard 
            icon={<Map className="w-6 h-6 text-indigo-400" />}
            title="APRN + RN Tracking"
            description="Manage dual licenses across multiple compact and independent practice states."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-emerald-400" />}
            title="Active & Pending"
            description="Track both active licenses and applications currently under review by state boards."
          />
          <FeatureCard 
            icon={<Bell className="w-6 h-6 text-rose-400" />}
            title="Expiration Alerts"
            description="Receive proactive alerts before your licenses, DEAs, or certifications lapse."
          />
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-amber-400" />}
            title="CEU Organization"
            description="Centralize all your completion certificates in one secure, easily accessible vault."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-orange-400" />}
            title="Pharmacology Tracking"
            description="Specifically track pharmacology and controlled substance hours separately from general CEUs."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="w-6 h-6 text-teal-400" />}
            title="Renewal Readiness"
            description="See at a glance if you meet the specific CEU and practice hour requirements for renewal."
          />
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-blue-400" />}
            title="Notes & Logs"
            description="Keep a professional activity log of collaborative agreements and important board correspondence."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-purple-400" />}
            title="Multi-State Telehealth"
            description="Easily assess your readiness to expand your telehealth practice into new jurisdictions."
          />
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 p-6 rounded-2xl group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-5 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-zinc-100 font-bold mb-2 relative z-10">{title}</h4>
      <p className="text-zinc-400 text-sm leading-relaxed relative z-10">{description}</p>
    </div>
  );
}
