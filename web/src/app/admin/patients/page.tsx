'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { Patient } from '@/lib/types';
import {
  RiUserHeartLine,
  RiSearch2Line,
  RiEyeLine,
  RiTimeLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const endpoint = search.trim()
        ? `/patients?search=${encodeURIComponent(search.trim())}`
        : '/patients';
      const res = await api.get(endpoint);
      setPatients(res.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search]);

  const openPatientModal = async (patientId: string) => {
    try {
      const p = await api.get<Patient>(`/patients/${patientId}`);
      setSelectedPatient(p);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Patient Directory & Medical History</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete archive of registered patients and multi-visit clinical records
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPatients}
            isLoading={isLoading}
            leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>

        <Card className="p-3.5 sm:p-4!">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <RiSearch2Line className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 min-h-[42px] sm:min-h-0"
            />
          </div>
        </Card>

        <Card title={`All Patients (${patients.length})`}>
          {patients.length === 0 ? (
            <EmptyState
              icon={RiUserHeartLine}
              title="No Patients Found"
              description="No registered patients match your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Patient ID</th>
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Age / Gender</th>
                    <th className="pb-3">Mobile Number</th>
                    <th className="pb-3">Total Visits</th>
                    <th className="pb-3">Registration Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-mono text-xs font-bold text-blue-600 tabular-nums">
                        {p.patientNumber}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="py-3.5 text-slate-600 tabular-nums">
                        {p.age} yrs / {p.gender}
                      </td>
                      <td className="py-3.5 font-mono text-xs text-slate-600 tabular-nums">
                        {p.mobileNumber}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 tabular-nums">
                          {p._count?.visits || p.visits?.length || 0} visits
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-500 tabular-nums">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPatientModal(p.id)}
                          leftIcon={<RiEyeLine />}
                        >
                          View History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Patient Details & Visit History Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedPatient?.fullName || 'Patient Details'}
          subtitle={`ID: ${selectedPatient?.patientNumber} • ${selectedPatient?.mobileNumber}`}
          maxWidth="lg"
        >
          {selectedPatient && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Gender</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Age</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block tabular-nums">{selectedPatient.age} years</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Phone</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block tabular-nums">{selectedPatient.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">First Seen</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block tabular-nums">
                    {new Date(selectedPatient.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Clinical Visit History ({selectedPatient.visits?.length || 0})
                </h4>
                {(!selectedPatient.visits || selectedPatient.visits.length === 0) ? (
                  <p className="text-slate-400 text-xs italic">No visits recorded for this patient.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.visits.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600">{v.visitNumber}</span>
                            <StatusBadge status={v.status} size="sm" />
                          </div>
                          <p className="text-slate-600">
                            Dr. {v.doctor?.user?.name} ({v.doctor?.specialization})
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] tabular-nums">
                            <RiTimeLine className="w-3.5 h-3.5" />
                            {new Date(v.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <div className="font-bold text-slate-900 text-sm tabular-nums">
                            Fee: ₹{Number(v.finalFee || v.consultationFee || v.consultation?.consultationFee || 0).toFixed(2)}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                            Paid: ₹{Number(v.paidAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleLayout>
  );
}
