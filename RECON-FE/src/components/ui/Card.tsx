import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-sm border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'border-b border-[#1a1a1a]/10 px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

/** Bento-style grid wrapper: use grid-cols and gap; children can use col-span-* for varying spans. */
export function BentoGrid({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Bento card: 1px border, lift on hover. Use with BentoGrid and col-span-* for layout. */
export function BentoCard({ children, className, ...props }: CardProps) {
  return (
    <Card
      className={cn('transition-all hover:-translate-y-0.5', className)}
      {...props}
    >
      {children}
    </Card>
  );
}
