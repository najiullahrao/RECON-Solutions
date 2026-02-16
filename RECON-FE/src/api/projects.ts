import { api } from './client';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/api';

const BASE = '/projects';

export const projectsApi = {
  list: (params?: { search?: string; stage?: string; location?: string; service_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.stage) q.set('stage', params.stage);
    if (params?.location) q.set('location', params.location);
    if (params?.service_id) q.set('service_id', params.service_id);
    const query = q.toString();
    return api.get<Project[]>(query ? `${BASE}?${query}` : BASE);
  },

  getById: (id: string) => api.get<Project>(`${BASE}/${id}`),

  create: (payload: CreateProjectPayload) => api.post<Project>(BASE, payload),

  update: (id: string, payload: UpdateProjectPayload) => api.put<Project>(`${BASE}/${id}`, payload),

  delete: (id: string) => api.delete<{ message: string }>(`${BASE}/${id}`),
};
