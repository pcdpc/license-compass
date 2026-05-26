import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      
      <div className="prose prose-invert prose-zinc max-w-none">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-8 tracking-tight">Terms of Service</h1>
        <p className="text-zinc-400 font-medium text-lg mb-12">Last Updated: May 2026</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. Acceptance of Terms</h2>
          <p className="text-zinc-400 leading-relaxed">
            By accessing or using NP Compass ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. The Service is provided by Georgia Primary Care LLC dba Primary Clinic ("we," "us," or "our").
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Description of Service & Informational Disclaimer</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            NP Compass is a professional workflow management and tracking platform designed for nurse practitioners. The Service provides tools for organizing multi-state licensure, tracking Continuing Education Units (CEUs), and storing professional credential documents.
          </p>
          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
            <p className="text-amber-200/90 font-medium m-0">
              <strong className="text-amber-400">Important Disclaimer:</strong> NP Compass is an informational tool only. We do not guarantee the approval, renewal, or valid status of any license, certification, or application. It is your sole responsibility to verify all requirements directly with the applicable state boards of nursing and credentialing bodies. NP Compass is not a substitute for legal or professional compliance advice.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Account Responsibilities</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            You must provide accurate, current, and complete information during the registration process. You are entirely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            You must be a licensed healthcare professional, nursing student, or healthcare administrator to use this Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Subscriptions, Trials, and Payment Terms</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong>Free Trial:</strong> We offer a 14-day free trial requiring no credit card upfront. At the end of the trial period, your account will be restricted until a paid subscription is activated.
          </p>
          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong>Billing:</strong> Subscription management and payment processing are powered by Paddle. By subscribing, you agree to Paddle's terms of service and privacy policy regarding payment processing.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellations will take effect at the end of your current billing cycle. We do not provide refunds for partial months or unused time.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Acceptable Use</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500">
            <li>Use the Service for any illegal or unauthorized purpose.</li>
            <li>Upload documents containing Protected Health Information (PHI) or sensitive patient data. The platform is designed solely for <em>provider</em> credentialing documents.</li>
            <li>Attempt to reverse engineer, decompile, or hack the Service.</li>
            <li>Share your account credentials with third parties.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Intellectual Property</h2>
          <p className="text-zinc-400 leading-relaxed">
            All content, features, and functionality of the Service (including but not limited to design, text, graphics, logos, and software) are owned by Georgia Primary Care LLC dba Primary Clinic and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Limitation of Liability</h2>
          <p className="text-zinc-400 leading-relaxed">
            To the maximum extent permitted by law, Georgia Primary Care LLC dba Primary Clinic and NP Compass shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or professional standing resulting from your use or inability to use the Service. We are not liable for lapsed licenses, missed renewals, or employment consequences arising from data entered into or omitted from the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Changes to Terms</h2>
          <p className="text-zinc-400 leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the Service following such notice constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">9. Contact</h2>
          <p className="text-zinc-400 leading-relaxed">
            If you have any questions about these Terms, please contact us at <a href="mailto:support@npcompass.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@npcompass.app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
