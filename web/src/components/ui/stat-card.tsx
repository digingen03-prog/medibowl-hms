import React from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType | React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'slate';
  badge?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badge,
  className = '',
}: StatCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/90',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50/90',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    green: {
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    red: {
      bg: 'bg-rose-50/90',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-indigo-50/90',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200/80',
    },
  }[color];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/90 transition-all duration-200 flex items-start justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
              {badge}
            </span>
          )}
        </div>
        <p className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1.5 tracking-tight tabular-nums">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-xl ${colorMap.bg} ${colorMap.text} border ${colorMap.border} shrink-0 shadow-2xs`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
