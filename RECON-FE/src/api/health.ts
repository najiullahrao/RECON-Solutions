import { api } from './client';

export const healthApi = {
  check: () => api.get<{ status: string; timestamp: string }>('/health'),
};
