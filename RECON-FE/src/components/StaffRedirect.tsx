import { Navigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { ROUTES } from '../constants/routes';
import type { ReactNode } from 'react';

interface StaffRedirectProps {
  children: ReactNode;
}

/**
 * Renders children for regular users and guests.
 * Redirects staff/admin to home so they only use manage pages.
 */
export function StaffRedirect({ children }: StaffRedirectProps) {
  const { isStaff, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isStaff) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
