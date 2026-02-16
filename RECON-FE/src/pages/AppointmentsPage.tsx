import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { appointmentsApi } from '../api';
import { isApiError } from '../types/api';
import type { CreateAppointmentPayload } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const initialForm: CreateAppointmentPayload = {
  service: '',
  preferred_date: '',
  location: '',
};

export function AppointmentsPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState<CreateAppointmentPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setError(null);
    setLoading(true);
    const res = await appointmentsApi.create({
      service: form.service.trim(),
      preferred_date: form.preferred_date.trim(),
      location: form.location?.trim() || undefined,
    });
    setLoading(false);
    if (isApiError(res)) {
      setError(res.error.message);
      return;
    }
    setSuccess(true);
    setForm(initialForm);
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 px-6 py-10 text-white shadow-lg md:py-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Book an appointment
        </h1>
        <p className="mt-3 max-w-xl text-lg text-amber-100">
          Schedule a site visit or get a quote. Sign in to request a time and we’ll confirm with you shortly.
        </p>
      </section>

      {!isAuthenticated ? (
        <section className="rounded-2xl border border-stone-200 bg-stone-50/80 px-6 py-10 dark:border-stone-700 dark:bg-stone-800/50 md:py-12">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Sign in to book
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              You need an account to request an appointment. Log in or create one below.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="lg">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" size="lg">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Your appointment
            </h2>
            <ul className="mt-4 space-y-3 text-stone-600 dark:text-stone-400">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                Choose a service and your preferred date.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                We’ll confirm availability and send you a confirmation.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                You can view and manage requests under My Appointments.
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50 md:p-8">
              {success && (
                <div
                  className="mb-6 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  role="alert"
                >
                  Appointment requested. We’ll confirm shortly.
                </div>
              )}
              {error && (
                <div
                  className="mb-6 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Request details
                  </h3>
                  <div className="mt-4 space-y-4">
                    <Input
                      label="Service"
                      required
                      value={form.service}
                      onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                      placeholder="e.g. Site assessment, Quote"
                    />
                    <Input
                      label="Preferred date"
                      type="date"
                      required
                      value={form.preferred_date}
                      onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))}
                    />
                    <Input
                      label="Location (optional)"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Address or site"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" loading={loading} size="lg">
                    Request appointment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
