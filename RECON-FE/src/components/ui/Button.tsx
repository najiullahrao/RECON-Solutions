import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-none bg-[#800000] text-white hover:bg-[#6b0000]',
  secondary:
    'border border-[#800000] bg-transparent text-[#800000] hover:bg-[#800000]/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#800000] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        'rounded-[4px]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
