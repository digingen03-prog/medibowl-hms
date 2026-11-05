'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { RiLogoutBoxRLine, RiMenu2Line } from 'react-icons/ri';
import { Button } from '../ui/button';

interface TopHeaderProps {
  onMenuToggle?: () => void;
}

export function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 h-14 sm:h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Menu Hamburger */}
        {onMenuToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden -ml-1 text-slate-600 hover:text-slate-900"
            aria-label="Open navigation menu"
          >
            <RiMenu2Line className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate">
            Metro Care Clinical Operations
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200/80 shadow-2xs shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block min-w-0 max-w-[150px]">
            <div className="text-xs font-semibold text-slate-900 leading-none truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          leftIcon={<RiLogoutBoxRLine className="text-slate-500" />}
          title="Sign Out"
        >
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
