import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, servicesApi, uploadApi } from '../api';
import { isApiError } from '../types/api';
import type { Project, Service, CreateProjectPayload } from '../types/api';
import { projectDetailPath } from '../constants/routes';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function ProjectsPage() {
  const { canManageProjects } = useProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateProjectPayload>({
    title: '',
    service_id: undefined,
    location: '',
    stage: '',
    description: '',
    images: [],
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = () => {
    setLoading(true);
    projectsApi
      .list({ search: search || undefined, stage: stage || undefined })
      .then((res) => {
        if (isApiError(res)) {
          setProjects([]);
          return;
        }
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    projectsApi
      .list({ search: search || undefined, stage: stage || undefined })
      .then((res) => {
        if (cancelled) return;
        if (isApiError(res)) {
          setProjects([]);
          return;
        }
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, stage]);

  useEffect(() => {
    if (!canManageProjects || !modalOpen) return;
    servicesApi.list({ active: true }).then((res) => {
      if (!isApiError(res) && Array.isArray(res.data)) setServices(res.data);
    });
  }, [canManageProjects, modalOpen]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 10 - (form.images?.length ?? 0));
    if (list.length === 0) return;
    setImageUploading(true);
    const res = await uploadApi.uploadImages(list);
    setImageUploading(false);
    e.target.value = '';
    if (isApiError(res)) {
      setSubmitError(res.error.message);
      return;
    }
    const urls = (res.data as { images?: { url: string }[] }).images?.map((i) => i.url) ?? [];
    setForm((f) => ({ ...f, images: [...(f.images ?? []), ...urls] }));
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: (f.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);
    const res = await projectsApi.create({
      title: form.title.trim(),
      service_id: form.service_id || undefined,
      location: form.location?.trim() || undefined,
      stage: form.stage?.trim() || undefined,
      description: form.description?.trim() || undefined,
      images: form.images?.length ? form.images : undefined,
    });
    setSubmitLoading(false);
    if (isApiError(res)) {
      setSubmitError(res.error.message);
      return;
    }
    setModalOpen(false);
    setForm({ title: '', service_id: undefined, location: '', stage: '', description: '', images: [] });
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Projects</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            Our portfolio of completed and ongoing work.
          </p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setModalOpen(true)} className="shrink-0">
            Add project
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[160px]">
          <Input
            label="Stage"
            placeholder="e.g. planning, active"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-stone-600 dark:text-stone-400">No projects found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to={projectDetailPath(p.id)} className="block">
              <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800/50">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardContent>
                  {p.stage && (
                    <span className="text-xs font-medium uppercase text-blue-600 dark:text-blue-400">
                      {p.stage}
                    </span>
                  )}
                  <h3 className="mt-1 font-semibold text-stone-900 dark:text-stone-100">{p.title}</h3>
                  {p.location && (
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{p.location}</p>
                  )}
                  {p.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">View details →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add project">
        <form onSubmit={handleCreate} className="space-y-4">
          {submitError && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300" role="alert">
              {submitError}
            </p>
          )}
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Project title"
          />
          {services.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Service</label>
              <select
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 transition-all"
                value={form.service_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value || undefined }))}
              >
                <option value="">None</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Location"
          />
          <Input
            label="Stage"
            value={form.stage}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
            placeholder="e.g. planning, active, completed"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 transition-all"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Project description"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <div className="flex flex-wrap gap-2">
              {(form.images ?? []).map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(form.images?.length ?? 0) < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-500 dark:border-stone-600 dark:text-stone-400"
                >
                    {imageUploading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      '+'
                    )}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Up to 10 images. Click + to add.</p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={submitLoading}>
              Create project
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
