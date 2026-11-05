'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/layout/role-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  RiGroupLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCheckDoubleLine,
  RiMoneyRupeeCircleLine,
  RiAlertLine,
  RiRefreshLine,
  RiStethoscopeLine,
  RiShieldCheckLine,
  RiFileChartLine,
  RiArrowRightLine,
  RiTeamLine,
} from 'react-icons/ri';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayRegistrations: 0,
    waitingPatients: 0,
    consultedPatients: 0,
    completedVisits: 0,
    totalFeesCollectedToday: 0,
    outstandingAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Hospital Operations Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Live hospital clinical flow, queue activity, doctor metrics, and revenue ledger
            </p>
          </div>

          {/* Quick Action Navigation Buttons in Top Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={loadStats}
              isLoading={isLoading}
              title="Refresh statistics"
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link href="/admin/users">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RiTeamLine />}
              >
                User Management
              </Button>
            </Link>
            <Link href="/admin/doctors">
              <Button
                variant="outline"
                size="md"
                leftIcon={<RiStethoscopeLine className="text-emerald-600" />}
              >
                Doctor Profiles & Fees
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button
                variant="outline"
                size="md"
                leftIcon={<RiFileChartLine className="text-blue-600" />}
              >
                Operational Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* 7 Required Metrics from Master Prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Registered Patients"
            value={stats.totalPatients}
            subtitle="Lifetime database records"
            icon={RiGroupLine}
            color="blue"
          />
          <StatCard
            title="Today's Registrations"
            value={stats.todayRegistrations}
            subtitle="New visits today"
            icon={RiCalendarEventLine}
            color="purple"
          />
          <StatCard
            title="Waiting Patients"
            value={stats.waitingPatients}
            subtitle="In doctors' queues"
            icon={RiTimeLine}
            color="amber"
          />
          <StatCard
            title="Consulted Patients"
            value={stats.consultedPatients}
            subtitle="Awaiting fee settlement"
            icon={RiCheckboxCircleLine}
            color="blue"
          />
          <StatCard
            title="Completed Visits"
            value={stats.completedVisits}
            subtitle="Fully settled lifetime visits"
            icon={RiCheckDoubleLine}
            color="green"
          />
          <StatCard
            title="Fees Collected Today"
            value={`₹${stats.totalFeesCollectedToday.toFixed(2)}`}
            subtitle="Received today"
            icon={RiMoneyRupeeCircleLine}
            color="green"
          />
          <StatCard
            title="Outstanding Amount"
            value={`₹${stats.outstandingAmount.toFixed(2)}`}
            subtitle="Unpaid pending balances"
            icon={RiAlertLine}
            color="amber"
          />
        </div>

        {/* Quick Management Navigation Cards with Distinct Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card hoverLift className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <RiShieldCheckLine className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">User Management</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Create and manage staff accounts: Receptionists, Doctors, Assistants, and Admins. Reset credentials and permissions.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/admin/users" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-between"
                  leftIcon={<RiTeamLine />}
                  rightIcon={<RiArrowRightLine />}
                >
                  Manage Users & Staff
                </Button>
              </Link>
            </div>
          </Card>

          <Card hoverLift className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <RiStethoscopeLine className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Doctor Profiles & Fees</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Configure clinical doctor specializations and manage baseline default consultation fees.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/admin/doctors" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-between"
                  leftIcon={<RiStethoscopeLine />}
                  rightIcon={<RiArrowRightLine />}
                >
                  Configure Doctor Profiles & Fees
                </Button>
              </Link>
            </div>
          </Card>

          <Card hoverLift className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <RiFileChartLine className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Operational Reports</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Generate daily registrations, doctor caseloads, completed visits, revenue receipts, and ledger audits.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/admin/reports" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-between"
                  leftIcon={<RiFileChartLine />}
                  rightIcon={<RiArrowRightLine />}
                >
                  Open Operational Reports
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}
