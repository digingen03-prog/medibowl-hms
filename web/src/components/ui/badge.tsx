import React from 'react';
import { VisitStatus, PaymentStatus } from '@/lib/types';

interface BadgeProps {
  status: VisitStatus | PaymentStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className = '', size = 'sm' }: BadgeProps) {
  let colorStyles = 'bg-slate-50 text-slate-600 border-slate-200';
  let dotStyles = 'bg-slate-400';

  switch (status) {
    case 'WAITING':
      colorStyles = 'bg-amber-50/80 text-amber-800 border-amber-200/80';
      dotStyles = 'bg-amber-500';
      break;
    case 'CONSULTED':
      colorStyles = 'bg-blue-50/80 text-blue-700 border-blue-200/80';
      dotStyles = 'bg-blue-500';
      break;
    case 'COMPLETED':
    case 'PAID':
      colorStyles = 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80';
      dotStyles = 'bg-emerald-500';
      break;
    case 'PARTIALLY_PAID':
      colorStyles = 'bg-orange-50/80 text-orange-800 border-orange-200/80';
      dotStyles = 'bg-orange-500';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-rose-50/80 text-rose-700 border-rose-200/80';
      dotStyles = 'bg-rose-500';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight ${sizeClasses} ${colorStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles} shrink-0`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
}
