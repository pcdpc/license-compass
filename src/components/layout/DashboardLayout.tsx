'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Award, 
  Files, 
  Settings, 
  LogOut,
  Menu,
  X,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // If rendering auth/login page, don't show dashboard sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Licenses', href: '/licenses', icon: Map },
    { name: 'CEUs', href: '/ceus', icon: Award },
    { name: 'Documents', href: '/documents', icon: Files },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ name: 'Admin', href: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen bg-transparent">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:my-4 md:mx-4 md:rounded-2xl md:border md:border-white/10 md:h-[calc(100vh-2rem)] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center justify-center h-20 px-4 border-b border-white/10">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50 relative">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight text-glow">License Compass</span>
            <button 
              className="md:hidden ml-auto p-2 rounded-lg text-zinc-400 hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] border border-white/10'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 hover:-translate-y-[1px] border border-transparent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors duration-300 ${
                    isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
              <div className="flex-auto min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {userProfile?.displayName || 'Loading...'}
                </p>
                <p className="text-xs text-zinc-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/30 hover:shadow-[0_0_10px_rgba(244,63,94,0.1)] transition-all duration-300 hover:-translate-y-[1px]"
            >
              <LogOut className="w-5 h-5 mr-3 group-hover:text-rose-400 transition-colors" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full min-w-0 md:pl-2 relative z-0">
        <div className="sticky top-0 z-10 flex items-center h-16 glass-panel border-b border-white/10 md:hidden">
          <button
            type="button"
            className="px-4 text-zinc-400 focus:outline-none hover:text-indigo-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center px-4">
             <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 text-glow">License Compass</span>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
