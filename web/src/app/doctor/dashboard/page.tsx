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
  RiTimeLine,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiStethoscopeLine,
} from 'react-icons/ri';

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState({
    waitingCount: 0,
    consultedCount: 0,
    todayTotal: 0,
  });
  const [waitingVisits, setWaitingVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, queueRes] = await Promise.all([
        api.get('/queue/stats/doctor'),
        api.get('/queue/waiting'),
      ]);
      setStats(statsRes);
      setWaitingVisits(queueRes || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RoleLayout allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Doctor Consultation Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Live consultation queue monitor and patient call dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={isLoading}
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Link href="/doctor/queue">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RiTimeLine />}
              >
                Open Consultation Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Metrics required by Master Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Waiting Patients"
            value={stats.waitingCount}
            subtitle="Patients waiting outside"
            icon={RiTimeLine}
            color="amber"
          />
          <StatCard
            title="Consulted Patients"
            value={stats.consultedCount}
            subtitle="Concluded consultations"
            icon={RiCheckboxCircleLine}
            color="blue"
          />
          <StatCard
            title="Today's Patient Count"
            value={stats.todayTotal}
            subtitle="Total assigned to your room"
            icon={RiGroupLine}
            color="green"
          />
        </div>

        {/* Active Waiting List Preview */}
        <Card
          title="Current Waiting Patients"
          subtitle="Patients queued for clinical consultation"
          action={
            <Link href="/doctor/queue">
              <Button variant="outline" size="sm" rightIcon={<RiArrowRightLine />}>
                Full Queue View
              </Button>
            </Link>
          }
        >
          {waitingVisits.length === 0 ? (
            <EmptyState
              icon={RiTimeLine}
              title="Queue is Clear"
              description="No patients are currently waiting in your consultation queue. New registrations by reception will appear automatically."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Token #</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Age / Gender</th>
                    <th className="pb-3">Registered Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waitingVisits.slice(0, 5).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm tabular-nums">
                          #{v.queueNumber}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {v.patient?.fullName}
                        <span className="block text-xs text-slate-400 font-normal font-mono">
                          {v.visitNumber}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 text-xs tabular-nums">
                        {v.patient?.age} yrs • {v.patient?.gender}
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs tabular-nums">
                        {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <Link href="/doctor/queue">
                          <Button variant="primary" size="sm" rightIcon={<RiArrowRightLine />}>
                            Consult
                          </Button>
                        </Link>
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
