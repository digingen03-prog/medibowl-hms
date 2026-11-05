'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  RiHospitalLine,
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiShieldUserLine,
  RiUserAddLine,
  RiStethoscopeLine,
  RiBankCardLine,
  RiPulseLine,
  RiErrorWarningLine,
  RiLock2Line,
  RiCheckLine,
  RiTimeLine,
  RiMoneyRupeeCircleLine,
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(emailOrUsername, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (roleKey: string, email: string) => {
    setSelectedRole(roleKey);
    setEmailOrUsername(email);
    setPassword('Password@123');
    setError(null);
  };

  const demoRoles = [
    {
      key: 'ADMIN',
      title: 'Administrator',
      scope: 'Full Governance & Reports',
      email: 'admin@hospital.com',
      icon: RiShieldUserLine,
      color: 'text-purple-600 bg-purple-50 border-purple-200/80',
    },
    {
      key: 'RECEPTIONIST',
      title: 'Receptionist',
      scope: 'Patient Intake & Token Queue',
      email: 'receptionist@hospital.com',
      icon: RiUserAddLine,
      color: 'text-blue-600 bg-blue-50 border-blue-200/80',
    },
    {
      key: 'DOCTOR',
      title: 'Doctor',
      scope: 'Consultation & Call Queue',
      email: 'doctor@hospital.com',
      icon: RiStethoscopeLine,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      key: 'DOCTOR_ASSISTANT',
      title: 'Doctor Assistant',
      scope: 'Fee Billing & Settlement',
      email: 'assistant@hospital.com',
      icon: RiBankCardLine,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Clinical OS Brand & Briefing (Desktop Only >= 1024px) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-slate-50 to-blue-50/30 p-8 xl:p-10 border-r border-slate-200/80 flex-col justify-between">
          <div>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <RiHospitalLine className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                  HMS Clinical
                </h2>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 inline-block">
                  Healthcare OS v1.0
                </span>
              </div>
            </div>

            {/* Core System Description */}
            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <RiPulseLine className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live Clinical Operations
              </div>
              <h3 className="text-xl xl:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                Unified Hospital Patient Flow & Fee Management
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Enterprise workstation designed for high-throughput OPD clinics, patient registration, live doctor queues, and consultation fee settlement.
              </p>
            </div>

            {/* Workflow Points */}
            <div className="mt-8 space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <RiUserAddLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">1. Reception Intake</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                    Quick patient check with mobile deduplication & queue token assignment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <RiTimeLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">2. Doctor Consultation</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                    Live waiting line monitor with single-click &quot;Consulted&quot; handover.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <RiMoneyRupeeCircleLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">3. Fee Settlement</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                    Assistant records payment (Cash/UPI/Card) and marks visit Completed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer District Info */}
          <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Metro Care Hospital Network</span>
            <span className="font-mono">Central Medical District</span>
          </div>
        </div>

        {/* Right Side: Authentication Console */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Header Branding (< 1024px) */}
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <RiHospitalLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base tracking-tight leading-none">
                  HMS Clinical
                </h2>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 inline-block">
                  Healthcare OS
                </span>
              </div>
            </div>

            {/* Console Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Staff Access Portal</span>
              </div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mt-1.5">
                Sign in to your workstation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Enter your credentials or choose a quick one-click role below.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
                <RiErrorWarningLine className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    value={emailOrUsername}
                    onChange={(e) => {
                      setEmailOrUsername(e.target.value);
                      setSelectedRole(null);
                    }}
                    placeholder="staff@hospital.com or username"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 shadow-2xs font-normal transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <RiLockPasswordLine className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedRole(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 shadow-2xs font-normal transition-colors"
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
                className="w-full mt-2"
              >
                Sign In to Workstation
              </Button>
            </form>

            {/* Quick One-Click Demo Access Cards */}
            <div className="mt-7 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <RiShieldCheckLine className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">One-Click Staff Accounts</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.key;

                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => fillDemo(role.key, role.email)}
                      className={`group p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer active:scale-[0.985] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${role.color}`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-800 group-hover:text-blue-600'}`}>
                            {role.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-normal mt-0.5">
                            {role.scope}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-in zoom-in-75 duration-150">
                          <RiCheckLine className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300 flex items-center justify-center shrink-0 transition-colors">
                          <RiArrowRightLine className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-3 font-normal">
                Default password for all staff: <span className="font-mono text-slate-700 font-semibold">Password@123</span>
              </p>
            </div>
          </div>

          {/* Security Compliance Banner */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <RiLock2Line className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Encrypted Healthcare Session • NABH & HIPAA Compliance Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
