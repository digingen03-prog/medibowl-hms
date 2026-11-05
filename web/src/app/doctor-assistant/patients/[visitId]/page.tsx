'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { PatientVisit, PaymentMethod } from '@/lib/types';
import {
  RiBankCardLine,
  RiMoneyRupeeCircleLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiArrowLeftLine,
  RiTimeLine,
  RiShieldCheckLine,
  RiCheckLine,
} from 'react-icons/ri';

export default function AssistantPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const visitId = params?.visitId as string;

  const [visit, setVisit] = useState<PatientVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fee and Payment form state
  const [consultationFee, setConsultationFee] = useState<string>('500');
  const [amountReceived, setAmountReceived] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  useEffect(() => {
    if (!visitId) return;

    api.get<PatientVisit>(`/assistant/visits/${visitId}`)
      .then((data) => {
        setVisit(data);
        const currentFee = data.totalFee || Number(data.consultation?.consultationFee) || 500;
        setConsultationFee(String(currentFee));
        // Default amount received to the balance remaining or fee
        const balance = data.balance !== undefined ? data.balance : currentFee;
        setAmountReceived(String(balance));
      })
      .catch((err) => {
        setError(err.message || 'Failed to load visit details');
      })
      .finally(() => setIsLoading(false));
  }, [visitId]);

  const handleFeeChange = (val: string) => {
    setConsultationFee(val);
    // Automatically match amount received if not manually altered
    setAmountReceived(val);
  };

  const handleSaveAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const feeNum = parseFloat(consultationFee);
    const amountNum = parseFloat(amountReceived);

    if (isNaN(feeNum) || feeNum < 0) {
      setError('Please enter a valid consultation fee (>= 0)');
      return;
    }

    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid amount received (>= 0)');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(`/assistant/visits/${visitId}/finish`, {
        consultationFee: feeNum,
        amountReceived: amountNum,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      setSuccessInfo(res);
      setVisit(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to save fee and complete visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RoleLayout allowedRoles={['DOCTOR_ASSISTANT', 'ADMIN']}>
        <div className="text-center py-20 text-slate-500">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading patient billing record...</p>
        </div>
      </RoleLayout>
    );
  }

  if (!visit) {
    return (
      <RoleLayout allowedRoles={['DOCTOR_ASSISTANT', 'ADMIN']}>
        <div className="p-8 text-center text-red-600">
          <p className="font-semibold">Visit not found or access denied.</p>
          <Link href="/doctor-assistant/consulted-patients">
            <Button variant="outline" size="md" className="mt-4">
              Back to Consulted Patients
            </Button>
          </Link>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout allowedRoles={['DOCTOR_ASSISTANT', 'ADMIN']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/doctor-assistant/consulted-patients"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RiArrowLeftLine className="w-4 h-4 mr-1.5" />
            Back to Consulted Queue
          </Link>

          <StatusBadge status={visit.status} />
        </div>

        {/* Success Completion Banner */}
        {successInfo && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <RiCheckboxCircleLine className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {successInfo.isFullyPaid
                    ? 'Visit Completed & Payment Settled!'
                    : 'Partial Payment Recorded!'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{successInfo.message}</p>

                {successInfo.isFullyPaid ? (
                  <p className="text-xs text-emerald-800 font-semibold mt-2">
                    ✓ The patient visit is now marked as <strong>COMPLETED</strong> and removed from the active queue.
                  </p>
                ) : (
                  <p className="text-xs text-amber-800 font-semibold mt-2 tabular-nums">
                    ⚠ Outstanding balance remaining: ₹{successInfo.outstandingBalance.toFixed(2)}. Visit remains in pending state.
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push('/doctor-assistant/consulted-patients')}
                  >
                    Return to Consulted Queue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Details and Billing Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Patient & Consultation Information */}
          <div className="md:col-span-1 space-y-4">
            <Card title="Patient Profile">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Patient Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{visit.patient?.fullName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Patient ID</span>
                  <p className="font-mono font-medium text-slate-700 mt-0.5 tabular-nums">{visit.patient?.patientNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Age</span>
                    <p className="font-semibold text-slate-800 mt-0.5 tabular-nums">{visit.patient?.age} yrs</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Gender</span>
                    <p className="font-semibold text-slate-800 mt-0.5 capitalize">{visit.patient?.gender?.toLowerCase()}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Mobile Number</span>
                  <p className="font-mono font-medium text-slate-800 mt-0.5 tabular-nums">{visit.patient?.mobileNumber}</p>
                </div>

                {visit.patient?.address && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Address</span>
                    <p className="text-slate-600 mt-0.5">{visit.patient?.address}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Visit Information">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Visit Number</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5 tabular-nums">{visit.visitNumber}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Daily Queue Number</span>
                  <p className="font-black text-blue-600 text-base mt-0.5 tabular-nums">#{visit.queueNumber}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Consulting Doctor</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{visit.doctor?.user?.name}</p>
                  <p className="text-[11px] text-slate-400">{visit.doctor?.specialization}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Registration Time</span>
                  <p className="text-slate-600 mt-0.5 tabular-nums">
                    {new Date(visit.createdAt).toLocaleDateString()} {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {visit.consultedAt && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Consulted At</span>
                    <p className="text-slate-600 mt-0.5 tabular-nums">
                      {new Date(visit.consultedAt).toLocaleDateString()} {new Date(visit.consultedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Consultation Fee & Payment Collection */}
          <div className="md:col-span-2">
            <Card
              title="Consultation Fee & Payment Collection"
              subtitle="Enter or adjust the consultation fee and record patient payment"
            >
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2 shadow-2xs">
                  <RiErrorWarningLine className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Outstanding / Previous Payments Section if any */}
              {visit.payments && visit.payments.length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Payment History on this Visit
                  </h4>
                  <div className="space-y-1.5">
                    {visit.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <span className="font-semibold text-slate-800 tabular-nums">₹{Number(p.amountReceived).toFixed(2)}</span>
                          <span className="text-slate-400 ml-2">via {p.paymentMethod}</span>
                          {p.transactionReference && (
                            <span className="text-slate-400 ml-1.5 font-mono tabular-nums">({p.transactionReference})</span>
                          )}
                        </div>
                        <StatusBadge status={p.paymentStatus} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Total Previously Collected:</span>
                    <span className="text-emerald-700 tabular-nums">₹{Number(visit.totalPaid || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {visit.status === 'COMPLETED' ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <RiCheckboxCircleLine className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-slate-900">Visit is Completed</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    This consultation has been fully settled and closed.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveAndFinish} className="space-y-5">
                  {/* Consultation Fee Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Consultation Fee (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <RiMoneyRupeeCircleLine className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        required
                        value={consultationFee}
                        onChange={(e) => handleFeeChange(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 tabular-nums min-h-[44px]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 tabular-nums">
                      Doctor default fee: ₹{Number(visit.doctor?.defaultConsultationFee || 500).toFixed(2)}. Assistant can adjust with administrative permission.
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['CASH', 'UPI', 'CARD', 'OTHER'] as PaymentMethod[]).map((method) => (
                        <label
                          key={method}
                          className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-semibold text-xs transition-all ${
                            paymentMethod === method
                              ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="sr-only"
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amount Received */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Amount Received Now (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <RiMoneyRupeeCircleLine className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        required
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 tabular-nums min-h-[44px]"
                      />
                    </div>
                    {parseFloat(amountReceived) < parseFloat(consultationFee) && (
                      <p className="text-xs text-amber-700 font-medium mt-1.5 tabular-nums">
                        Notice: Partial payment will leave an outstanding balance of ₹
                        {(parseFloat(consultationFee) - parseFloat(amountReceived)).toFixed(2)}. The visit will remain pending.
                      </p>
                    )}
                  </div>

                  {/* Payment Reference (optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Transaction Reference / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="e.g. UPI Ref / Receipt # / Bank Txn ID"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 min-h-[44px]"
                    />
                  </div>

                  {/* SAVE & FINISH Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/doctor-assistant/consulted-patients')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="success-solid"
                      size="lg"
                      isLoading={isSubmitting}
                      leftIcon={<RiCheckboxCircleLine />}
                    >
                      SAVE & FINISH
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
