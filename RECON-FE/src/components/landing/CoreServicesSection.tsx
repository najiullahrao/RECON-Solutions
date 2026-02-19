import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HardHat,
  PencilRuler,
  Palette,
  Wrench,
  MapPin,
  Briefcase,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { servicesApi } from '../../api';
import { isApiError } from '../../types/api';
import type { Service } from '../../types/api';
import { serviceDetailPath } from '../../constants/routes';

// Icon mapping for services
const iconMap: Record<string, typeof HardHat> = {
  construction: HardHat,
  architecture: PencilRuler,
  interior: Palette,
  renovation: Wrench,
  consultation: MapPin,
  management: Briefcase,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function CoreServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    servicesApi
      .list({ active: true })
      .then((res) => {
        if (cancelled) return;
        if (isApiError(res)) {
          setServices([]);
          return;
        }
        const serviceList = Array.isArray(res.data) ? res.data : [];
        setServices(serviceList);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getIcon = (service: Service) => {
    const category = service.category?.toLowerCase() || '';
    // Try to match by category first
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (category.includes(key)) {
        return Icon;
      }
    }
    // Try to match by name
    const name = service.name.toLowerCase();
    if (name.includes('construction') || name.includes('execution')) return HardHat;
    if (name.includes('architect') || name.includes('design')) return PencilRuler;
    if (name.includes('interior')) return Palette;
    if (name.includes('renovation') || name.includes('maintenance')) return Wrench;
    if (name.includes('consultation') || name.includes('land') || name.includes('property')) return MapPin;
    if (name.includes('management') || name.includes('consultancy')) return Briefcase;
    // Default icon
    return Briefcase;
  };

  return (
    <section
      className="border-t border-[#1a1a1a]/10 bg-[#f9f9f9] py-16 md:py-24"
      aria-labelledby="core-services-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          id="core-services-heading"
          className="font-sans text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          Core Services
        </motion.h2>
        {loading ? (
          <div className="mt-10 flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
          </div>
        ) : (
          <motion.div
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {services.map((service) => {
              const Icon = getIcon(service);
              return (
                <motion.article
                  key={service.id}
                  variants={item}
                >
                  <Link
                    to={serviceDetailPath(service.id)}
                    className="flex h-full flex-col rounded-sm border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-gray-200 bg-[#f9f9f9] text-[#800000]">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-sans text-lg font-bold text-[#1a1a1a] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                      {service.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1a1a1a]/80">
                      {service.description || 'Professional service tailored to your needs.'}
                    </p>
                    <span className="mt-4 text-sm font-medium text-[#800000]">Learn more →</span>
                  </Link>
                </motion.article>
              );
            })}
            <motion.article variants={item}>
              <Link
                to={ROUTES.AI}
                className="flex h-full flex-col rounded-sm border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-gray-200 bg-[#800000]/10 text-[#800000]">
                  <Bot className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-sans text-lg font-bold text-[#1a1a1a] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  AI Assistant
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1a1a1a]/80">
                  Instant estimations and structural guidance. Our AI helps you plan your project in seconds.
                </p>
                <span className="mt-4 text-sm font-medium text-[#800000]">Try it free →</span>
              </Link>
            </motion.article>
          </motion.div>
        )}
      </div>
    </section>
  );
}
