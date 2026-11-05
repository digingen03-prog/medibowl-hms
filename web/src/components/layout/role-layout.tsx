'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, getRoleDashboardPath } from '@/lib/auth-context';
import { Role } from '@/lib/types';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';

interface RoleLayoutProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleLayout({ allowedRoles, children }: RoleLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!allowedRoles.includes(user.role)) {
        router.push(getRoleDashboardPath(user.role));
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Initializing Clinical Workspace...
        </p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full overflow-x-hidden">
      {/* Desktop Fixed Sidebar and Mobile Slide-out Drawer */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area: pl-0 on mobile, lg:pl-64 on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <TopHeader onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
