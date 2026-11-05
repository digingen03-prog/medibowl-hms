'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { User, Role } from '@/lib/types';
import {
  RiTeamLine,
  RiUserAddLine,
  RiSearch2Line,
  RiKey2Line,
  RiShieldCheckLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiAlertLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RECEPTIONIST');
  const [specialization, setSpecialization] = useState('General Physician');
  const [defaultConsultationFee, setDefaultConsultationFee] = useState('500');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Reset Modal state
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/admin/users?';
      if (roleFilter !== 'ALL') endpoint += `role=${roleFilter}&`;
      if (search.trim()) endpoint += `search=${encodeURIComponent(search.trim())}&`;
      const data = await api.get<User[]>(endpoint);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        name,
        email,
        username: username.trim() || undefined,
        password,
        role,
      };

      if (role === 'DOCTOR') {
        payload.specialization = specialization;
        payload.defaultConsultationFee = parseFloat(defaultConsultationFee) || 500;
      }

      await api.post('/admin/users', payload);
      setIsCreateOpen(false);
      // Reset fields
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setRole('RECEPTIONIST');
      await loadUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user.id}/toggle-status`);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setResetError(null);
    setIsResetting(true);

    try {
      await api.post(`/admin/users/${resetUser.id}/reset-password`, {
        newPassword,
      });
      setResetUser(null);
      setNewPassword('');
      alert(`Password for ${resetUser.name} has been reset successfully!`);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Staff & User Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure hospital staff access credentials and role-based permissions
            </p>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              isLoading={isLoading}
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<RiUserAddLine />}
            >
              Add New User
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 sm:p-4!">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <RiSearch2Line className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search staff by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 min-h-[42px] sm:min-h-0"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="DOCTOR_ASSISTANT">Doctor Assistant</option>
              </select>
            </div>
          </div>
        </Card>

        {/* User Table */}
        <Card
          title={`Hospital Staff Accounts (${users.length})`}
          subtitle="All active and deactivated clinical staff credentials"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<RiUserAddLine />}
            >
              Add New User
            </Button>
          }
        >
          {users.length === 0 ? (
            <EmptyState
              icon={RiTeamLine}
              title="No Staff Accounts Found"
              description="No user accounts found matching your query or filter parameters."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  leftIcon={<RiUserAddLine />}
                >
                  Add New User
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Staff Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">System Role</th>
                    <th className="pb-3">Doctor Fee</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-semibold text-slate-900">
                        {u.name}
                        {u.username && (
                          <span className="block text-xs font-normal text-slate-400">
                            @{u.username}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 font-mono text-xs text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-600 tabular-nums">
                        {u.role === 'DOCTOR' && u.doctorProfile ? (
                          <span className="font-semibold text-emerald-700">
                            ₹{Number(u.doctorProfile.defaultConsultationFee).toFixed(2)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5">
                        {u.isActive ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                            <RiCheckboxCircleLine className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-red-700">
                            <RiCloseCircleLine className="w-3.5 h-3.5 mr-1 text-red-500" />
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResetUser(u)}
                            title="Reset Password"
                            leftIcon={<RiKey2Line />}
                          >
                            Password
                          </Button>
                          <Button
                            variant={u.isActive ? 'destructive' : 'success'}
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Deactivate staff account' : 'Activate staff account'}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Staff Account"
          subtitle="Add a receptionist, doctor, assistant, or administrator"
          maxWidth="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
                <RiAlertLine className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Robert Chen or Priya Sharma"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@hospital.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Password * (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="DOCTOR_ASSISTANT">Doctor Assistant</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {role === 'DOCTOR' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider">Doctor Profile Attributes</h4>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology, Orthopedics"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={defaultConsultationFee}
                    onChange={(e) => setDefaultConsultationFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Create User
              </Button>
            </div>
          </form>
        </Modal>

        {/* Password Reset Modal */}
        <Modal
          isOpen={!!resetUser}
          onClose={() => setResetUser(null)}
          title="Reset User Password"
          subtitle={`User: ${resetUser?.name} (${resetUser?.email})`}
          maxWidth="sm"
        >
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
                <RiAlertLine className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Password * (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setResetUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isResetting}>
                Save New Password
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleLayout>
  );
}
