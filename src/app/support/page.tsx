import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, MapPin, Clock, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    {
      question: "What is NP Compass?",
      answer: "NP Compass is a professional operations platform built specifically for nurse practitioners. It helps you manage multi-state licenses, track Continuing Education Units (CEUs), organize credentialing documents, and monitor career pipelines all from a single dashboard."
    },
    {
      question: "Does NP Compass support RN and APRN licenses?",
      answer: "Yes. You can track both RN and APRN licenses simultaneously, including compact state statuses, independent practice requirements, and DEA registrations."
    },
    {
      question: "Can I track CEUs and pharmacology hours?",
      answer: "Absolutely. The platform includes a dedicated CEU tracker where you can log general hours, pharmacology hours, and controlled substance hours, and automatically map them to your eligible state renewals."
    },
    {
      question: "Does NP Compass work on mobile devices?",
      answer: "Yes, our dashboard is fully responsive. You can check your credentials, upload documents, or view expiration alerts quickly from your phone."
    },
    {
      question: "Can I organize credential documents?",
      answer: "Yes. We provide a secure document vault to store copies of your APRN licenses, RN licenses, DEA documentation, malpractice insurance, certifications, and CEU records."
    },
    {
      question: "Does NP Compass help with telehealth expansion?",
      answer: "Yes. By providing a centralized view of multi-state requirements and readiness scores, NP Compass helps you identify exactly what you need to become licensed and active in new states for telehealth practice."
    },
    {
      question: "How does the free trial work?",
      answer: "You get full access to all premium features of NP Compass for 14 days. No credit card is required to start the trial."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Our subscriptions are securely managed through Polar and you can cancel your subscription at any time without penalty."
    },
    {
      question: "Is payment required to start the trial?",
      answer: "No. You can start building your profile and organizing your licenses immediately without entering any payment information."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-6 tracking-tight">Support & FAQ</h1>
        <p className="text-xl text-zinc-400 font-medium">We're here to help you manage your professional practice.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-zinc-100 mb-6">Contact Us</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-300 mb-1">Email Support</p>
                  <a href="mailto:support@npcompass.app" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">support@npcompass.app</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-300 mb-1">Support Hours</p>
                  <p className="text-sm text-zinc-400">Monday–Friday</p>
                  <p className="text-sm text-zinc-400">8:00 AM – 5:00 PM EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-300 mb-1">Office</p>
                  <p className="text-sm text-zinc-400">Georgia Primary Care LLC dba Primary Clinic</p>
                  <p className="text-sm text-zinc-400">1611 S. Utica Ave #101</p>
                  <p className="text-sm text-zinc-400">Tulsa, OK 74104</p>
                  <p className="text-sm text-zinc-400 mt-1">918-340-6477</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <Link href="/contact" className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-sm font-bold text-white transition-colors">
                Send us a message
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-zinc-100">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                <h3 className="text-lg font-bold text-zinc-200 mb-3">{faq.question}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
