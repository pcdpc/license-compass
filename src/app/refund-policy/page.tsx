import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | NP Compass',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-bold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-white">Refund Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: May 2026</p>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>
            At NP Compass, we aim to provide an exceptional tool for your professional licensing needs.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">1. Subscription Cancellations</h2>
          <p>
            You can cancel your subscription at any time. When you cancel, you will continue to have access to the premium features of NP Compass until the end of your current billing cycle.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">2. Refunds</h2>
          <p>
            Because we offer a free trial period allowing you to evaluate the product, we generally do not offer refunds for charges that have already been processed for the current billing cycle.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">3. Exceptions</h2>
          <p>
            In rare cases, if there is a billing error on our end or from our payment processor (Polar), we will issue a full or partial refund. Please contact us within 7 days of the charge if you believe an error occurred.
          </p>

          <h2 className="text-2xl font-bold text-zinc-200 mt-8">4. Contact Us</h2>
          <p>
            To request a refund or if you have questions regarding billing, please email us at support@npcompass.app with "NP Compass Billing" as the subject line.
          </p>
        </div>
      </div>
    </div>
  );
}
