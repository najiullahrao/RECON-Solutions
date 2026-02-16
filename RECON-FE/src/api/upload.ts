import { env } from '../config/env';
import type { ApiResponse } from '../types/api';

const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem('recon_session');
    if (!raw) return null;
    const stored = JSON.parse(raw) as { session?: { access_token?: string } };
    return stored?.session?.access_token ?? null;
  } catch {
    return null;
  }
};

export interface UploadImageResult {
  url: string;
  public_id: string;
}

async function uploadRequest<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  const url = `${env.apiBase}${path}`;
  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Do not set Content-Type so browser sets multipart/form-data with boundary

  const res = await fetch(url, { method: 'POST', headers, body });
  const json = (await res.json().catch(() => ({}))) as ApiResponse<T> | { error?: { message?: string } };

  if (!res.ok) {
    const err = json as { error?: { message?: string } };
    return {
      error: {
        message: err?.error?.message ?? 'Upload failed',
      },
    };
  }
  return json as ApiResponse<T>;
}

export const uploadApi = {
  /** Upload a single image; returns url and public_id. */
  uploadImage: (file: File): Promise<ApiResponse<{ message?: string; url: string; public_id: string }>> =>
    (async () => {
      const form = new FormData();
      form.append('image', file);
      return uploadRequest<{ message?: string; url: string; public_id: string }>('/upload/image', form);
    })(),

  /** Upload multiple images (max 10); returns array of { url, public_id }. */
  uploadImages: (files: File[]): Promise<ApiResponse<{ message?: string; images: UploadImageResult[] }>> =>
    (async () => {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      return uploadRequest<{ message?: string; images: UploadImageResult[] }>('/upload/images', form);
    })(),

  /** Delete image from storage by public_id. */
  deleteImage: (publicId: string): Promise<ApiResponse<{ message?: string }>> =>
    fetch(`${env.apiBase}/upload/image/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '',
      },
    }).then(async (res) => {
      const json = (await res.json().catch(() => ({}))) as ApiResponse<{ message?: string }> | { error?: { message?: string } };
      if (!res.ok) {
        const err = json as { error?: { message?: string } };
        return { error: { message: err?.error?.message ?? 'Delete failed' } };
      }
      return json as ApiResponse<{ message?: string }>;
    }),
};
