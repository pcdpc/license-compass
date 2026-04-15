'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LicenseForm } from '@/components/forms/LicenseForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { StateLicense } from '@/types/schema';
// import { useAuth } from '@/context/AuthContext';
// import { createLicense } from '@/lib/firestore';

export default function AddLicensePage() {
  const router = useRouter();
  // const { user } = useAuth();

  const handleSubmit = async (data: Partial<StateLicense>) => {
    // When Firebase is connected:
    // if (!user) return;
    // await createLicense(user.uid, data as any);
    
    // For now, just navigate back
    console.log('License data to save:', data);
    router.push('/licenses');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link href="/licenses" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 font-medium mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Licenses
        </Link>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Add State License</h1>
        <p className="text-zinc-400 mt-2 font-medium">Configure the license details for a new state.</p>
      </div>

      <LicenseForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/licenses')}
      />
    </div>
  );
}
