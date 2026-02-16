import { api } from './client';
import type { Appointment, CreateAppointmentPayload } from '../types/api';

const BASE = '/appointments';

export const appointmentsApi = {
  create: (payload: CreateAppointmentPayload) => api.post<Appointment>(BASE, payload),

  listMy: () => api.get<Appointment[]>(`${BASE}/my`),

  list: (params?: { status?: string | string[] }) => {
    const q = new URLSearchParams();
    if (params?.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      statuses.forEach((s) => q.append('status', s));
    }
    const query = q.toString();
    return api.get<Appointment[]>(query ? `${BASE}?${query}` : BASE);
  },

  updateStatus: (id: string, status: string) =>
    api.patch<Appointment>(`${BASE}/${id}`, { status }),
};
