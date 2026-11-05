import React from 'react';
import { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-4 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-13 h-13 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3.5 border border-slate-200/80 shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
