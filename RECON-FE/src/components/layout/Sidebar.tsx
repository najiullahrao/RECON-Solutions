import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { User } from 'lucide-react';

const publicNav = [
  { to: ROUTES.HOME, label: 'Home', icon: '🏠' },
  { to: ROUTES.SERVICES, label: 'Services', icon: '🔧' },
  { to: ROUTES.PROJECTS, label: 'Projects', icon: '🏗️' },
  { to: ROUTES.AI, label: 'AI Assistant', icon: '💬' },
];

const userOnlyNav = [
  { to: ROUTES.CONSULTATIONS, label: 'Consultations', icon: '📋' },
  { to: ROUTES.APPOINTMENTS, label: 'Appointments', icon: '📅' },
];

const userAuthNav = [
  { to: ROUTES.MY_APPOINTMENTS, label: 'My Appointments', icon: '📅' },
  { to: ROUTES.MY_CONSULTATIONS, label: 'My Consultations', icon: '📋' },
];

const staffNav = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { to: ROUTES.ADMIN_CONSULTATIONS, label: 'Manage consultations', icon: '📋' },
  { to: ROUTES.ADMIN_APPOINTMENTS, label: 'Manage appointments', icon: '📅' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAuthenticated } = useAuth();
  const { isStaff } = useProfile();
  const isRegularUser = isAuthenticated && !isStaff;

  return (
    <>
      {/* Overlay on mobile when sidebar open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        id="sidebar"
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-blue-100 bg-gradient-to-b from-white to-blue-50/30 shadow-xl transition-transform duration-200 ease-in-out dark:border-blue-900/50 dark:from-stone-900 dark:to-blue-950/20 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-4 dark:border-stone-700 bg-gradient-to-r from-blue-600 to-blue-700">
            <span className="text-2xl font-bold text-white">RECON</span>
            <span className="text-sm text-blue-100">Solutions</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {publicNav.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm'
                          : 'text-stone-700 hover:bg-blue-50 dark:text-stone-300 dark:hover:bg-blue-950/30 transition-colors'
                      )
                    }
                    end={to === ROUTES.HOME}
                  >
                    <span aria-hidden>{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
              {isRegularUser && userOnlyNav.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm'
                          : 'text-stone-700 hover:bg-blue-50 dark:text-stone-300 dark:hover:bg-blue-950/30 transition-colors'
                      )
                    }
                  >
                    <span aria-hidden>{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
              {isRegularUser && userAuthNav.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm'
                          : 'text-stone-700 hover:bg-blue-50 dark:text-stone-300 dark:hover:bg-blue-950/30 transition-colors'
                      )
                    }
                  >
                    <span aria-hidden>{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
              {isAuthenticated && isStaff && staffNav.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm'
                          : 'text-stone-700 hover:bg-blue-50 dark:text-stone-300 dark:hover:bg-blue-950/30 transition-colors'
                      )
                    }
                  >
                    <span aria-hidden>{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {isAuthenticated && (
            <div className="border-t border-stone-200 px-3 py-3 dark:border-stone-700">
              <NavLink
                to={ROUTES.PROFILE}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm'
                      : 'text-stone-700 hover:bg-blue-50 dark:text-stone-300 dark:hover:bg-blue-950/30 transition-colors'
                  )
                }
              >
                <User className="h-4 w-4 shrink-0" />
                Profile
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
