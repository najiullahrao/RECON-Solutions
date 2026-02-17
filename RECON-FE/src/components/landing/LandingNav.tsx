import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

type NavItem = {
  to: string;
  label: string;
  hasDropdown?: boolean;
};

const navLinks: NavItem[] = [
  { to: ROUTES.SERVICES, label: 'Services' },
  { to: ROUTES.PROJECTS, label: 'Projects' },
  { to: ROUTES.CONSULTATIONS, label: 'Consultation', hasDropdown: true },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#1a1a1a]/10 bg-white/80 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-1 font-semibold tracking-tight text-[#1a1a1a] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
        >
          <span className="font-bold text-[#800000]">RECON</span>
          <span>SOLUTIONS</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((item) =>
            item.hasDropdown ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setConsultationOpen(true)}
                onMouseLeave={() => setConsultationOpen(false)}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-1 text-sm font-medium text-[#1a1a1a] no-underline transition-colors hover:text-[#800000]"
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Link>
                {consultationOpen && (
                  <div className="absolute left-0 top-full pt-1">
                    <div className="rounded border border-[#1a1a1a]/10 bg-white py-2 shadow-lg">
                      <Link
                        to={ROUTES.CONSULTATIONS}
                        className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f9f9f9]"
                      >
                        Request Consultation
                      </Link>
                      <Link
                        to={ROUTES.APPOINTMENTS}
                        className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f9f9f9]"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-[#1a1a1a] no-underline transition-colors hover:text-[#800000]"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.AI}
            className="hidden rounded-md border border-[#800000] bg-[#800000] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6b0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2 md:inline-block"
          >
            AI Assistant
          </Link>
          <button
            type="button"
            className="rounded p-2 text-[#1a1a1a] hover:bg-[#f9f9f9] md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#1a1a1a]/10 bg-white/95 px-4 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="py-2 text-sm font-medium text-[#1a1a1a]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={ROUTES.AI}
              className="mt-2 inline-flex justify-center rounded-md bg-[#800000] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              AI Assistant
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
