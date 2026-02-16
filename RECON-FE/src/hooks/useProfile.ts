import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api';
import { isApiError } from '../types/api';
import type { UserRole } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setRole(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const res = await authApi.getMe();
    if (isApiError(res)) {
      setRole(null);
    } else {
      const r = (res.data?.profile?.role ?? 'USER').toString().toUpperCase() as UserRole;
      setRole(r === 'ADMIN' || r === 'STAFF' || r === 'USER' ? r : 'USER');
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF' || role === 'ADMIN';
  const canManageServices = isAdmin;
  const canManageProjects = isStaff;

  return { role, isAdmin, isStaff, canManageServices, canManageProjects, isLoading, refetch: fetchProfile };
}
