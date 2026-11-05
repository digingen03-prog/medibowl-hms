'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RiSettings4Line,
  RiShieldCheckLine,
  RiHospitalLine,
  RiCheckboxCircleLine,
  RiLockPasswordLine,
} from 'react-icons/ri';

export default function AdminSettingsPage() {
  const [hospitalName, setHospitalName] = useState('Metro Care Multi-Specialty Hospital');
  const [contactPhone, setContactPhone] = useState('+91 80 2345 6789');
  const [contactEmail, setContactEmail] = useState('info@metrocarehospital.com');
  const [currency, setCurrency] = useState('INR (₹)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Compliance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global healthcare organization parameters, data privacy, and operational policies
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2 shadow-2xs">
            <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Hospital settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card title="Hospital Profile">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Operational Currency
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>
          </Card>

          <Card title="Clinical Queue Configuration">
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Automatic Daily Queue Sequence Reset</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Queue numbers automatically reset to 1 every morning at 00:00 AM IST</p>
                </div>
                <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-full">ENABLED</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Doctor Consultation Lock</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Only assigned doctor can transition patient from Waiting to Consulted</p>
                </div>
                <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-full">ENFORCED</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
}
