'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit } from '@/lib/types';
import {
  RiTimeLine,
  RiSearch2Line,
  RiFilter3Line,
  RiRefreshLine,
  RiCalendarEventLine,
} from 'react-icons/ri';

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadVisits = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/visits?limit=100';
      if (statusFilter !== 'ALL') endpoint += `&status=${statusFilter}`;
      if (search.trim()) endpoint += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(endpoint);
      setVisits(res.data || []);
    } catch (err) {
      console.error('Failed to load visits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, [statusFilter, search]);

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Visit Management & Audit</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit all clinical patient visits across Waiting, Consulted, Completed, and Cancelled states
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadVisits}
            isLoading={isLoading}
            leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>

        {/* Filter bar */}
        <Card className="p-3.5 sm:p-4!">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiSearch2Line className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search patient, visit #, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 min-h-[42px] sm:min-h-0"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">All Visits</option>
                <option value="WAITING">Waiting</option>
                <option value="CONSULTED">Consulted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Visits table */}
        <Card title={`Visits Log (${visits.length})`}>
          {visits.length === 0 ? (
            <EmptyState
              icon={RiCalendarEventLine}
              title="No Visits Found"
              description="No patient visits match the selected filter or search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Queue #</th>
                    <th className="pb-3">Visit Number</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Assigned Doctor</th>
                    <th className="pb-3">Registration Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Fee (₹)</th>
                    <th className="pb-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs tabular-nums">
                          {v.queueNumber}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs font-bold text-blue-600 tabular-nums">
                        {v.visitNumber}
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {v.patient?.fullName}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          {v.patient?.mobileNumber}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-700">
                        Dr. {v.doctor?.user?.name}
                        <span className="block text-slate-400 font-normal">
                          {v.doctor?.specialization}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-500 tabular-nums">
                        {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900 tabular-nums">
                        ₹{Number(v.finalFee || v.consultationFee).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            v.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {v.isPaid ? 'PAID' : 'PENDING'}
                        </span>
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
