import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center group/brand mb-6 inline-flex">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50 relative group-hover/brand:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight text-glow group-hover/brand:from-white group-hover/brand:to-zinc-300 transition-all">NP Compass</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              The professional operations platform for nurse practitioners managing multi-state practice, renewals, and career growth.
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-zinc-100 font-bold mb-4 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Start Free Trial</Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-zinc-100 font-bold mb-4 uppercase tracking-widest text-xs">Legal & Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Support & FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Support Info Col */}
          <div>
            <h4 className="text-zinc-100 font-bold mb-4 uppercase tracking-widest text-xs">Support Details</h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>NP Compass Support</p>
              <p>
                <a href="mailto:support@npcompass.app" className="hover:text-indigo-400 transition-colors">support@npcompass.app</a>
              </p>
              <p>Mon–Fri: 8:00 AM – 5:00 PM EST</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm font-medium">
            &copy; {currentYear} NP Compass. All rights reserved.
          </p>
          <p className="text-zinc-500 text-sm font-medium">
            Powered by <a href="https://primary.clinic" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors font-bold">Primary.Clinic</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
