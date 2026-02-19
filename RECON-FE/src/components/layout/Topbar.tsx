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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-sm p-2 text-[#1a1a1a] hover:bg-[#f9f9f9] transition-colors"
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
        <Link to={ROUTES.HOME} className="flex items-center" aria-label="RECON Solutions home">
          <img src="/RECON.png" alt="RECON Solutions" className="h-10 w-auto object-contain lg:h-50" />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {!isAuthenticated && (
          <>
            <Link to={ROUTES.LOGIN}>
              <Button variant="secondary" size="sm">
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
