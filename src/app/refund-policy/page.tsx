import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      
      <div className="prose prose-invert prose-zinc max-w-none">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-8 tracking-tight">Refund Policy</h1>
        <p className="text-zinc-400 font-medium text-lg mb-12">Last Updated: {currentDate}</p>

        <section className="space-y-6">
          <p className="text-zinc-300 leading-relaxed text-lg font-medium">
            NP License Compass offers refunds within 14 days of the original purchase date.
          </p>
          <p className="text-zinc-300 leading-relaxed text-lg font-medium">
            If you are not satisfied with your subscription, you may request a full refund within 14 days of purchase.
          </p>
          <p className="text-zinc-300 leading-relaxed text-lg font-medium">
            To request a refund, contact:<br />
            <a href="mailto:support@npcompass.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@npcompass.app</a>
          </p>
          <p className="text-zinc-300 leading-relaxed text-lg font-medium">
            Refunds requested after 14 days from the purchase date are not eligible.
          </p>
        </section>
      </div>
    </div>
  );
}
