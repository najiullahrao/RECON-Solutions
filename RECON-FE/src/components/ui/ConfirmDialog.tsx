import { type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="fixed inset-0 bg-stone-900/60" aria-hidden onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-sm border border-gray-200 bg-white p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mt-2 text-[#1a1a1a]/80">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
