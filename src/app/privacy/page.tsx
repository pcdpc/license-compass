import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | NP Compass',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-bold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: May 2026</p>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>
            NP Compass values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your name, email, credentials, and license information. We do not sell your personal data.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">2. Use of Information</h2>
          <p>
            Your information is used solely to provide the services offered by NP Compass, including license tracking, reminders, and related professional pipeline management.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">3. Data Security</h2>
          <p>
            We implement industry-standard security measures, including Google Firebase authentication and encrypted data storage, to protect your personal information.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">4. Payment Processing</h2>
          <p>
            Payments are processed securely by our Merchant of Record, Polar. NP Compass does not store your full credit card information.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">5. Contact Us</h2>
          <p>
            If you have questions about our privacy practices, please contact us at support@npcompass.app.
          </p>
        </div>
      </div>
    </div>
  );
}
