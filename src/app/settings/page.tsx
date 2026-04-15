'use client';

import { Settings as SettingsIcon, Bell, Clock, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { userProfile } = useAuth();

  const settingsSections = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Email alerts for expirations and renewals',
      value: userProfile?.settings?.emailNotifications ? 'Enabled' : 'Disabled',
    },
    {
      icon: Clock,
      title: 'Reminder Schedule',
      description: 'Days before expiration to send reminders',
      value: userProfile?.settings?.reminderDays?.join(', ') + ' days' || '180, 90 days',
    },
    {
      icon: Globe,
      title: 'Timezone',
      description: 'Your local timezone for date calculations',
      value: userProfile?.settings?.timezone || 'America/New_York',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
            {userProfile?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{userProfile?.displayName || 'User'}</h2>
            <p className="text-sm text-zinc-400 font-medium">{userProfile?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {settingsSections.map((section, idx) => (
          <div
            key={section.title}
            className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group ${
              idx !== settingsSections.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:border-white/20 transition-colors">
                <section.icon className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-200">{section.title}</h3>
                <p className="text-xs text-zinc-500 font-medium">{section.description}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-400">{section.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
