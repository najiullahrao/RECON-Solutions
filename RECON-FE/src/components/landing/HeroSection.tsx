import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes';

export function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] overflow-hidden bg-[#1a1a1a] text-white md:min-h-[90vh]"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/95 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 py-20 md:min-h-[90vh] md:flex-row md:items-center md:justify-between md:gap-12 md:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <motion.h1
            id="hero-heading"
            className="font-sans text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.02em', color: 'white' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Building the Future with Precision & Intelligence
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-white/85 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            From concept to completion, we deliver engineering and construction excellence with data-driven planning and expert execution.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <Link
              to={ROUTES.PROJECTS}
              className="inline-flex items-center justify-center rounded-sm border-none bg-[#800000] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#6b0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
            >
              Explore Projects
            </Link>
            <Link
              to={ROUTES.AI}
              className="inline-flex items-center justify-center rounded-sm border border-white/60 bg-transparent px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
            >
              Try AI Assistant
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="mt-12 hidden aspect-[4/3] max-w-lg flex-1 overflow-hidden rounded-sm border border-white/10 md:mt-0 md:block"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          aria-hidden
        >
          <img
            src="/contruction.jpg"
            alt="Construction and engineering"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
