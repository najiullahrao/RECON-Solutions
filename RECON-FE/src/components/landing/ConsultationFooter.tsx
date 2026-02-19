import { motion } from 'framer-motion';
import { Phone, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const phones = ['0303-7192621', '0310-4307609'];

/** Add your social URLs here when ready */
const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', icon: Facebook },
  { href: '#', label: 'Instagram', icon: Instagram },
  { href: '#', label: 'LinkedIn', icon: Linkedin },
  { href: '#', label: 'Twitter', icon: Twitter },
  { href: '#', label: 'YouTube', icon: Youtube },
];

export function ConsultationFooter() {
  return (
    <footer
      className="border-t border-[#1a1a1a]/10 bg-[#1a1a1a] py-16 text-white"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="font-sans text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Engr. Rao Waleed Abdullah</p>
            <p className="mt-1 text-sm text-white/80">Consultation & Project Inquiries</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            {phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/-/g, '')}`}
                className="flex items-center justify-center gap-2 text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
              >
                <Phone className="h-4 w-4" aria-hidden />
                <span>{phone}</span>
              </a>
            ))}
          </div>
          <a
            href={ROUTES.CONSULTATIONS}
            className="rounded-sm border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          >
            Request Consultation
          </a>
        </motion.div>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          aria-label="Social media"
        >
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
              aria-label={label}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </a>
          ))}
        </motion.div>
        <motion.p
          className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-white/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © {new Date().getFullYear()} RECON Solutions — Rao Engineering & Construction Solutions
        </motion.p>
      </div>

    </footer>
  );
}
