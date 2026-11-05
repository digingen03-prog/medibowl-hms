'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Doctor, Patient } from '@/lib/types';
import {
  RiUserAddLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiPhoneLine,
  RiUserLine,
  RiTimeLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
} from 'react-icons/ri';

export default function RegisterPatientPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Patient fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [remarks, setRemarks] = useState('');

  // Duplicate check state
  const [duplicateMatches, setDuplicateMatches] = useState<Patient[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<Patient | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVisit, setSuccessVisit] = useState<any | null>(null);

  useEffect(() => {
    api.get<Doctor[]>('/doctors')
      .then((data) => {
        setDoctors(data || []);
        if (data && data.length > 0) {
          setSelectedDoctorId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load doctors:', err));
  }, []);

  // Check mobile duplicate on change
  useEffect(() => {
    const cleanMobile = mobileNumber.trim();
    if (cleanMobile.length < 5 || selectedExistingPatient) {
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const matches = await api.get<Patient[]>(`/patients/check-mobile?mobile=${encodeURIComponent(cleanMobile)}`);
        setDuplicateMatches(matches || []);
      } catch (err) {
        console.error('Mobile check error:', err);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [mobileNumber, selectedExistingPatient]);

  const handleSelectExisting = (patient: Patient) => {
    setSelectedExistingPatient(patient);
    setFullName(patient.fullName);
    setAge(String(patient.age));
    setGender(patient.gender as any);
    setMobileNumber(patient.mobileNumber);
    if (patient.dateOfBirth) {
      setDateOfBirth(new Date(patient.dateOfBirth).toISOString().split('T')[0]);
    }
    if (patient.address) setAddress(patient.address);
    if (patient.emergencyContact) setEmergencyContact(patient.emergencyContact);
    setDuplicateMatches([]);
  };

  const handleClearExisting = () => {
    setSelectedExistingPatient(null);
    setFullName('');
    setAge('');
    setGender('MALE');
    setMobileNumber('');
    setDateOfBirth('');
    setAddress('');
    setEmergencyContact('');
    setRemarks('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a consulting doctor.');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      setError('Please enter a valid age (0–130).');
      return;
    }

    setIsSubmitting(true);

    try {
      let patientId: string;

      if (selectedExistingPatient) {
        patientId = selectedExistingPatient.id;
      } else {
        const newPatient = await api.post<Patient>('/patients', {
          fullName: fullName.trim(),
          age: parsedAge,
          gender,
          mobileNumber: mobileNumber.trim(),
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
          address: address.trim() || undefined,
          emergencyContact: emergencyContact.trim() || undefined,
        });
        patientId = newPatient.id;
      }

      // Create new visit with WAITING status
      const visitRes = await api.post('/visits', {
        patientId,
        doctorId: selectedDoctorId,
        remarks: remarks.trim() || undefined,
      });

      setSuccessVisit(visitRes);
    } catch (err: any) {
      setError(err.message || 'Failed to register patient and create visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessVisit(null);
    setSelectedExistingPatient(null);
    setFullName('');
    setAge('');
    setGender('MALE');
    setMobileNumber('');
    setDateOfBirth('');
    setAddress('');
    setEmergencyContact('');
    setRemarks('');
    setError(null);
  };

  return (
    <RoleLayout allowedRoles={['RECEPTIONIST', 'ADMIN']}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Patient Registration
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Register new or returning patients, check duplicate records, and issue token into the doctor waiting queue.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {successVisit && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <RiCheckboxCircleLine className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5">
                  PATIENT REGISTERED & QUEUED
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {successVisit.patient?.fullName} successfully added to Waiting Queue!
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Queue Number</span>
                    <p className="text-2xl font-bold text-blue-600 tabular-nums">#{successVisit.queueNumber}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Visit Number</span>
                    <p className="text-sm font-mono font-semibold text-slate-800 mt-1 tabular-nums">{successVisit.visitNumber}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Patient ID</span>
                    <p className="text-sm font-mono font-medium text-slate-600 mt-1 tabular-nums">{successVisit.patient?.patientNumber}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Assigned Doctor</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{successVisit.doctor?.user?.name}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button variant="primary" size="md" onClick={resetForm} leftIcon={<RiUserAddLine />}>
                    Register Another Patient
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => router.push('/receptionist/queue')}
                    rightIcon={<RiArrowRightLine />}
                  >
                    Go to Live Queue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form Card */}
        {!successVisit && (
          <form onSubmit={handleSubmit}>
            <Card className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5">
                  <RiAlertLine className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Returning Patient Mode Indicator */}
              {selectedExistingPatient && (
                <div className="bg-blue-50/80 border border-blue-200 text-blue-900 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <RiShieldCheckLine className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Selected Returning Patient</span>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {selectedExistingPatient.fullName} <span className="font-mono text-xs text-slate-500 font-normal">({selectedExistingPatient.patientNumber})</span>
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearExisting} type="button" className="shrink-0">
                    Change / New
                  </Button>
                </div>
              )}

              {/* Mobile Duplicate Search Warning Banner */}
              {duplicateMatches.length > 0 && !selectedExistingPatient && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-amber-900 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <RiAlertLine className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-amber-900">
                        Existing patient(s) found with mobile number {mobileNumber}:
                      </h4>
                      <p className="text-xs text-amber-700 font-normal mt-0.5">
                        If this is a returning patient, click &quot;Select for New Visit&quot; to preserve their lifetime medical visit history.
                      </p>

                      <div className="mt-3 space-y-2">
                        {duplicateMatches.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-slate-900 truncate">{p.fullName}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                ID: {p.patientNumber} • Age: {p.age} • Gender: {p.gender}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="warning"
                              size="sm"
                              onClick={() => handleSelectExisting(p)}
                            >
                              Select for New Visit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. Patient Demographics Section */}
              <div>
                <h3 className="text-[15px] sm:text-base font-semibold text-slate-900 flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                  <RiUserLine className="w-4 h-4 text-blue-600" />
                  1. Patient Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <RiPhoneLine className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        pattern="[0-9]*"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal tabular-nums min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="130"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 35"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal tabular-nums min-h-[44px]"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Date of Birth (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, locality, city"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Emergency Contact / Kin (Optional)
                    </label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. Sunita (Spouse) - 9876543210"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Doctor Assignment & Visit Queueing */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[15px] sm:text-base font-semibold text-slate-900 flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                  <RiTimeLine className="w-4 h-4 text-blue-600" />
                  2. Doctor Consultation Assignment
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
                      Select Clinical Doctor <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {doctors.map((doc) => (
                        <label
                          key={doc.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                            selectedDoctorId === doc.id
                              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="doctorSelection"
                            value={doc.id}
                            checked={selectedDoctorId === doc.id}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-slate-900 truncate">{doc.user?.name}</div>
                            <div className="text-xs text-slate-500 font-normal mt-0.5">{doc.specialization}</div>
                            <div className="text-xs font-semibold text-blue-700 mt-1 tabular-nums">
                              Default Fee: ₹{Number(doc.defaultConsultationFee).toFixed(2)}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                      Registration Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Follow-up consultation, fever symptoms, BP check"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 shadow-2xs font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/receptionist/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<RiUserAddLine />}
                >
                  Confirm Registration & Issue Token
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </RoleLayout>
  );
}
