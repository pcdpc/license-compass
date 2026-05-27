import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | NP Compass',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-bold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-sm text-zinc-500">Last updated: May 2026</p>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>
            Welcome to NP Compass, operated by Georgia Primary Care LLC dba Primary Clinic. 
            By using our application, you agree to these terms.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using NP Compass, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">2. Description of Service</h2>
          <p>
            NP Compass provides licensing and credential tracking for Nurse Practitioners. We are not responsible for your missed deadlines or revoked credentials. The tool is provided "as is" to assist with tracking.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">3. Billing and Subscriptions</h2>
          <p>
            Billing is handled via our merchant of record, Polar. By subscribing, you agree to Polar's terms of service. Subscriptions are billed in advance on a monthly or annual basis. You may cancel at any time.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">4. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@npcompass.app.
          </p>
        </div>
      </div>
    </div>
  );
}
