import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api';
import { isApiError } from '../types/api';
import type { MeResponse } from '../types/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { session, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    authApi.getMe().then((res) => {
      if (cancelled) return;
      if (!isApiError(res) && res.data) setMe(res.data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate(ROUTES.HOME, { replace: true });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const displayName = me?.profile?.full_name ?? session?.user?.email ?? 'User';
  const email = session?.user?.email ?? me?.user?.email ?? '—';
  const role = me?.profile?.role ?? 'USER';
  const roleLabel = role === 'ADMIN' ? 'Administrator' : role === 'STAFF' ? 'Staff' : 'User';

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Profile</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Your account details and role.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">{displayName}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{roleLabel}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
            <Mail className="h-5 w-5 text-stone-400 dark:text-stone-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">Email</p>
              <p>{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
            <Shield className="h-5 w-5 text-stone-400 dark:text-stone-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">Role</p>
              <p>{roleLabel}</p>
            </div>
          </div>
          <div className="mt-6 border-t border-stone-200 pt-6 dark:border-stone-700">
            <Button variant="secondary" onClick={handleLogoutClick} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-stone-500 dark:text-stone-400">
        <Link to={ROUTES.HOME} className="text-blue-600 hover:underline dark:text-blue-400">
          ← Back to home
        </Link>
      </p>

      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
      />
    </div>
  );
}
