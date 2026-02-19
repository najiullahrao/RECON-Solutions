import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { ROUTES } from '../constants/routes';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Require staff or admin role; redirect to home if not */
  requireStaff?: boolean;
  /** Only allow regular users (not staff/admin); redirect staff to home */
  userOnly?: boolean;
}

export function ProtectedRoute({
  children,
  requireStaff = false,
  userOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isStaff, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requireStaff && !isStaff) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (userOnly && isStaff) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
