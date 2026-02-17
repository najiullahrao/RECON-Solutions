import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fixed inset-0 bg-stone-900/60" aria-hidden onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-sm border border-gray-200 bg-white',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-[#1a1a1a]/60 hover:bg-[#f9f9f9] hover:text-[#1a1a1a]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
