import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const FOOTER_LINKS = [
  { to: ROUTES.SERVICES, label: 'Services' },
  { to: ROUTES.PROJECTS, label: 'Portfolio' },
  { to: ROUTES.CONSULTATIONS, label: 'Consultation' },
  { to: ROUTES.AI, label: 'AI Tools' },
  { to: ROUTES.PROFILE, label: 'Profile' },
];

/** Add your social URLs here when ready */
const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', icon: Facebook },
  { href: '#', label: 'Instagram', icon: Instagram },
  { href: '#', label: 'LinkedIn', icon: Linkedin },
  { href: '#', label: 'Twitter', icon: Twitter },
  { href: '#', label: 'YouTube', icon: Youtube },
];

export function AppFooter() {
  return (
    <footer
      className="mt-auto border-t border-white/10 bg-[#1A1A1A] py-12 text-white"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-sans text-lg font-bold" style={{ letterSpacing: '-0.02em' }}>Engr. Rao Waleed Abdullah</p>
            <p className="mt-1 text-sm text-white/80">Rao Engineering & Construction Solutions</p>
            <p className="mt-2 text-sm text-white/70">Consultation & Project Inquiries</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Office
            </p>
            <p className="mt-1 text-sm text-white/90">0303-7192621</p>
            <p className="text-sm text-white/90">0310-4307609</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-white/80 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-2">
              Follow us
            </p>
            <div className="flex items-center gap-3" aria-label="Social media">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          © {new Date().getFullYear()} RECON Solutions — Engineering & Tech Platform
        </p>
      </div>
    </footer>
  );
}
