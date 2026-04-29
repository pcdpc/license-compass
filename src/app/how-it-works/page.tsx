'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  ListTodo, 
  Clock, 
  Files, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Award,
  ShieldCheck
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'Dashboard Overview',
      icon: LayoutDashboard,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      description: 'Your central command center for all licensing activity.',
      points: [
        'Instantly view your Total States, Active States, and Applications in Progress.',
        'The Needs Action panel surfaces urgent items, prioritizing incomplete tasks and pending applications.',
        'The Expiring Soon panel automatically highlights any credential expiring within 90 days.',
        'Click on any item in the dashboard panels to jump directly to that license.'
      ]
    },
    {
      title: 'License Tracking & Readiness',
      icon: Map,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: 'Comprehensive profiles for each state you are licensed (or applying) in.',
      points: [
        'Track both RN and APRN statuses per state simultaneously.',
        'Monitor specific requirements like DEA, State Controlled Substance, Fingerprinting, and Background Checks.',
        'The system calculates a "Readiness Score" (0-100%) based on completed requirements.',
        'Assign a status to each state (Pipeline, Pending, Active, Avoid Licensing) to control where it appears in your workflow.'
      ]
    },
    {
      title: 'Task Management',
      icon: ListTodo,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      description: 'Lightweight, actionable steps attached directly to specific licenses.',
      points: [
        'Add custom tasks (like "Request transcripts" or "Finish fingerprinting") on any license profile.',
        'Set optional due dates to stay organized.',
        'Tasks with upcoming due dates automatically appear on your main Dashboard under "Needs Action".',
        'Quickly edit, delete, or mark tasks as completed.'
      ]
    },
    {
      title: 'Expiration Tracking',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      description: 'Intelligent expiration scanning to prevent lapsed credentials.',
      points: [
        'The system automatically scans RN, APRN, DEA, and State Controlled Substance dates.',
        'Color-coded badges (Green, Yellow, Red, Gray) visually indicate urgency.',
        'Your Licenses list is automatically sorted to show the soonest expiring licenses at the top.',
        'Hover over any expiration badge to see the exact MM/DD/YYYY date.'
      ]
    },
    {
      title: 'Document Vault',
      icon: Files,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      description: 'Secure storage for all your licensing paperwork.',
      points: [
        'Upload documents and categorize them (e.g., Background Check, Malpractice, Fingerprints).',
        'Link documents to specific states or keep them as "General" multi-state documents.',
        'Track expiration dates on individual documents so you know when they need renewing.'
      ]
    },
    {
      title: 'Career Hub',
      icon: Briefcase,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      description: 'Manage your professional opportunities alongside your licenses.',
      points: [
        'Track job applications across different stages (Saved, Applied, Active).',
        'Set Follow-up dates to ensure you never miss a deadline.',
        'Link jobs to specific states to understand your geographic pipeline.'
      ]
    },
    {
      title: 'CEU & Competency Tracker',
      icon: Award,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      description: 'Sophisticated tracking of state-specific APRN mandates.',
      points: [
        'Automated Mandates: The system tracks official Board of Nursing requirements for hours, pharmacology, and controlled substances.',
        'Visual Progress: Real-time progress bars show how close you are to meeting state-specific totals.',
        'CEU Addendum: Add manual notes or personalized requirements that appear alongside official board rules.',
        'Multi-State Logging: Log a single course and apply it to multiple state licenses simultaneously.',
        'Actionable Alerts: The Dashboard automatically identifies and warns you about missing CEU requirements for your active licenses.',
        'Log History: Manage your full history of courses with the ability to delete or update records as needed.'
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'How is the Readiness Score calculated?',
      answer: 'The Readiness Score evaluates your current application status along with completion of state-specific requirements (like RN/APRN statuses, Fingerprints, Background Checks, and DEA). As you fulfill these requirements and update their statuses to "Active" or "Completed", your score increases.'
    },
    {
      question: 'How do tasks interact with the Dashboard?',
      answer: 'When you create an incomplete task on a specific license, that license will immediately appear in the "Needs Action" panel on your main Dashboard. The Dashboard prioritizes tasks over other pending items so you always know your exact next step.'
    },
    {
      question: 'How are expiration dates calculated?',
      answer: 'The system looks at all expiration dates associated with a state (RN, APRN, DEA, and Controlled Substance). It automatically picks the one that is expiring soonest and uses that to generate the color-coded warning badge.'
    },
    {
      question: 'Why does a state say "Avoid Licensing"?',
      answer: 'You can explicitly mark a state as "Avoid Licensing" if the state has unfavorable conditions (e.g., high fees or strict supervision requirements). These states will be highlighted in red in your lists and will be excluded from your "Needs Action" and "Expiring Soon" panels to reduce noise.'
    },
    {
      question: 'What happens when a state is in the "Pipeline"?',
      answer: 'States marked as "Not Started" or "Researching" are considered to be in your Pipeline. They are excluded from your urgent "Needs Action" list so you can focus on active applications, but you can still view them in the "Applications in Progress" or Pipeline views.'
    },
    {
      question: 'How do CEU mandates work?',
      answer: 'NP Compass stores a database of official Board of Nursing requirements. When you have an active APRN license, the system automatically compares your logged courses against that state\'s specific mandates (including Pharmacology and Controlled Substance hours). If you have specialized local requirements, you can use the "CEU Addendum" feature on the license page to add your own manual notes.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow flex items-center">
          How It Works
        </h1>
        <p className="text-sm text-zinc-400 mt-2 font-medium max-w-3xl leading-relaxed">
          NP Compass is a comprehensive credential management system built specifically for nurse practitioners. 
          It intelligently tracks your licenses, tasks, expirations, and career opportunities in one unified platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${feature.bg} rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm ${feature.bg}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h2 className="text-lg font-bold text-zinc-100">{feature.title}</h2>
              </div>
              
              <p className="text-sm text-zinc-400 font-medium mb-4">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${feature.bg.replace('/10', '')}`}></span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-extrabold text-zinc-100 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl overflow-hidden border border-white/10 transition-all duration-300"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-bold text-zinc-200">{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === idx ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="w-full h-px bg-white/5 mb-4"></div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
