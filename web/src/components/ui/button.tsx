import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'danger'
  | 'destructive-solid'
  | 'success'
  | 'success-solid'
  | 'warning'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'compact' | 'icon' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base enterprise typography & interaction styles
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100 select-none active:scale-[0.985] active:translate-y-px cursor-pointer';

  // Standardized dimensions (Heights: 38-40px standard, 32-34px compact, 44-48px large, border-radius: 8-10px, NO pills)
  const sizeStyles: Record<string, string> = {
    compact: 'h-[32px] px-3 text-xs gap-1.5 rounded-[8px] [&_svg]:w-3.5 [&_svg]:h-3.5',
    sm: 'h-[32px] px-3 text-xs gap-1.5 rounded-[8px] [&_svg]:w-3.5 [&_svg]:h-3.5',
    md: 'h-[38px] px-4 text-[13px] sm:text-sm gap-2 rounded-[9px] [&_svg]:w-4 [&_svg]:h-4',
    lg: 'h-[46px] px-5 sm:px-6 text-sm sm:text-base gap-2.5 rounded-[10px] [&_svg]:w-4.5 [&_svg]:h-4.5',
    'icon-sm': 'w-[32px] h-[32px] p-0 rounded-[8px] justify-center shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5',
    icon: 'w-[38px] h-[38px] p-0 rounded-[9px] justify-center shrink-0 [&_svg]:w-4 [&_svg]:h-4',
    'icon-lg': 'w-[46px] h-[46px] p-0 rounded-[10px] justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5',
  };

  // Standardized variants matching enterprise clinical design language
  const variantStyles: Record<string, string> = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-sm border border-blue-600/90 focus-visible:ring-blue-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200/90 active:bg-slate-200 text-slate-800 border border-slate-200/90 shadow-2xs hover:shadow-xs focus-visible:ring-slate-400',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-2xs hover:shadow-xs focus-visible:ring-blue-500',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200/70 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400 border border-transparent',
    destructive:
      'bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 text-rose-700 border border-rose-200/90 hover:border-rose-300 shadow-2xs focus-visible:ring-rose-500',
    danger:
      'bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 text-rose-700 border border-rose-200/90 hover:border-rose-300 shadow-2xs focus-visible:ring-rose-500',
    'destructive-solid':
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs hover:shadow-sm border border-rose-600/90 focus-visible:ring-rose-500',
    success:
      'bg-emerald-50 hover:bg-emerald-100/90 active:bg-emerald-200 text-emerald-700 border border-emerald-200/90 hover:border-emerald-300 shadow-2xs focus-visible:ring-emerald-500',
    'success-solid':
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs hover:shadow-sm border border-emerald-600/90 focus-visible:ring-emerald-500',
    warning:
      'bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-700 border border-amber-200/90 hover:border-amber-300 shadow-2xs focus-visible:ring-amber-500',
    link:
      'bg-transparent hover:underline text-blue-600 p-0 h-auto font-medium focus-visible:ring-blue-500 shadow-none border-0 active:scale-100 active:translate-y-0',
  };

  const isIconOnly = size === 'icon' || size === 'icon-sm' || size === 'icon-lg';

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className={`animate-spin ${isIconOnly ? '' : '-ml-0.5 mr-1.5'} h-4 w-4 text-current shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
