'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/layout/role-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit } from '@/lib/types';
import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiMoneyRupeeCircleLine,
  RiCheckDoubleLine,
  RiBankCardLine,
  RiArrowRightLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function DoctorAssistantDashboardPage() {
  const [stats, setStats] = useState({
    totalConsulted: 0,
    feesPending: 0,
    feesCollectedToday: 0,
    completedVisitsToday: 0,
  });
  const [consultedVisits, setConsultedVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/assistant/dashboard'),
        api.get('/assistant/consulted-patients'),
      ]);
      setStats(statsRes);
      setConsultedVisits(listRes || []);
    } catch (err) {
      console.error('Failed to load doctor assistant dashboard:', err);
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
    <RoleLayout allowedRoles={['DOCTOR_ASSISTANT', 'ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Doctor Assistant Desk</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consultation fee billing, payment collection, and visit completion workflow
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={isLoading}
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Link href="/doctor-assistant/consulted-patients">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RiBankCardLine />}
              >
                View Consulted Patients
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metrics required by Master Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Consulted Patients"
            value={stats.totalConsulted}
            subtitle="Ready for fee collection"
            icon={RiCheckboxCircleLine}
            color="blue"
          />
          <StatCard
            title="Fees Pending"
            value={`₹${stats.feesPending.toFixed(2)}`}
            subtitle="Outstanding unpaid balance"
            icon={RiTimeLine}
            color="amber"
          />
          <StatCard
            title="Fees Collected Today"
            value={`₹${stats.feesCollectedToday.toFixed(2)}`}
            subtitle="Recorded collections today"
            icon={RiMoneyRupeeCircleLine}
            color="green"
          />
          <StatCard
            title="Completed Visits Today"
            value={stats.completedVisitsToday}
            subtitle="Concluded patient visits"
            icon={RiCheckDoubleLine}
            color="purple"
          />
        </div>

        {/* Actionable Consulted Patients Section */}
        <Card
          title="Patients Awaiting Fee Collection"
          subtitle="Consultation concluded by doctor; ready for payment processing"
          action={
            <Link href="/doctor-assistant/consulted-patients">
              <Button variant="outline" size="sm" rightIcon={<RiArrowRightLine />}>
                All Consulted Patients
              </Button>
            </Link>
          }
        >
          {consultedVisits.length === 0 ? (
            <EmptyState
              icon={RiCheckboxCircleLine}
              title="All Consulted Patients Settled"
              description="No patients are currently waiting for fee collection. Patients marked as Consulted by doctors will appear here automatically."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Queue #</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Attending Doctor</th>
                    <th className="pb-3">Consulted At</th>
                    <th className="pb-3">Consultation Fee</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consultedVisits.slice(0, 5).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 font-black text-blue-600 text-base tabular-nums">
                        #{v.queueNumber}
                      </td>
                      <td className="py-4 font-bold text-slate-900">
                        {v.patient?.fullName}
                        <span className="block text-xs font-mono font-normal text-slate-400">
                          {v.visitNumber}
                        </span>
                      </td>
                      <td className="py-4 text-slate-700">
                        Dr. {v.doctor?.user?.name}
                        <span className="block text-xs text-slate-400">
                          {v.doctor?.specialization}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500 tabular-nums">
                        {v.consultedAt
                          ? new Date(v.consultedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </td>
                      <td className="py-4 font-bold text-emerald-700 text-base tabular-nums">
                        ₹{Number(v.finalFee || v.consultationFee).toFixed(2)}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <Link href={`/doctor-assistant/patients/${v.id}`}>
                          <Button variant="primary" size="sm" rightIcon={<RiArrowRightLine />}>
                            Collect Fee
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
