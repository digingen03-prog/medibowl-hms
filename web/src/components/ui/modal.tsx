import React, { useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className={`relative w-full ${maxWidthClass} bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden transform transition-all duration-200 max-h-[92vh] flex flex-col my-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="min-w-0 pr-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 shrink-0 -mr-2"
              aria-label="Close modal dialog"
            >
              <RiCloseLine className="w-5 h-5" />
            </Button>
          </div>

          {/* Body with vertical scroll for small devices */}
          <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
