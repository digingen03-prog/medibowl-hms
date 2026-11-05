'use client';

import React, { useState, useEffect } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import {
  RiFileChartLine,
  RiCalendarEventLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiMoneyRupeeCircleLine,
  RiAlertLine,
  RiRefreshLine,
  RiSearch2Line,
  RiFilter3Line,
  RiDownload2Line,
  RiBankCardLine,
  RiBillLine,
  RiUserFollowLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiPrinterLine,
  RiEyeLine,
} from 'react-icons/ri';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'registrations' | 'doctors' | 'collections' | 'outstanding'>('payments');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [doctorWise, setDoctorWise] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detailed Payments Report State
  const [detailedPayments, setDetailedPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    methodBreakdown: { CASH: 0, UPI: 0, CARD: 0, OTHER: 0 },
  });
  const [searchPayment, setSearchPayment] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL');
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Receipt Modal State
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<any | null>(null);

  const loadDoctors = async () => {
    try {
      const docs = await api.get('/doctors?all=true');
      setDoctorsList(docs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDetailedPayments = async () => {
    try {
      let queryParams: string[] = [];

      if (searchPayment.trim()) {
        queryParams.push(`search=${encodeURIComponent(searchPayment.trim())}`);
      }

      if (selectedMethod !== 'ALL') {
        queryParams.push(`method=${selectedMethod}`);
      }

      if (selectedDoctorId !== 'ALL') {
        queryParams.push(`doctorId=${selectedDoctorId}`);
      }

      // Date range filtering
      const today = new Date();
      if (datePreset === 'TODAY') {
        const start = today.toISOString().split('T')[0];
        queryParams.push(`startDate=${start}`);
        queryParams.push(`endDate=${start}`);
      } else if (datePreset === '7DAYS') {
        const past = new Date();
        past.setDate(today.getDate() - 7);
        queryParams.push(`startDate=${past.toISOString().split('T')[0]}`);
      } else if (datePreset === '30DAYS') {
        const past = new Date();
        past.setDate(today.getDate() - 30);
        queryParams.push(`startDate=${past.toISOString().split('T')[0]}`);
      } else if (datePreset === 'CUSTOM') {
        if (customStartDate) queryParams.push(`startDate=${customStartDate}`);
        if (customEndDate) queryParams.push(`endDate=${customEndDate}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/admin/reports/detailed-payments${queryString}`);

      if (res) {
        setDetailedPayments(res.payments || []);
        if (res.summary) {
          setPaymentSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load detailed payments report:', err);
    }
  };

  const loadAllReports = async () => {
    setIsLoading(true);
    try {
      const [regData, docData, colData, outData] = await Promise.all([
        api.get('/admin/reports/registrations?days=7'),
        api.get('/admin/reports/doctor-wise'),
        api.get('/admin/reports/collections?days=7'),
        api.get('/admin/reports/outstanding'),
        loadDetailedPayments(),
      ]);
      setRegistrations(regData || []);
      setDoctorWise(docData || []);
      setCollections(colData || []);
      setOutstanding(outData || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadAllReports();
  }, []);

  useEffect(() => {
    loadDetailedPayments();
  }, [searchPayment, selectedMethod, selectedDoctorId, datePreset, customStartDate, customEndDate]);

  // Export to CSV Function
  const exportPaymentsToCSV = () => {
    if (detailedPayments.length === 0) {
      alert('No payment records to export.');
      return;
    }

    const headers = [
      'Payment ID',
      'Date & Time',
      'Visit Number',
      'Queue Number',
      'Patient Name',
      'Patient Mobile',
      'Doctor Name',
      'Collected By',
      'Payment Method',
      'Amount Received (INR)',
      'Payment Status',
      'Transaction Reference',
    ];

    const rows = detailedPayments.map((p) => [
      `"${p.id}"`,
      `"${new Date(p.collectedAt).toLocaleString()}"`,
      `"${p.visit.visitNumber}"`,
      `"${p.visit.queueNumber}"`,
      `"${p.patient.fullName}"`,
      `"${p.patient.mobileNumber}"`,
      `"${p.doctor.name}"`,
      `"${p.collectedBy.name}"`,
      `"${p.paymentMethod}"`,
      `"${p.amountReceived.toFixed(2)}"`,
      `"${p.paymentStatus}"`,
      `"${p.transactionReference || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HMS_Payments_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RoleLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Financial & Operational Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive transaction ledger, revenue collection breakdown, doctor throughput, and audit metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllReports}
              isLoading={isLoading}
              leftIcon={<RiRefreshLine className={isLoading ? 'animate-spin' : ''} />}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs sm:text-sm scrollbar-none -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RiBillLine className="w-4 h-4" />
            Detailed Payments Ledger ({detailedPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'registrations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RiCalendarEventLine className="w-4 h-4" />
            Daily Registrations
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'doctors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RiGroupLine className="w-4 h-4" />
            Doctor Caseloads
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'collections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RiMoneyRupeeCircleLine className="w-4 h-4" />
            7-Day Revenue Trend
          </button>
          <button
            onClick={() => setActiveTab('outstanding')}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'outstanding'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RiAlertLine className="w-4 h-4" />
            Outstanding Balances ({outstanding.length})
          </button>
        </div>

        {/* ================= TAB 1: DETAILED PAYMENTS & LEDGER REPORT ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue Collected</span>
                <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">₹{paymentSummary.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium tabular-nums">{paymentSummary.totalTransactions} recorded transaction(s)</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">UPI / Online Collections</span>
                <p className="text-2xl font-black text-blue-600 mt-1 tabular-nums">₹{(paymentSummary.methodBreakdown.UPI || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Google Pay, PhonePe, QR Code</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cash Collections</span>
                <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">₹{(paymentSummary.methodBreakdown.CASH || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Physical cash at counter</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Card / Other</span>
                <p className="text-2xl font-black text-purple-600 mt-1 tabular-nums">
                  ₹{((paymentSummary.methodBreakdown.CARD || 0) + (paymentSummary.methodBreakdown.OTHER || 0)).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">POS Card swipe / NetBanking</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4!">
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  {/* Search */}
                  <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <RiSearch2Line className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search patient, mobile, visit #, txn ref..."
                      value={searchPayment}
                      onChange={(e) => setSearchPayment(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Method Filter */}
                    <div className="flex items-center gap-1.5">
                      <RiBankCardLine className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                      >
                        <option value="ALL">All Payment Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">Card</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Doctor Filter */}
                    <div className="flex items-center gap-1.5">
                      <RiStethoscopeLine className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 max-w-[170px] truncate"
                      >
                        <option value="ALL">All Doctors</option>
                        {doctorsList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.user?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Preset */}
                    <div className="flex items-center gap-1.5">
                      <RiCalendarEventLine className="w-4 h-4 text-slate-400" />
                      <select
                        value={datePreset}
                        onChange={(e) => setDatePreset(e.target.value as any)}
                        className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                      >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today Only</option>
                        <option value="7DAYS">Last 7 Days</option>
                        <option value="30DAYS">Last 30 Days</option>
                        <option value="CUSTOM">Custom Date Range</option>
                      </select>
                    </div>

                    {/* CSV Export Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportPaymentsToCSV}
                      leftIcon={<RiDownload2Line />}
                      title="Download payment ledger as CSV"
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Custom Date Inputs if selected */}
                {datePreset === 'CUSTOM' && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-500">From Date:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
                    />
                    <span className="font-semibold text-slate-500">To Date:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Detailed Payments Table */}
            <Card
              title={`Payment Transactions Ledger (${detailedPayments.length})`}
              subtitle="All consultation fees collected with linked patient, doctor, and collector staff details"
            >
              {detailedPayments.length === 0 ? (
                <EmptyState
                  icon={RiBillLine}
                  title="No Payment Records Found"
                  description="No transactions match the selected filter parameters or search query."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Visit & Queue #</th>
                        <th className="pb-3">Patient Information</th>
                        <th className="pb-3">Attending Doctor</th>
                        <th className="pb-3">Collected By</th>
                        <th className="pb-3">Payment Method</th>
                        <th className="pb-3">Amount Received</th>
                        <th className="pb-3">Payment Status</th>
                        <th className="pb-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailedPayments.map((p) => {
                        let methodColor = 'bg-slate-100 text-slate-800 border-slate-200';
                        if (p.paymentMethod === 'UPI') methodColor = 'bg-blue-50 text-blue-700 border-blue-200';
                        if (p.paymentMethod === 'CASH') methodColor = 'bg-amber-50 text-amber-800 border-amber-200';
                        if (p.paymentMethod === 'CARD') methodColor = 'bg-purple-50 text-purple-800 border-purple-200';

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 text-xs text-slate-600 whitespace-nowrap tabular-nums">
                              <div className="font-semibold text-slate-900">
                                {new Date(p.collectedAt).toLocaleDateString()}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {new Date(p.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            <td className="py-3.5">
                              <span className="font-black text-blue-600 text-sm tabular-nums">
                                #{p.visit.queueNumber}
                              </span>
                              <div className="font-mono text-xs font-semibold text-slate-700 mt-0.5 tabular-nums">
                                {p.visit.visitNumber}
                              </div>
                            </td>

                            <td className="py-3.5">
                              <div className="font-bold text-slate-900">{p.patient.fullName}</div>
                              <div className="text-xs text-slate-500 font-mono tabular-nums">
                                {p.patient.mobileNumber} • {p.patient.age}y/{p.patient.gender?.charAt(0)}
                              </div>
                            </td>

                            <td className="py-3.5">
                              <div className="font-medium text-slate-800">{p.doctor.name}</div>
                              <div className="text-xs text-slate-400">{p.doctor.specialization}</div>
                            </td>

                            <td className="py-3.5 text-xs">
                              <div className="font-semibold text-slate-800">{p.collectedBy.name}</div>
                              <div className="text-slate-400 text-[11px] capitalize">{p.collectedBy.role?.toLowerCase()?.replace('_', ' ')}</div>
                            </td>

                            <td className="py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${methodColor}`}>
                                {p.paymentMethod}
                              </span>
                              {p.transactionReference && (
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5 max-w-[120px] truncate tabular-nums" title={p.transactionReference}>
                                  Ref: {p.transactionReference}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5">
                              <span className="font-black text-emerald-700 text-base tabular-nums">
                                ₹{p.amountReceived.toFixed(2)}
                              </span>
                            </td>

                            <td className="py-3.5">
                              <StatusBadge status={p.paymentStatus} />
                            </td>

                            <td className="py-3.5 text-right whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPaymentRecord(p)}
                                title="View Complete Receipt"
                                leftIcon={<RiEyeLine />}
                              >
                                Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Receipt Modal */}
            <Modal
              isOpen={!!selectedPaymentRecord}
              onClose={() => setSelectedPaymentRecord(null)}
              title="Official Consultation Fee Receipt"
              subtitle={`Receipt ID: ${selectedPaymentRecord?.id?.substring(0, 8)?.toUpperCase()}`}
              maxWidth="md"
            >
              {selectedPaymentRecord && (
                <div className="space-y-4 text-xs">
                  {/* Hospital Header Banner */}
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-900">Hospital Operational Workspace</h3>
                    <p className="text-slate-500 text-[11px]">Consultation Fee Collection Audit Receipt</p>
                    <p className="text-slate-400 font-mono text-[10px] mt-1">
                      Date: {new Date(selectedPaymentRecord.collectedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Visit & Patient Summary */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Patient Name</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedPaymentRecord.patient.fullName}</p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">ID: {selectedPaymentRecord.patient.patientNumber}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Visit Number</span>
                      <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{selectedPaymentRecord.visit.visitNumber}</p>
                      <p className="text-slate-600 font-bold text-xs mt-0.5">Queue #{selectedPaymentRecord.visit.queueNumber}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Consulting Doctor</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedPaymentRecord.doctor.name}</p>
                      <p className="text-slate-400 text-[10px]">{selectedPaymentRecord.doctor.specialization}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Collected By Staff</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedPaymentRecord.collectedBy.name}</p>
                      <p className="text-slate-400 text-[10px]">{selectedPaymentRecord.collectedBy.email}</p>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Total Consultation Fee:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">₹{selectedPaymentRecord.visit.consultationFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Payment Method:</span>
                      <span className="font-bold text-blue-700">{selectedPaymentRecord.paymentMethod}</span>
                    </div>

                    {selectedPaymentRecord.transactionReference && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Transaction Reference:</span>
                        <span className="font-mono text-slate-800 font-semibold tabular-nums">{selectedPaymentRecord.transactionReference}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                      <span className="text-slate-900">Amount Paid:</span>
                      <span className="text-emerald-700 text-base tabular-nums">₹{selectedPaymentRecord.amountReceived.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500">Status:</span>
                      <StatusBadge status={selectedPaymentRecord.paymentStatus} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => window.print()}
                      leftIcon={<RiPrinterLine />}
                    >
                      Print Receipt
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setSelectedPaymentRecord(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* ================= TAB 2: DAILY REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <Card title="Daily Patient Registrations (Last 7 Days)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Total Registered Visits</th>
                    <th className="pb-3">Completed Visits</th>
                    <th className="pb-3">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((item) => {
                    const rate = item.registrations > 0 ? ((item.completed / item.registrations) * 100).toFixed(0) : '0';
                    return (
                      <tr key={item.date} className="hover:bg-slate-50/80">
                        <td className="py-3.5 font-semibold text-slate-900 tabular-nums">{item.date}</td>
                        <td className="py-3.5 font-bold text-blue-600 text-base tabular-nums">{item.registrations}</td>
                        <td className="py-3.5 text-emerald-700 font-semibold tabular-nums">{item.completed}</td>
                        <td className="py-3.5 text-slate-600 tabular-nums">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ================= TAB 3: DOCTOR-WISE COUNT ================= */}
        {activeTab === 'doctors' && (
          <Card title="Doctor-Wise Consultation Volume">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3">Specialization</th>
                    <th className="pb-3">Default Fee</th>
                    <th className="pb-3">Waiting</th>
                    <th className="pb-3">Consulted</th>
                    <th className="pb-3">Completed</th>
                    <th className="pb-3 font-bold">Total Patient Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorWise.map((d) => (
                    <tr key={d.doctorId} className="hover:bg-slate-50/80">
                      <td className="py-3.5 font-bold text-slate-900">{d.doctorName}</td>
                      <td className="py-3.5 text-slate-600 text-xs">{d.specialization}</td>
                      <td className="py-3.5 font-semibold text-slate-700 tabular-nums">₹{d.defaultFee.toFixed(2)}</td>
                      <td className="py-3.5 text-amber-700 font-semibold tabular-nums">{d.waiting}</td>
                      <td className="py-3.5 text-blue-700 font-semibold tabular-nums">{d.consulted}</td>
                      <td className="py-3.5 text-emerald-700 font-semibold tabular-nums">{d.completed}</td>
                      <td className="py-3.5 font-black text-slate-900 text-base tabular-nums">{d.totalVisits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ================= TAB 4: DAILY COLLECTIONS ================= */}
        {activeTab === 'collections' && (
          <Card title="Daily Consultation Fee Collection (Last 7 Days)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Total Amount Collected</th>
                    <th className="pb-3">Transactions Count</th>
                    <th className="pb-3">Average Fee / Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collections.map((item) => {
                    const avg = item.transactions > 0 ? (item.amount / item.transactions).toFixed(2) : '0.00';
                    return (
                      <tr key={item.date} className="hover:bg-slate-50/80">
                        <td className="py-3.5 font-semibold text-slate-900 tabular-nums">{item.date}</td>
                        <td className="py-3.5 font-black text-emerald-700 text-base tabular-nums">₹{item.amount.toFixed(2)}</td>
                        <td className="py-3.5 text-slate-700 font-semibold tabular-nums">{item.transactions}</td>
                        <td className="py-3.5 text-slate-500 font-mono text-xs tabular-nums">₹{avg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ================= TAB 5: OUTSTANDING BALANCES ================= */}
        {activeTab === 'outstanding' && (
          <Card title={`Unsettled Consultations & Outstanding Balances (${outstanding.length})`}>
            {outstanding.length === 0 ? (
              <EmptyState
                icon={RiCheckboxCircleLine}
                title="Zero Outstanding Balances!"
                description="All consultation fees are fully collected."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3">Visit #</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Mobile</th>
                      <th className="pb-3">Doctor</th>
                      <th className="pb-3">Required Fee</th>
                      <th className="pb-3">Paid Amount</th>
                      <th className="pb-3 font-bold text-amber-700">Outstanding Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outstanding.map((item) => (
                      <tr key={item.visitId} className="hover:bg-slate-50/80">
                        <td className="py-3.5 font-mono text-xs font-bold text-slate-800 tabular-nums">{item.visitNumber}</td>
                        <td className="py-3.5 font-semibold text-slate-900">{item.patientName}</td>
                        <td className="py-3.5 font-mono text-xs text-slate-600 tabular-nums">{item.patientMobile}</td>
                        <td className="py-3.5 text-slate-700">{item.doctorName}</td>
                        <td className="py-3.5 text-slate-800 tabular-nums">₹{item.consultationFee.toFixed(2)}</td>
                        <td className="py-3.5 text-slate-500 tabular-nums">₹{item.amountPaid.toFixed(2)}</td>
                        <td className="py-3.5 font-black text-amber-700 text-base tabular-nums">₹{item.outstandingBalance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </RoleLayout>
  );
}
