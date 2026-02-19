import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-sm bg-[#800000] px-6 py-12 text-white relative overflow-hidden md:py-16">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
            RECON Solutions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            Construction and professional services you can trust. From planning to completion, we deliver quality and reliability.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={ROUTES.SERVICES}>
              <Button variant="secondary" size="lg" className="bg-white text-[#800000] hover:bg-[#f9f9f9] border-white">
                Our Services
              </Button>
            </Link>
            <Link to={ROUTES.CONSULTATIONS}>
              <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
                Request Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>What we offer</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>🔧</span>
              <h3 className="mt-3 font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>Services</h3>
              <p className="mt-1 text-sm text-[#1a1a1a]/80">
                Browse our construction and maintenance services.
              </p>
              <Link to={ROUTES.SERVICES} className="mt-4 text-sm font-medium text-[#800000] hover:text-[#6b0000] transition-colors">
                View services →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>🏗️</span>
              <h3 className="mt-3 font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>Projects</h3>
              <p className="mt-1 text-sm text-[#1a1a1a]/80">
                Explore our completed and ongoing projects.
              </p>
              <Link to={ROUTES.PROJECTS} className="mt-4 text-sm font-medium text-[#800000] hover:text-[#6b0000] transition-colors">
                View projects →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>📅</span>
              <h3 className="mt-3 font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>Appointments</h3>
              <p className="mt-1 text-sm text-[#1a1a1a]/80">
                Book an appointment for a site visit or quote.
              </p>
              <Link to={ROUTES.APPOINTMENTS} className="mt-4 text-sm font-medium text-[#800000] hover:text-[#6b0000] transition-colors">
                Book now →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-sm border border-gray-200 bg-[#f9f9f9] p-6">
        <h2 className="text-xl font-bold text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>Get in touch</h2>
        <p className="mt-2 text-[#1a1a1a]/80">
          Request a free consultation or use our AI assistant for quick answers.
        </p>
        <div className="mt-4 flex gap-4">
          <Link to={ROUTES.CONSULTATIONS}>
            <Button variant="primary">Request consultation</Button>
          </Link>
          <Link to={ROUTES.AI}>
            <Button variant="secondary">AI Assistant</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
