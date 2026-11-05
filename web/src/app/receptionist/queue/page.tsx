'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit, Doctor } from '@/lib/types';
import {
  RiTimeLine,
  RiSearch2Line,
  RiRefreshLine,
  RiFilter3Line,
  RiStethoscopeLine,
} from 'react-icons/ri';

export default function ReceptionistQueuePage() {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      setDoctors(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      let endpoint = `/visits?limit=50`;
      if (selectedDoctorId) endpoint += `&doctorId=${selectedDoctorId}`;
      if (statusFilter !== 'ALL') endpoint += `&status=${statusFilter}`;
      if (search.trim()) endpoint += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(endpoint);
      setVisits(res.data || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, [selectedDoctorId, statusFilter, search]);

  return (
    <RoleLayout allowedRoles={['RECEPTIONIST', 'ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Patient Queue Coordination
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Live monitor of patient progression across consultation rooms: Waiting → Consulted → Completed
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
            isLoading={isLoading}
            leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh Queue
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 sm:p-4!">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiSearch2Line className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search patient, mobile, visit #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 shadow-2xs font-normal min-h-[42px] sm:min-h-0"
              />
            </div>

            {/* Doctor & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <RiStethoscopeLine className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-700 shadow-2xs min-h-[40px] sm:min-h-0"
                >
                  <option value="">All Doctors</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <RiFilter3Line className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-700 shadow-2xs min-h-[40px] sm:min-h-0"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="WAITING">Waiting</option>
                  <option value="CONSULTED">Consulted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Queue Cards / Table */}
        <Card title={`Live Queue Roster (${visits.length})`}>
          {visits.length === 0 ? (
            <EmptyState
              icon={RiTimeLine}
              title="No Patient Visits Found"
              description="No active patients match the selected filter criteria."
            />
          ) : (
            <>
              {/* 1. Mobile Cards (< 768px) */}
              <div className="md:hidden space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 text-base tabular-nums">
                          #{visit.queueNumber}
                        </span>
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {visit.visitNumber}
                        </span>
                      </div>
                      <StatusBadge status={visit.status} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{visit.patient?.fullName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {visit.patient?.age} yrs • {visit.patient?.gender} • {visit.patient?.mobileNumber}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-600">
                        Dr. {visit.doctor?.user?.name}
                      </span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Desktop Data Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3">Queue #</th>
                      <th className="pb-3">Visit Number</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Age / Gender</th>
                      <th className="pb-3">Assigned Doctor</th>
                      <th className="pb-3">Registered Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Fee (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200/60 tabular-nums">
                            #{visit.queueNumber}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-xs font-bold text-slate-800 tabular-nums">
                          {visit.visitNumber}
                        </td>
                        <td className="py-3.5">
                          <span className="font-semibold text-slate-900 block">
                            {visit.patient?.fullName}
                          </span>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {visit.patient?.mobileNumber}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-slate-700 tabular-nums">
                          {visit.patient?.age} yrs / {visit.patient?.gender}
                        </td>
                        <td className="py-3.5 text-xs text-slate-800">
                          Dr. {visit.doctor?.user?.name}
                          <span className="block text-slate-400 font-normal">
                            {visit.doctor?.specialization}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-slate-500 tabular-nums">
                          {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={visit.status} size="sm" />
                        </td>
                        <td className="py-3.5 font-bold text-emerald-700 text-right tabular-nums">
                          ₹{Number(visit.finalFee || visit.consultationFee).toFixed(2)}
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
