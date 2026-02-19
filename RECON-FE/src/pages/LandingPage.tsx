import { motion } from 'framer-motion';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import {
  HeroSection,
  CoreServicesSection,
  AiAssistantSection,
  ProjectsGallerySection,
  ConsultationFooter,
} from '../components/landing';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  transition: { duration: 0.5 },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      <GlobalHeader />
      <main id="main-content" role="main">
        <HeroSection />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeIn}
        >
          <CoreServicesSection />
        </motion.div>
        <AiAssistantSection />
        <ProjectsGallerySection />
        <ConsultationFooter />
      </main>
    </div>
  );
}
