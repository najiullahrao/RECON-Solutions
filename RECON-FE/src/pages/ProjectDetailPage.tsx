import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi, servicesApi, uploadApi } from '../api';
import { isApiError } from '../types/api';
import type { Project, Service, UpdateProjectPayload } from '../types/api';
import { ROUTES } from '../constants/routes';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageProjects, isAdmin } = useProfile();
  const [project, setProject] = useState<Project | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateProjectPayload>({ title: '', service_id: undefined, location: '', stage: '', description: '', images: [] });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProject = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    projectsApi.getById(id).then((res) => {
      if (isApiError(res)) {
        setError(res.error.message);
        setProject(null);
      } else {
        setProject(res.data);
        setEditForm({
          title: res.data.title,
          service_id: res.data.service_id,
          location: res.data.location ?? '',
          stage: res.data.stage ?? '',
          description: res.data.description ?? '',
          images: res.data.images ?? [],
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
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!canManageProjects || !editOpen) return;
    servicesApi.list({ active: true }).then((res) => {
      if (!isApiError(res) && Array.isArray(res.data)) setServices(res.data);
    });
  }, [canManageProjects, editOpen]);

  useEffect(() => {
    if (editOpen && project) {
      setEditForm({
        title: project.title,
        service_id: project.service_id,
        location: project.location ?? '',
        stage: project.stage ?? '',
        description: project.description ?? '',
        images: project.images ?? [],
      });
    }
  }, [editOpen, project]);

  const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const current = editForm.images ?? [];
    const list = Array.from(files).slice(0, 10 - current.length);
    if (list.length === 0) return;
    setImageUploading(true);
    const res = await uploadApi.uploadImages(list);
    setImageUploading(false);
    e.target.value = '';
    if (isApiError(res)) return;
    const urls = (res.data as { images?: { url: string }[] }).images?.map((i) => i.url) ?? [];
    setEditForm((f) => ({ ...f, images: [...(f.images ?? []), ...urls] }));
  };

  const removeEditImage = (index: number) => {
    setEditForm((f) => ({
      ...f,
      images: (f.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditLoading(true);
    const res = await projectsApi.update(id, {
      title: editForm.title?.trim() || project?.title,
      service_id: editForm.service_id,
      location: editForm.location?.trim() || undefined,
      stage: editForm.stage?.trim() || undefined,
      description: editForm.description?.trim() || undefined,
      images: editForm.images,
    });
    setEditLoading(false);
    if (isApiError(res)) return;
    setEditOpen(false);
    fetchProject();
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    const res = await projectsApi.delete(id);
    setDeleteLoading(false);
    if (isApiError(res)) return;
    navigate(ROUTES.PROJECTS);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 dark:text-red-400">{error ?? 'Project not found.'}</p>
        <Link to={ROUTES.PROJECTS}>
          <Button variant="outline">Back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={ROUTES.PROJECTS} className="text-sm font-medium text-amber-600 hover:underline">
          ← Back to projects
        </Link>
        {canManageProjects && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
      <Card className="overflow-hidden">
        {project.images && project.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto p-4 pb-0">
            {project.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-64 w-auto shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        <CardContent>
          {project.stage && (
            <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {project.stage}
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {project.title}
          </h1>
          {project.location && (
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              <span className="font-medium text-stone-700 dark:text-stone-300">Location:</span>{' '}
              {project.location}
            </p>
          )}
          {project.description && (
            <p className="mt-4 text-stone-600 dark:text-stone-400">{project.description}</p>
          )}
        </CardContent>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Title"
            required
            value={editForm.title}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
          />
          {services.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Service</label>
              <select
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                value={editForm.service_id ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, service_id: e.target.value || undefined }))}
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
            value={editForm.location}
            onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="Stage"
            value={editForm.stage}
            onChange={(e) => setEditForm((f) => ({ ...f, stage: e.target.value }))}
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
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleEditImageSelect}
            />
            <div className="flex flex-wrap gap-2">
              {(editForm.images ?? []).map((url, i) => (
                <div key={`${url}-${i}`} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeEditImage(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(editForm.images?.length ?? 0) < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-500 dark:border-stone-600 dark:text-stone-400"
                >
                  {imageUploading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  ) : (
                    '+'
                  )}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Up to 10 images. Click + to add.</p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={editLoading}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete project">
        <p className="text-stone-600 dark:text-stone-400">
          Are you sure you want to delete &quot;{project.title}&quot;? This cannot be undone.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
