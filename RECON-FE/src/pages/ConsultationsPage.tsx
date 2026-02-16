import { useState } from 'react';
import { consultationsApi } from '../api';
import { isApiError } from '../types/api';
import type { SubmitConsultationPayload } from '../types/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const initialForm: SubmitConsultationPayload = {
  name: '',
  email: '',
  phone: '',
  service: '',
  location: '',
  message: '',
};

export function ConsultationsPage() {
  const [form, setForm] = useState<SubmitConsultationPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await consultationsApi.submit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service: form.service?.trim() || undefined,
      location: form.location?.trim() || undefined,
      message: form.message?.trim() || undefined,
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
          Request a consultation
        </h1>
        <p className="mt-3 max-w-xl text-lg text-amber-100">
          Tell us about your project. We’ll review your details and get back to you within 1–2 business days.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            What happens next
          </h2>
          <ul className="mt-4 space-y-3 text-stone-600 dark:text-stone-400">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
                We review your request and match it with the right team.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
                Someone will contact you by phone or email to discuss next steps.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
                No obligation—just a conversation to see how we can help.
              </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md dark:border-blue-900/50 dark:bg-stone-800/50 md:p-8 hover:shadow-lg transition-shadow">
            {success && (
              <div
                className="mb-6 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                role="alert"
              >
                Request submitted successfully. We’ll be in touch soon.
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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Contact details
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Project
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Service of interest"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    placeholder="e.g. Renovation, New build"
                  />
                  <Input
                    label="Location"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Project location"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Message
                </label>
                <textarea
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 transition-all"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your project or questions..."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" loading={loading} size="lg">
                  Submit request
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
