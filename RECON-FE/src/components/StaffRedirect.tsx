import { Navigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
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
  const { isAuthenticated } = useAuth();
  const { isStaff, isLoading } = useProfile();

  // If not authenticated, allow access immediately (no need to check profile)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated but still loading profile, show loading
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
      </div>
    );
  }

  // If staff/admin, redirect to home (they should use admin pages)
  if (isStaff) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Regular authenticated users can access
  return <>{children}</>;
}
