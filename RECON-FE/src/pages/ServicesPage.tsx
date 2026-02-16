import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../api';
import { isApiError } from '../types/api';
import type { Service, CreateServicePayload } from '../types/api';
import { serviceDetailPath } from '../constants/routes';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function ServicesPage() {
  const { canManageServices } = useProfile();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateServicePayload>({ name: '', category: '', description: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    servicesApi
      .list({ search: search || undefined, active: true })
      .then((res) => {
        if (isApiError(res)) {
          setServices([]);
          return;
        }
        setServices(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    servicesApi
      .list({ search: search || undefined, active: true })
      .then((res) => {
        if (cancelled) return;
        if (isApiError(res)) {
          setServices([]);
          return;
        }
        setServices(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);
    const res = await servicesApi.create({
      name: form.name.trim(),
      category: form.category?.trim() || undefined,
      description: form.description?.trim() || undefined,
    });
    setSubmitLoading(false);
    if (isApiError(res)) {
      setSubmitError(res.error.message);
      return;
    }
    setModalOpen(false);
    setForm({ name: '', category: '', description: '' });
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Our Services</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            Professional construction and maintenance services.
          </p>
        </div>
        {canManageServices && (
          <Button onClick={() => setModalOpen(true)} className="shrink-0">
            Add service
          </Button>
        )}
      </div>
      <div className="max-w-md">
        <Input
          label="Search services"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-stone-600 dark:text-stone-400">No services found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.id} to={serviceDetailPath(s.id)} className="block">
              <Card className="flex h-full flex-col transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800/50">
                <CardContent className="flex-1">
                  {s.category && (
                    <span className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {s.category}
                    </span>
                  )}
                  <h3 className="mt-1 font-semibold text-stone-900 dark:text-stone-100">{s.name}</h3>
                  {s.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">{s.description}</p>
                  )}
                  <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">View details →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add service">
        <form onSubmit={handleCreate} className="space-y-4">
          {submitError && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300" role="alert">
              {submitError}
            </p>
          )}
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Service name"
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Renovation"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 transition-all"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={submitLoading}>
              Create service
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
