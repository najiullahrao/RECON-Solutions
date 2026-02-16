import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-12 text-white shadow-xl relative overflow-hidden md:py-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            RECON Solutions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Construction and professional services you can trust. From planning to completion, we deliver quality and reliability.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={ROUTES.SERVICES}>
              <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 border-white shadow-lg hover:shadow-xl">
                Our Services
              </Button>
            </Link>
            <Link to={ROUTES.CONSULTATIONS}>
              <Button variant="outline" size="lg" className="border-blue-200 text-white hover:bg-blue-500/20 backdrop-blur-sm">
                Request Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">What we offer</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>🔧</span>
              <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">Services</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Browse our construction and maintenance services.
              </p>
              <Link to={ROUTES.SERVICES} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                View services →
              </Link>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>🏗️</span>
              <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">Projects</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Explore our completed and ongoing projects.
              </p>
              <Link to={ROUTES.PROJECTS} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                View projects →
              </Link>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col">
              <span className="text-3xl" aria-hidden>📅</span>
              <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">Appointments</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Book an appointment for a site visit or quote.
              </p>
              <Link to={ROUTES.APPOINTMENTS} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                Book now →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md dark:border-blue-800/50 dark:from-blue-950/30 dark:to-stone-800/50">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Get in touch</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Request a free consultation or use our AI assistant for quick answers.
        </p>
        <div className="mt-4 flex gap-4">
          <Link to={ROUTES.CONSULTATIONS}>
            <Button variant="primary">Request consultation</Button>
          </Link>
          <Link to={ROUTES.AI}>
            <Button variant="outline">AI Assistant</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
