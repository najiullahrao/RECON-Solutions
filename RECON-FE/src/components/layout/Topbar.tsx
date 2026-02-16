import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface TopbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function Topbar({ onMenuClick, sidebarOpen }: TopbarProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/50 px-4 backdrop-blur shadow-sm dark:border-blue-900/50 dark:from-stone-900 dark:to-blue-950/30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-stone-600 hover:bg-blue-100 dark:text-stone-400 dark:hover:bg-blue-950/30 transition-colors"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 lg:text-base">
          RECON Solutions
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!isAuthenticated && (
          <>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="sm">
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
