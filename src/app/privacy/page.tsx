import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      
      <div className="prose prose-invert prose-zinc max-w-none">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-400 font-medium text-lg mb-12">Last Updated: May 2026</p>

        <section className="mb-12">
          <p className="text-zinc-400 leading-relaxed mb-4">
            Georgia Primary Care LLC dba Primary Clinic ("we," "our," or "us") respects your privacy and is committed to protecting the personal data of users accessing the NP Compass platform ("Service"). This Privacy Policy explains how we collect, use, store, and share your information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. Information We Collect</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong>Information You Provide:</strong>
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500 mb-4">
            <li><strong>Account Data:</strong> Name, email address, professional title, and authentication credentials (handled via Google Sign-In or Firebase Authentication).</li>
            <li><strong>Professional Profile Data:</strong> State nursing licenses, DEA numbers, compact statuses, expiration dates, and CEU records.</li>
            <li><strong>Uploaded Documents:</strong> Certifications, malpractice policies, correspondence, and collaborative agreements uploaded to our secure vault.</li>
            <li><strong>Support Communications:</strong> Content of emails or messages sent to our support team.</li>
          </ul>
          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong>Information Automatically Collected:</strong>
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500">
            <li><strong>Usage Data:</strong> Pages visited, features used, and time spent on the platform.</li>
            <li><strong>Device & Technical Data:</strong> IP address, browser type, operating system, and device identifiers collected through analytics tools.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500">
            <li>To provide, maintain, and improve the Service.</li>
            <li>To track your licensure expiration dates and send automated renewal reminders.</li>
            <li>To securely store and retrieve your uploaded professional documents.</li>
            <li>To process subscriptions and billing (handled securely by Paddle).</li>
            <li>To provide customer support and respond to inquiries.</li>
            <li>To analyze platform usage trends and optimize the user experience.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Third-Party Service Providers</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            We use trusted third-party services to operate our platform securely. These providers are bound by strict data processing agreements:
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500">
            <li><strong>Google Firebase:</strong> Used for secure user authentication, database hosting, and secure encrypted document storage.</li>
            <li><strong>Paddle:</strong> Used for subscription management and secure payment processing. We do not store or process your credit card information on our servers.</li>
            <li><strong>Analytics:</strong> Standard SaaS analytics providers to understand aggregated usage patterns.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Data Security</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            We implement industry-standard security measures to protect your data, including encryption in transit (HTTPS/TLS) and encryption at rest. Uploaded documents are stored in secure cloud buckets with strict access control rules, ensuring they are only accessible to your authenticated account.
          </p>
          <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <p className="text-indigo-200/90 font-medium m-0">
              <strong className="text-indigo-400">PHI Warning:</strong> NP Compass is designed for <em>provider credentialing</em>, not patient data. Do not upload documents containing Protected Health Information (PHI) subject to HIPAA regulations.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Cookies and Tracking</h2>
          <p className="text-zinc-400 leading-relaxed">
            We use cookies and local storage to maintain your authenticated session, remember your preferences, and track aggregate analytics. You can control cookie preferences through your browser settings, though disabling core session cookies will prevent you from logging into the platform.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Your Rights</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 marker:text-indigo-500">
            <li>Access the personal data we hold about you.</li>
            <li>Request corrections to inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt-out of marketing communications.</li>
          </ul>
          <p className="text-zinc-400 leading-relaxed mt-4">
            To exercise these rights, please contact our support team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Contact Us</h2>
          <p className="text-zinc-400 leading-relaxed">
            If you have questions about this Privacy Policy or how we handle your data, please contact us:<br />
            <strong>Email:</strong> <a href="mailto:support@npcompass.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@npcompass.app</a><br />
            <strong>Mail:</strong> Georgia Primary Care LLC dba Primary Clinic, 1611 S. Utica Ave #101, Tulsa, OK 74104
          </p>
        </section>
      </div>
    </div>
  );
}
