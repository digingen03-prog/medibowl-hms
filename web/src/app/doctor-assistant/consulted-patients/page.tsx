'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit } from '@/lib/types';
import {
  RiCheckboxCircleLine,
  RiSearch2Line,
  RiRefreshLine,
  RiArrowRightLine,
  RiBankCardLine,
  RiTimeLine,
} from 'react-icons/ri';

export default function ConsultedPatientsPage() {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadList = async () => {
    setIsLoading(true);
    try {
      const endpoint = search.trim()
        ? `/assistant/consulted-patients?search=${encodeURIComponent(search.trim())}`
        : '/assistant/consulted-patients';
      const data = await api.get<PatientVisit[]>(endpoint);
      setVisits(data || []);
    } catch (err) {
      console.error('Failed to load consulted patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    const interval = setInterval(loadList, 10000);
    return () => clearInterval(interval);
  }, [search]);

  return (
    <RoleLayout allowedRoles={['DOCTOR_ASSISTANT', 'ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Consulted Patients Queue</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active consultations concluded by doctors. Select a patient to adjust fees, record payment, and complete the visit.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadList}
            isLoading={isLoading}
            leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh List
          </Button>
        </div>

        {/* Search */}
        <Card className="p-3.5 sm:p-4!">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <RiSearch2Line className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name, mobile, visit number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 min-h-[42px] sm:min-h-0"
            />
          </div>
        </Card>

        {/* Table / Cards */}
        <Card title={`Consulted Patients Ready for Payment (${visits.length})`}>
          {visits.length === 0 ? (
            <EmptyState
              icon={RiCheckboxCircleLine}
              title="No Pending Consultations"
              description="Patients marked as 'Consulted' by doctors will appear here immediately for fee collection."
            />
          ) : (
            <>
              {/* 1. Mobile Cards (< 768px) */}
              <div className="md:hidden space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                          {visit.visitNumber}
                        </span>
                        <span className="text-slate-400 text-xs ml-2 tabular-nums">
                          #{visit.queueNumber}
                        </span>
                      </div>
                      <StatusBadge status={visit.status} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{visit.patient?.fullName}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 tabular-nums">
                        {visit.patient?.age} yrs • {visit.patient?.gender} • {visit.patient?.mobileNumber}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Doctor: Dr. {visit.doctor?.user?.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Consultation Fee</span>
                        <span className="font-black text-emerald-700 text-lg tabular-nums">
                          ₹{Number(visit.finalFee || visit.consultationFee).toFixed(2)}
                        </span>
                      </div>
                      <Link href={`/doctor-assistant/patients/${visit.id}`}>
                        <Button
                          variant="primary"
                          size="md"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-h-[44px] shadow-xs active:scale-[0.98]"
                        >
                          <RiBankCardLine className="w-4 h-4 mr-1.5" />
                          Collect Fee & Finish
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Desktop Data Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3">Visit #</th>
                      <th className="pb-3">Queue #</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Attending Doctor</th>
                      <th className="pb-3">Consulted At</th>
                      <th className="pb-3">Consultation Fee</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-mono text-xs font-bold text-slate-800 tabular-nums">
                          {visit.visitNumber}
                        </td>
                        <td className="py-4 font-black text-blue-600 text-base tabular-nums">
                          #{visit.queueNumber}
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-slate-900 block">
                            {visit.patient?.fullName}
                          </span>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {visit.patient?.age} yrs • {visit.patient?.gender} • {visit.patient?.mobileNumber}
                          </span>
                        </td>
                        <td className="py-4 text-slate-700">
                          Dr. {visit.doctor?.user?.name}
                          <span className="block text-xs text-slate-400">
                            {visit.doctor?.specialization}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-500 tabular-nums">
                          {visit.consultedAt
                            ? new Date(visit.consultedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </td>
                        <td className="py-4">
                          <span className="font-black text-emerald-700 text-base tabular-nums">
                            ₹{Number(visit.finalFee || visit.consultationFee).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={visit.status} />
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          <Link href={`/doctor-assistant/patients/${visit.id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<RiBankCardLine />}
                            >
                              Collect Fee & Finish
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
