import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api';
import { isApiError } from '../types/api';
import type { UserRole } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setRole(null);
      setFullName(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const res = await authApi.getMe();
    if (isApiError(res)) {
      setRole(null);
      setFullName(null);
    } else {
      const r = (res.data?.profile?.role ?? 'USER').toString().toUpperCase() as UserRole;
      setRole(r === 'ADMIN' || r === 'STAFF' || r === 'USER' ? r : 'USER');
      setFullName(res.data?.profile?.full_name ?? null);
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

  /** Initials for avatar (e.g. "John Doe" -> "JD") */
  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return {
    role,
    fullName,
    initials,
    isAdmin,
    isStaff,
    canManageServices,
    canManageProjects,
    isLoading,
    refetch: fetchProfile,
  };
}
