/**
 * Frontend environment configuration.
 * API base URL (no trailing slash):
 * - If VITE_API_URL is set, use it (dev or production).
 * - In dev with no env: use /api (Vite proxy → localhost:5000).
 * - In production with no env: same origin (set VITE_API_URL for a deployed backend).
 */
const getApiBase = (): string => {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (url && url.trim() !== '') return url.replace(/\/$/, '');
  if (import.meta.env.DEV) return '/api';
  return '';
};

export const env = {
  apiBase: getApiBase(),
} as const;
