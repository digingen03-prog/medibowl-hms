'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { Doctor } from '@/lib/types';
import {
  RiStethoscopeLine,
  RiMoneyRupeeCircleLine,
  RiEditLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Fee Modal
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [specialization, setSpecialization] = useState('');
  const [defaultFee, setDefaultFee] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Doctor[]>('/doctors?all=true');
      setDoctors(data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setSpecialization(doc.specialization || '');
    setDefaultFee(String(Number(doc.defaultConsultationFee)));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setIsUpdating(true);

    try {
      await api.patch(`/doctors/${editingDoctor.id}`, {
        specialization,
        defaultConsultationFee: parseFloat(defaultFee) || 0,
      });
      setEditingDoctor(null);
      await loadDoctors();
    } catch (err: any) {
      alert(err.message || 'Failed to update doctor profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Doctor Profiles & Consultation Fees</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure medical specializations and baseline consultation pricing for each doctor
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDoctors}
            isLoading={isLoading}
            leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>

        <Card title={`Registered Doctors (${doctors.length})`}>
          {doctors.length === 0 ? (
            <EmptyState
              icon={RiStethoscopeLine}
              title="No Doctor Profiles Found"
              description="No doctor profiles found. Create a doctor account in User Management first."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Doctor Name</th>
                    <th className="pb-3">Specialization</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Default Fee (₹)</th>
                    <th className="pb-3">Active Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          Dr
                        </div>
                        {doc.user?.name}
                      </td>
                      <td className="py-4 text-slate-700 font-medium">
                        {doc.specialization || 'General Physician'}
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-600">
                        {doc.user?.email}
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-blue-700 text-base tabular-nums">
                          ₹{Number(doc.defaultConsultationFee).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4">
                        {doc.isActive ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                            <RiCheckboxCircleLine className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-red-700">
                            <RiCloseCircleLine className="w-3.5 h-3.5 mr-1 text-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(doc)}
                          leftIcon={<RiEditLine />}
                        >
                          Edit Fee & Specialization
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingDoctor}
          onClose={() => setEditingDoctor(null)}
          title="Edit Doctor Settings"
          subtitle={`Doctor: ${editingDoctor?.user?.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Medical Specialization
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. General Physician, Cardiology"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Default Consultation Fee (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <RiMoneyRupeeCircleLine className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setEditingDoctor(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleLayout>
  );
}
