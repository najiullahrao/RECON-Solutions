import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, FolderOpen, MessageSquare, Settings, Menu, X, ChevronDown, LayoutDashboard, ClipboardList, Calendar } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '../../lib/cn';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type NavItem = {
  to: string;
  label: string;
  hasDropdown?: boolean;
  staffOnly?: boolean;
  userOnly?: boolean;
  /** For dropdowns: 'consultation' | 'manage' | 'ai' */
  dropdownType?: 'consultation' | 'manage' | 'ai';
};

const ALL_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.SERVICES, label: 'Services' },
  { to: ROUTES.PROJECTS, label: 'Portfolio' },
  { to: ROUTES.CONSULTATIONS, label: 'Consultation', hasDropdown: true, userOnly: true, dropdownType: 'consultation' },
  { to: ROUTES.DASHBOARD, label: 'Manage', hasDropdown: true, staffOnly: true, dropdownType: 'manage' },
  { to: ROUTES.AI, label: 'AI Tools', hasDropdown: true, dropdownType: 'ai' },
];

export function GlobalHeader() {
  const { isAuthenticated, logout } = useAuth();
  const { initials, isStaff } = useProfile();
  const { pathname } = useLocation();

  const navLinks = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.staffOnly) return isStaff;
      if (item.userOnly) return !isStaff;
      return true;
    });
  }, [isStaff]);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const consultationRef = useRef<HTMLDivElement>(null);
  const manageRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (consultationRef.current && !consultationRef.current.contains(e.target as Node)) {
        setConsultationOpen(false);
      }
      if (manageRef.current && !manageRef.current.contains(e.target as Node)) {
        setManageOpen(false);
      }
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) {
        setAiOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 px-4',
        'bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60'
      )}
    >
      {/* Logo */}
      <Link
        to={ROUTES.HOME}
        className="flex shrink-0 items-center gap-1 font-semibold tracking-tight text-[#1a1a1a] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
        aria-label="RECON Solutions home"
      >
        <img
          src="/RECON.png"
          alt="RECON Solutions"
          className="h-20 w-auto object-contain sm:h-21 lg:h-50"
        />
      </Link>

      {/* Center nav - desktop */}
      <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
        {navLinks.map((item) =>
          item.hasDropdown ? (
            <div
              key={`${item.to}-${item.dropdownType ?? ''}`}
              ref={item.dropdownType === 'manage' ? manageRef : item.dropdownType === 'ai' ? aiRef : consultationRef}
              className="relative"
              onMouseEnter={() => {
                if (item.dropdownType === 'manage') setManageOpen(true);
                else if (item.dropdownType === 'ai') setAiOpen(true);
                else setConsultationOpen(true);
              }}
              onMouseLeave={() => {
                if (item.dropdownType === 'manage') setManageOpen(false);
                else if (item.dropdownType === 'ai') setAiOpen(false);
                else setConsultationOpen(false);
              }}
            >
              <span
                className={cn(
                  'relative flex cursor-default items-center gap-1 text-sm font-medium text-[#1a1a1a] transition-colors duration-200',
                  'hover:text-[#800000]',
                  'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#800000] after:transition-transform after:duration-200 after:content-[""]',
                  'hover:after:scale-x-100',
                  (item.dropdownType === 'manage' ? manageOpen : item.dropdownType === 'ai' ? aiOpen : consultationOpen) && 'text-[#800000] after:scale-x-100'
                )}
                aria-haspopup="true"
                aria-expanded={item.dropdownType === 'manage' ? manageOpen : item.dropdownType === 'ai' ? aiOpen : consultationOpen}
              >
                {item.label}
                <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </span>
              {item.dropdownType === 'manage' && manageOpen && (
                <div className="absolute left-0 top-full pt-1 z-50">
                  <div className="rounded-sm border border-gray-200 bg-white py-2 min-w-[200px]">
                    <Link
                      to={ROUTES.DASHBOARD}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setManageOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_CONSULTATIONS}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setManageOpen(false)}
                    >
                      Manage Consultations
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_APPOINTMENTS}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setManageOpen(false)}
                    >
                      Manage Appointments
                    </Link>
                  </div>
                </div>
              )}
              {item.dropdownType === 'consultation' && consultationOpen && (
                <div className="absolute left-0 top-full pt-1 z-50">
                  <div className="rounded-sm border border-gray-200 bg-white py-2 min-w-[200px]">
                    <Link
                      to={ROUTES.CONSULTATIONS}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setConsultationOpen(false)}
                    >
                      Request Consultation
                    </Link>
                    <Link
                      to={ROUTES.APPOINTMENTS}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setConsultationOpen(false)}
                    >
                      Book Appointment
                    </Link>
                    {isAuthenticated && !isStaff && (
                      <>
                        <div className="my-1 border-t border-gray-200" />
                        <Link
                          to={ROUTES.MY_CONSULTATIONS}
                          className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                          onClick={() => setConsultationOpen(false)}
                        >
                          My Consultations
                        </Link>
                        <Link
                          to={ROUTES.MY_APPOINTMENTS}
                          className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                          onClick={() => setConsultationOpen(false)}
                        >
                          My Appointments
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
              {item.dropdownType === 'ai' && aiOpen && (
                <div className="absolute left-0 top-full pt-1 z-50">
                  <div className="rounded-sm border border-gray-200 bg-white py-2 min-w-[200px]">
                    {pathname === ROUTES.AI ? (
                      <span className="block px-4 py-2 text-sm text-[#1a1a1a] cursor-default bg-[#f9f9f9] text-[#800000]">
                        AI Assistant
                      </span>
                    ) : (
                      <Link
                        to={ROUTES.AI}
                        className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                        onClick={() => setAiOpen(false)}
                      >
                        AI Assistant
                      </Link>
                    )}
                    <Link
                      to={ROUTES.TOOLS_ESTIMATOR}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setAiOpen(false)}
                    >
                      Cost Estimator
                    </Link>
                    <Link
                      to={ROUTES.TOOLS_STRUCTURAL}
                      className="block px-4 py-2 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9] hover:text-[#800000]"
                      onClick={() => setAiOpen(false)}
                    >
                      Structural Logs
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative text-sm font-medium text-[#1a1a1a] no-underline transition-colors duration-200',
                  'hover:text-[#800000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2',
                  'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-[#800000] after:transition-transform after:duration-200 after:content-[""]',
                  'hover:after:scale-x-100',
                  isActive && 'text-[#800000] after:scale-x-100'
                )
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Right: Bell, Profile / Auth */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-sm text-[#1a1a1a] transition-colors hover:bg-[#f9f9f9] hover:text-[#800000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {isAuthenticated ? (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-[#f9f9f9] text-sm font-semibold text-[#1a1a1a] transition-colors hover:border-[#800000] hover:bg-[#800000]/5 hover:text-[#800000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="Profile menu"
            >
              {initials ?? <User className="h-5 w-5" strokeWidth={1.5} />}
            </button>
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 rounded-sm border border-gray-200 bg-white py-1"
                role="menu"
              >
                {isStaff ? (
                  <>
                    <Link
                      to={ROUTES.DASHBOARD}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                      Dashboard
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_CONSULTATIONS}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                      Manage Consultations
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_APPOINTMENTS}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <Calendar className="h-4 w-4" strokeWidth={1.5} />
                      Manage Appointments
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.PROJECTS}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
                      My Projects
                    </Link>
                    <Link
                      to={ROUTES.MY_CONSULTATIONS}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                      My Consultations
                    </Link>
                    <Link
                      to={ROUTES.MY_APPOINTMENTS}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                    >
                      <Calendar className="h-4 w-4" strokeWidth={1.5} />
                      My Appointments
                    </Link>
                  </>
                )}
                <Link
                  to={ROUTES.PROFILE}
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1a1a] no-underline transition-colors hover:bg-[#f9f9f9]"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                  Settings
                </Link>
                <div className="my-1 border-t border-gray-200" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#1a1a1a] transition-colors hover:bg-[#f9f9f9]"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to={ROUTES.LOGIN}
              className="hidden rounded-sm px-3 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:text-[#800000] sm:block"
            >
              Log in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-sm border-none bg-[#800000] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6b0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
            >
              Sign up
            </Link>
          </>
        )}

        <button
          type="button"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded text-[#1a1a1a] md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="absolute left-0 right-0 top-full z-40 border-b border-[#1a1a1a]/10 bg-white/95 py-4 backdrop-blur-md md:hidden"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1 px-4">
            {navLinks.map((item) => (
              <div key={`${item.to}-${item.dropdownType ?? item.label}`}>
                {item.hasDropdown ? (
                  <>
                    <span className="block py-2 text-sm font-medium text-[#1a1a1a]">
                      {item.label}
                    </span>
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[#1a1a1a]/10 pl-3">
                      {item.dropdownType === 'manage' ? (
                        <>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            to={ROUTES.ADMIN_CONSULTATIONS}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Manage Consultations
                          </Link>
                          <Link
                            to={ROUTES.ADMIN_APPOINTMENTS}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Manage Appointments
                          </Link>
                        </>
                      ) : item.dropdownType === 'ai' ? (
                        <>
                          {pathname === ROUTES.AI ? (
                            <span className="py-1.5 text-sm text-[#800000]">AI Assistant</span>
                          ) : (
                            <Link
                              to={ROUTES.AI}
                              className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                              onClick={() => setMobileOpen(false)}
                            >
                              AI Assistant
                            </Link>
                          )}
                          <Link
                            to={ROUTES.TOOLS_ESTIMATOR}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Cost Estimator
                          </Link>
                          <Link
                            to={ROUTES.TOOLS_STRUCTURAL}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Structural Logs
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to={ROUTES.CONSULTATIONS}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Request Consultation
                          </Link>
                          <Link
                            to={ROUTES.APPOINTMENTS}
                            className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                            onClick={() => setMobileOpen(false)}
                          >
                            Book Appointment
                          </Link>
                          {isAuthenticated && !isStaff && (
                            <>
                              <Link
                                to={ROUTES.MY_CONSULTATIONS}
                                className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                                onClick={() => setMobileOpen(false)}
                              >
                                My Consultations
                              </Link>
                              <Link
                                to={ROUTES.MY_APPOINTMENTS}
                                className="py-1.5 text-sm text-[#1a1a1a]/80 hover:text-[#800000]"
                                onClick={() => setMobileOpen(false)}
                              >
                                My Appointments
                              </Link>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.to}
                    className="py-2 text-sm font-medium text-[#1a1a1a] hover:text-[#800000]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="default"
      />
    </header>
  );
}
