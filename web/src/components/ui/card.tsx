import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hoverLift?: boolean;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  hoverLift = false,
}: CardProps) {
  const liftClass = hoverLift
    ? 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200'
    : 'transition-shadow duration-150';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden ${liftClass} ${className}`}
    >
      {(title || action) && (
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
          <div className="min-w-0">
            {title && (
              <h3 className="font-bold text-slate-900 text-[15px] sm:text-base tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
