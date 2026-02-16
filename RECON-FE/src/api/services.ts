import { api } from './client';
import type { Service, CreateServicePayload, UpdateServicePayload } from '../types/api';

const BASE = '/services';

export const servicesApi = {
  list: (params?: { search?: string; category?: string; active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.active !== undefined) q.set('active', String(params.active));
    const query = q.toString();
    return api.get<Service[]>(query ? `${BASE}?${query}` : BASE);
  },

  getById: (id: string) => api.get<Service>(`${BASE}/${id}`),

  create: (payload: CreateServicePayload) => api.post<Service>(BASE, payload),

  update: (id: string, payload: UpdateServicePayload) => api.put<Service>(`${BASE}/${id}`, payload),

  delete: (id: string) => api.delete<{ message: string }>(`${BASE}/${id}`),
};
