'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ShieldCheck,
  Briefcase,
  Info,
  Zap,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PendingApproval } from '@/components/auth/PendingApproval';
import GlobalFooter from '@/components/layout/GlobalFooter';
import { hasPremiumAccess } from '@/lib/billing';
import { SubscriptionLocked } from '@/components/billing/SubscriptionLocked';
import { toDate } from '@/lib/firestore';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = React.useState(false);

  const publicRoutes = ['/login', '/terms', '/privacy', '/support', '/contact', '/refund-policy', '/pricing'];
  const billingRoutes = ['/billing', '/billing/success', '/pricing'];

  // Redirect to login if not authenticated and not on a public route
  React.useEffect(() => {
    if (!authLoading && !userProfile && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
    // Reset sign out loading state if we are authenticated
    if (userProfile) {
      setIsSignOutLoading(false);
    }
  }, [userProfile, authLoading, pathname, router]);

  // 1. Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // 2. If rendering public page, bypass layout but include footer
  if (publicRoutes.includes(pathname)) {
    return (
      <div className="flex flex-col min-h-screen min-h-[100dvh] bg-[#050505] selection:bg-indigo-500/30">
        <div className="flex-grow flex flex-col">
          {children}
        </div>
        <GlobalFooter />
      </div>
    );
  }

  // 3. Block non-active users (unless they are super-admin bootstrap)
  const isActive = userProfile?.status === 'active' || userProfile?.role === 'admin';
  
  if (userProfile && !isActive) {
    return <PendingApproval />;
  }

  // 4. Block users without a valid premium subscription (or active trial)
  // EXCEPT if they are actively trying to access the billing or pricing pages to upgrade
  if (userProfile && !hasPremiumAccess(userProfile) && !billingRoutes.includes(pathname)) {
    return <SubscriptionLocked />;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Licenses', href: '/licenses', icon: Map },
    { name: 'CEUs', href: '/ceus', icon: Award },
    { name: 'Documents', href: '/documents', icon: Files },
    { name: 'Career Hub', href: '/career-hub', icon: Briefcase },
    { name: 'How It Works', href: '/how-it-works', icon: Info },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ name: 'Admin', href: '/admin', icon: ShieldCheck });
  }

  const renderSubscriptionStatus = () => {
    if (!userProfile || !user || userProfile.role === 'admin') return null;

    const status = userProfile.subscriptionStatus || 'none';
    const accStatus = userProfile.accountStatus || 'none';
    const isSuspended = userProfile.paymentSuspended === true || accStatus === 'suspended' || status === 'past_due';

    const handleUpgrade = () => {
      const checkoutLink = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_LINK || "https://buy.polar.sh/polar_cl_FtrsjM8NxMdhweCK3jqQkQfyBGnZEgwdLxQNO3mYKcT";
      let url = checkoutLink;
      if (user.email) {
        url += `?customer_email=${encodeURIComponent(user.email)}&metadata[firebaseUid]=${user.uid}&metadata[source]=dashboard_sidebar`;
      }
      window.location.href = url;
    };

    if (isSuspended) {
      return (
        <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-widest">
            <span>Suspended</span>
          </div>
          <p className="text-[10px] text-rose-300 font-medium">Payment issue detected.</p>
          <button 
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold rounded-lg hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" /> Upgrade Now
          </button>
        </div>
      );
    }

    const isActive = status === 'active' || accStatus === 'active';
    const isTrialing = status === 'trialing' || accStatus === 'trial' || accStatus === 'trialing';

    let endDate = null;
    if (isTrialing && userProfile.trialEndDate) {
      endDate = toDate(userProfile.trialEndDate);
    } else if (isActive && userProfile.currentPeriodEnd) {
      endDate = toDate(userProfile.currentPeriodEnd);
    } else if ((status === 'canceled' || accStatus === 'canceled') && userProfile.currentPeriodEnd) {
      endDate = toDate(userProfile.currentPeriodEnd);
    }

    let daysLeft: number | null = null;
    if (endDate) {
      const diff = endDate.getTime() - Date.now();
      daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    if (isTrialing) {
      const isExpired = endDate ? endDate < new Date() : false;
      return (
        <div className="mb-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase tracking-widest">
            <span>{isExpired ? 'Trial Expired' : 'Free Trial'}</span>
            {daysLeft !== null && <span>{daysLeft > 0 ? `${daysLeft} Days` : 'Ends Today'}</span>}
          </div>
          <button 
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-[10px] font-bold rounded-lg hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" /> Upgrade Now
          </button>
        </div>
      );
    }

    if (isActive) {
      return (
        <div className="mb-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <span>Pro Plan</span>
            {daysLeft !== null && <span>{daysLeft} Days</span>}
          </div>
          <button 
            onClick={() => router.push('/billing')}
            className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest"
          >
            Manage Billing
          </button>
        </div>
      );
    }

    if (status === 'canceled' || accStatus === 'canceled') {
      const isPast = endDate ? endDate < new Date() : true;
      return (
        <div className={`mb-3 p-3 ${isPast ? 'bg-zinc-500/10 border-zinc-500/20' : 'bg-amber-500/10 border-amber-500/20'} rounded-xl space-y-2`}>
          <div className={`flex items-center justify-between ${isPast ? 'text-zinc-400' : 'text-amber-400'} text-xs font-bold uppercase tracking-widest`}>
            <span>{isPast ? 'Canceled' : 'Ending Soon'}</span>
            {daysLeft !== null && !isPast && <span>{daysLeft} Days</span>}
          </div>
          <button 
            onClick={() => router.push('/billing')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold rounded-lg hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" /> Renew Plan
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-transparent">
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
          <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center group/brand">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50 relative group-hover/brand:scale-105 transition-transform">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight text-glow group-hover/brand:from-white group-hover/brand:to-zinc-300 transition-all">NP Compass</span>
            </Link>
            <button 
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-white/10 transition-colors"
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
            {renderSubscriptionStatus()}
            <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
              <div className="flex-auto min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {userProfile?.displayName || 'Loading...'}
                </p>
                <p className="text-xs text-zinc-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setIsSignOutLoading(true);
                try {
                  await signOut();
                  router.push('/login');
                } catch (error) {
                  console.error('Sign out error:', error);
                  setIsSignOutLoading(false);
                }
              }}
              disabled={isSignOutLoading}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/30 hover:shadow-[0_0_10px_rgba(244,63,94,0.1)] transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-50"
            >
              {isSignOutLoading ? (
                <div className="w-5 h-5 mr-3 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
              ) : (
                <LogOut className="w-5 h-5 mr-3 group-hover:text-rose-400 transition-colors" />
              )}
              {isSignOutLoading ? 'Signing out...' : 'Sign Out'}
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
          <Link href="/" className="flex items-center px-4">
             <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 text-glow">NP Compass</span>
          </Link>
        </div>
        
        <main className="flex-1 overflow-y-scroll focus:outline-none scroll-smooth flex flex-col relative z-0">
          <div className="px-4 py-8 mx-auto w-full max-w-7xl sm:px-6 md:px-8">
            {children}
          </div>
          <GlobalFooter />
        </main>
      </div>
    </div>
  );
};
