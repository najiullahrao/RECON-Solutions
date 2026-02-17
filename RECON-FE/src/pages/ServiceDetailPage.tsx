import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { servicesApi } from '../api';
import { isApiError } from '../types/api';
import type { Service, UpdateServicePayload } from '../types/api';
import { ROUTES } from '../constants/routes';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageServices } = useProfile();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateServicePayload>({ name: '', category: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchService = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    servicesApi.getById(id).then((res) => {
      if (isApiError(res)) {
        setError(res.error.message);
        setService(null);
      } else {
        setService(res.data);
        setEditForm({
          name: res.data.name,
          category: res.data.category ?? '',
          description: res.data.description ?? '',
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchService();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditLoading(true);
    const res = await servicesApi.update(id, {
      name: editForm.name?.trim() || service?.name,
      category: editForm.category?.trim() || undefined,
      description: editForm.description?.trim() || undefined,
    });
    setEditLoading(false);
    if (isApiError(res)) return;
    setEditOpen(false);
    fetchService();
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    const res = await servicesApi.delete(id);
    setDeleteLoading(false);
    if (isApiError(res)) return;
    navigate(ROUTES.SERVICES);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 dark:text-red-400">{error ?? 'Service not found.'}</p>
        <Link to={ROUTES.SERVICES}>
          <Button variant="secondary">Back to services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={ROUTES.SERVICES} className="text-sm font-medium text-amber-600 hover:underline">
          ← Back to services
        </Link>
        {canManageServices && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="primary" size="sm" onClick={() => setDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          {service.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {service.category}
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {service.name}
          </h1>
          {service.description && (
            <p className="mt-4 text-stone-600 dark:text-stone-400">{service.description}</p>
          )}
          {service.active === false && (
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">This service is currently inactive.</p>
          )}
        </CardContent>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit service">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Category"
            value={editForm.category}
            onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={editLoading}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete service">
        <p className="text-stone-600 dark:text-stone-400">
          Are you sure you want to delete &quot;{service.name}&quot;? This will deactivate the service.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" loading={deleteLoading} onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
