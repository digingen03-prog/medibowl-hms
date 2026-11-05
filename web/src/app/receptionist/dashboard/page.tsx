'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/layout/role-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit } from '@/lib/types';
import {
  RiGroupLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCheckDoubleLine,
  RiUserAddLine,
  RiArrowRightLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function ReceptionistDashboardPage() {
  const [stats, setStats] = useState({
    todayRegistered: 0,
    waitingCount: 0,
    consultedCount: 0,
    completedToday: 0,
  });
  const [recentVisits, setRecentVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, visitsData] = await Promise.all([
        api.get('/queue/stats/receptionist'),
        api.get('/visits?limit=5'),
      ]);
      setStats(statsData);
      setRecentVisits(visitsData.data || []);
    } catch (err) {
      console.error('Failed to load receptionist dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RoleLayout allowedRoles={['RECEPTIONIST', 'ADMIN']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              Receptionist Desk
            </h1>
            <p className="text-sm text-slate-500 font-normal mt-1">
              Patient intake, mobile check, queue scheduling, and consultation tokens
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={isLoading}
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Link href="/receptionist/register-patient">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RiUserAddLine />}
              >
                Register New Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Metrics with tabular-nums */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Today"
            value={stats.todayRegistered}
            subtitle="Walk-in consultations"
            icon={RiGroupLine}
            color="blue"
          />
          <StatCard
            title="Currently Waiting"
            value={stats.waitingCount}
            subtitle="In doctors' queues"
            icon={RiTimeLine}
            color="amber"
          />
          <StatCard
            title="Marked Consulted"
            value={stats.consultedCount}
            subtitle="Awaiting billing"
            icon={RiCheckboxCircleLine}
            color="blue"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            subtitle="Fully settled visits"
            icon={RiCheckDoubleLine}
            color="green"
          />
        </div>

        {/* Quick Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 border border-blue-100">
                <RiUserAddLine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Patient Intake & Registration</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                Register returning or walk-in patients, automatically check mobile duplicate records, assign clinical doctor, and issue live queue token.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/receptionist/register-patient">
                <Button variant="primary" size="sm" rightIcon={<RiArrowRightLine />}>
                  Open Registration Form
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5 border border-amber-100">
                <RiTimeLine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Live Consultation Queue</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                Monitor waiting patients in real-time across consultation rooms. View registration timestamps and live progression to Consulted status.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/receptionist/queue">
                <Button variant="outline" size="sm" rightIcon={<RiArrowRightLine />}>
                  View Full Live Queue
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <Card
          title="Recent Patient Registrations"
          subtitle="Latest consultations added to the live hospital system"
          action={
            <Link href="/receptionist/queue">
              <Button variant="outline" size="sm" rightIcon={<RiArrowRightLine />}>
                Live Queue View
              </Button>
            </Link>
          }
        >
          {recentVisits.length === 0 ? (
            <EmptyState
              icon={RiGroupLine}
              title="No Patient Registrations Today"
              description="Click 'Register New Patient' above to intake your first patient of the day."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Queue #</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Age / Gender</th>
                    <th className="pb-3">Assigned Doctor</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm tabular-nums">
                          #{v.queueNumber}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {v.patient?.fullName}
                        <span className="block text-xs font-mono font-normal text-slate-400">
                          {v.visitNumber}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 text-xs tabular-nums">
                        {v.patient?.age} yrs • {v.patient?.gender}
                      </td>
                      <td className="py-3.5 text-slate-700 text-xs">
                        Dr. {v.doctor?.user?.name}
                        <span className="block text-slate-400 font-normal">
                          {v.doctor?.specialization}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs tabular-nums">
                        {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="py-3.5 font-bold text-emerald-700 text-right tabular-nums">
                        ₹{Number(v.finalFee || v.consultationFee).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
