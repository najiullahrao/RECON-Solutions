import { env } from '../config/env';
import type { ApiError, ApiResponse } from '../types/api';

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

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { skipAuth, ...init } = options;
  const url = `${env.apiBase}${path}`;
  const headers = new Headers(init.headers as HeadersInit);

  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as ApiResponse<T> | ApiError;

  if (!res.ok) {
    const err = json as ApiError & { error?: string };
    const message =
      typeof err?.error === 'string'
        ? err.error
        : (err?.error as { message?: string } | undefined)?.message ?? 'Request failed';
    return {
      error: {
        message,
        code: typeof err?.error === 'object' && err?.error && 'code' in err?.error ? (err.error as { code?: string }).code : undefined,
      },
    };
  }

  return json as ApiResponse<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit & { skipAuth?: boolean }) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
