'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import {
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiErrorWarningLine,
  RiLock2Line,
  RiShieldCheckLine,
  RiPulseLine,
  RiTimeLine,
  RiFlashlightLine,
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(emailOrUsername, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your staff credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* ========================================================= */}
      {/* LEFT SIDE: Visual Showcase & Brand Imagery (>= 1024px)     */}
      {/* ========================================================= */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-7/12 bg-slate-900 min-h-screen flex-col justify-between p-10 xl:p-14 overflow-hidden select-none">
        {/* Background Photograph */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hospital-hero.jpg"
            alt="Modern Hospital Facility"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center scale-105 transform motion-safe:transition-transform duration-1000 ease-out"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/80" />
        </div>

        {/* Top: Logo & System Indicator */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur-md flex items-center justify-center border border-white/20">
              <Image
                src="/logos/medibowl-emblem.svg"
                alt="Medibowl Emblem"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">Medibowl HMS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  CLINICAL OS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Enterprise Healthcare Workstation</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            System Live & Ready
          </div>
        </div>

        {/* Center / Bottom: Editorial & Feature Highlights */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-medium mb-6">
            <RiPulseLine className="w-3.5 h-3.5 text-blue-400" />
            Synchronized Outpatient & Queue Operations
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Streamlining patient journeys from intake to consultation.
          </h2>

          <p className="mt-4 text-sm xl:text-base text-slate-300/90 leading-relaxed font-normal">
            A high-precision clinical workflow engine managing daily sequential queues, doctor consultations, and instant fee settlements.
          </p>

          {/* Quick Pillar Cards */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                <RiTimeLine className="w-4 h-4" />
                Live Queues
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-normal">
                Instant queue tokens & deduplicated walk-ins
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <RiFlashlightLine className="w-4 h-4" />
                Fast Handover
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-normal">
                Single-click doctor consults & assistant billing
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <RiShieldCheckLine className="w-4 h-4" />
                NABH Audited
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-normal">
                Immutable audit trails & financial decimals
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Security / Copyright Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span>Central Medical District Network</span>
          <span className="font-mono text-slate-300">Protected Workspace • v1.0.0</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Centered Clean Modern Authentication Console   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 min-h-screen bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-14 xl:p-16">
        {/* Mobile Header Branding (< 1024px) */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-2 shadow-xs flex items-center justify-center">
              <Image
                src="/logos/medibowl-emblem.svg"
                alt="Medibowl Emblem"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none block">
                Medibowl HMS
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 inline-block">
                Clinical OS
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>

        {/* Centered Form Wrapper */}
        <div className="my-auto w-full max-w-sm sm:max-w-md mx-auto py-8">
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Staff Access Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to workstation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal leading-relaxed">
              Enter your authorized hospital credentials to access your role-based dashboard.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mt-5 bg-rose-50 border border-rose-200/90 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <RiErrorWarningLine className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4 sm:space-y-5">
            {/* Email or Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <RiMailLine className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="staff@hospital.com or username"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 shadow-2xs font-normal transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <RiLockPasswordLine className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 shadow-2xs font-normal transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-1.5 my-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-4 h-4 text-slate-600" />
                  ) : (
                    <RiEyeLine className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              rightIcon={<RiArrowRightLine />}
              className="w-full py-3 text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Sign In to Workstation
            </Button>
          </form>

          {/* Help note */}
          <div className="mt-6 text-center text-xs text-slate-400 font-normal">
            Need account access or password reset? Contact your{' '}
            <span className="font-semibold text-slate-600">Hospital IT Admin</span>.
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <RiLock2Line className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>256-bit Encrypted Session • NABH & HIPAA Healthcare Standard</span>
        </div>
      </div>
    </div>
  );
}
