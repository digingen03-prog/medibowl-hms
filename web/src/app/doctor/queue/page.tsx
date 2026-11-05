'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { PatientVisit } from '@/lib/types';
import {
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiUserFollowLine,
} from 'react-icons/ri';

export default function DoctorQueuePage() {
  const [waitingVisits, setWaitingVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consultingId, setConsultingId] = useState<string | null>(null);
  const [confirmVisit, setConfirmVisit] = useState<PatientVisit | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<PatientVisit[]>('/queue/waiting');
      setWaitingVisits(data || []);
    } catch (err: any) {
      console.error('Failed to load waiting queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const calculateWaitingTime = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const handleMarkConsulted = async (visit: PatientVisit) => {
    setConsultingId(visit.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.post(`/visits/${visit.id}/consulted`);
      setSuccessMessage(`Patient ${visit.patient.fullName} (Token #${visit.queueNumber}) marked as Consulted and forwarded to Assistant!`);
      setConfirmVisit(null);
      await loadQueue();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark patient as consulted');
    } finally {
      setConsultingId(null);
    }
  };

  return (
    <RoleLayout allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Doctor Waiting Queue</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active patient consultation line. Tap &quot;Consulted&quot; to conclude consultation and forward for billing.
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

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
            <RiErrorWarningLine className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Patients in Queue Container */}
        <Card title={`Patients in Queue (${waitingVisits.length})`}>
          {waitingVisits.length === 0 ? (
            <EmptyState
              icon={RiCheckboxCircleLine}
              title="No Waiting Patients"
              description="Your consultation queue is currently empty. Incoming patients registered by reception will appear here automatically."
            />
          ) : (
            <>
              {/* 1. Mobile Cards Layout (< 768px) */}
              <div className="md:hidden space-y-3">
                {waitingVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-600 text-lg tabular-nums">
                          #{visit.queueNumber}
                        </span>
                        <StatusBadge status={visit.status} />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 tabular-nums">
                        <RiTimeLine className="w-3.5 h-3.5" />
                        {calculateWaitingTime(visit.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{visit.patient?.fullName}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 tabular-nums">
                        {visit.patient?.age} yrs • {visit.patient?.gender} • {visit.visitNumber}
                      </p>
                      {visit.patient?.remarks && (
                        <p className="text-xs text-slate-400 mt-1 italic">Note: {visit.patient.remarks}</p>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setConfirmVisit(visit)}
                      isLoading={consultingId === visit.id}
                      disabled={!!consultingId}
                      leftIcon={<RiUserFollowLine />}
                      className="w-full"
                    >
                      CONSULTED
                    </Button>
                  </div>
                ))}
              </div>

              {/* 2. Desktop Data Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3">Queue #</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Age</th>
                      <th className="pb-3">Gender</th>
                      <th className="pb-3">Visit Number</th>
                      <th className="pb-3">Waiting Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waitingVisits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-black text-amber-600 text-lg tabular-nums">
                          #{visit.queueNumber}
                        </td>
                        <td className="py-4 font-semibold text-slate-900 text-base">
                          {visit.patient?.fullName}
                          {visit.patient?.remarks && (
                            <span className="block text-xs font-normal text-slate-400 mt-0.5">
                              Note: {visit.patient.remarks}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-slate-700 font-medium tabular-nums">
                          {visit.patient?.age} yrs
                        </td>
                        <td className="py-4 text-slate-700 capitalize">
                          {visit.patient?.gender?.toLowerCase()}
                        </td>
                        <td className="py-4 font-mono text-xs text-slate-600 tabular-nums">
                          {visit.visitNumber}
                        </td>
                        <td className="py-4 font-medium text-slate-600">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 tabular-nums">
                            <RiTimeLine className="w-3.5 h-3.5" />
                            {calculateWaitingTime(visit.createdAt)}
                          </span>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={visit.status} />
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setConfirmVisit(visit)}
                            isLoading={consultingId === visit.id}
                            disabled={!!consultingId}
                            leftIcon={<RiUserFollowLine />}
                          >
                            CONSULTED
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        {/* Confirmation Modal */}
        <Modal
          isOpen={!!confirmVisit}
          onClose={() => setConfirmVisit(null)}
          title="Mark Patient as Consulted"
          subtitle={`Queue #${confirmVisit?.queueNumber} • ${confirmVisit?.patient?.fullName}`}
          maxWidth="sm"
        >
          {confirmVisit && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Are you sure you have completed consultation for{' '}
                <strong className="text-slate-900">{confirmVisit.patient?.fullName}</strong>?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                Clicking <strong>Confirm Consulted</strong> will remove this patient from your queue and automatically forward their details to the Doctor Assistant for fee collection.
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <Button variant="outline" size="md" onClick={() => setConfirmVisit(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleMarkConsulted(confirmVisit)}
                  isLoading={consultingId === confirmVisit.id}
                  leftIcon={<RiUserFollowLine />}
                >
                  Confirm Consulted
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleLayout>
  );
}
