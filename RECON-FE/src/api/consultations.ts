import { api } from './client';
import type { Consultation, SubmitConsultationPayload } from '../types/api';

const BASE = '/consultations';

export const consultationsApi = {
  submit: (payload: SubmitConsultationPayload) =>
    api.post<Consultation>(BASE, payload),

  list: (params?: { status?: string | string[]; search?: string; from_date?: string; to_date?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      statuses.forEach((s) => q.append('status', s));
    }
    if (params?.search) q.set('search', params.search);
    if (params?.from_date) q.set('from_date', params.from_date);
    if (params?.to_date) q.set('to_date', params.to_date);
    const query = q.toString();
    return api.get<Consultation[]>(query ? `${BASE}?${query}` : BASE);
  },

  listMy: () => api.get<Consultation[]>(`${BASE}/my`),

  updateStatus: (id: string, status: string) =>
    api.patch<Consultation>(`${BASE}/${id}`, { status }),
};
