'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { IconType } from 'react-icons';
import {
  RiDashboardLine,
  RiUserAddLine,
  RiGroupLine,
  RiTeamLine,
  RiUserHeartLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiHistoryLine,
  RiFileChartLine,
  RiSettings4Line,
  RiPulseLine,
  RiCloseLine,
} from 'react-icons/ri';
import { Button } from '../ui/button';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Escape key handler and body scroll lock for mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onMobileClose]);

  if (!user) return null;

  const role = user.role;
  const navItems: { label: string; href: string; icon: IconType | React.ComponentType<{ className?: string }> }[] = [];

  if (role === 'RECEPTIONIST') {
    navItems.push(
      { label: 'Overview', href: '/receptionist/dashboard', icon: RiDashboardLine },
      { label: 'Register Patient', href: '/receptionist/register-patient', icon: RiUserAddLine },
      { label: 'Live Queue', href: '/receptionist/queue', icon: RiTimeLine },
      { label: 'Patient Directory', href: '/receptionist/patients', icon: RiGroupLine },
    );
  } else if (role === 'DOCTOR') {
    navItems.push(
      { label: 'Consultation Desk', href: '/doctor/dashboard', icon: RiDashboardLine },
      { label: 'Waiting Queue', href: '/doctor/queue', icon: RiTimeLine },
    );
  } else if (role === 'DOCTOR_ASSISTANT') {
    navItems.push(
      { label: 'Billing Desk', href: '/doctor-assistant/dashboard', icon: RiDashboardLine },
      { label: 'Consulted Patients', href: '/doctor-assistant/consulted-patients', icon: RiCheckboxCircleLine },
    );
  } else if (role === 'ADMIN') {
    navItems.push(
      { label: 'Overview', href: '/admin/dashboard', icon: RiDashboardLine },
      { label: 'Staff Management', href: '/admin/users', icon: RiTeamLine },
      { label: 'Doctor Profiles', href: '/admin/doctors', icon: RiStethoscopeLine },
      { label: 'Patients Archive', href: '/admin/patients', icon: RiUserHeartLine },
      { label: 'Visits & Audits', href: '/admin/visits', icon: RiHistoryLine },
      { label: 'Financial Reports', href: '/admin/reports', icon: RiFileChartLine },
      { label: 'Settings', href: '/admin/settings', icon: RiSettings4Line },
    );
  }

  const renderNavContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-base tracking-tight leading-none truncate">
            HMS Clinical
          </div>
          <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase mt-1">
            Healthcare OS
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobile && onMobileClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="-mr-1 text-slate-400 hover:text-slate-700"
            aria-label="Close navigation drawer"
          >
            <RiCloseLine className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Role Pill Banner */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 capitalize truncate">
            {role.toLowerCase().replace('_', ' ')}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded">
          Active
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' &&
              item.href !== '/receptionist/dashboard' &&
              item.href !== '/doctor/dashboard' &&
              item.href !== '/doctor-assistant/dashboard' &&
              pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) onMobileClose?.();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-0 ${
                isActive
                  ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-2xs border border-blue-200/60 -translate-r-0.5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <RiPulseLine className="w-3.5 h-3.5 text-emerald-500" />
          Online
        </span>
        <span className="font-mono text-[10px] text-slate-400">v1.0 MVP</span>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar (Preserved exactly for >= 1024px) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/90 flex-col h-screen select-none">
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile / Tablet Slide-out Drawer (< 1024px) */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onMobileClose}
        />

        {/* Slide-out Drawer Panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderNavContent(true)}
        </aside>
      </div>
    </>
  );
}
