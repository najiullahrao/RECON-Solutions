import { api } from './client';
import type { AskPayload, ChatPayload } from '../types/api';

const BASE = '/ai';

export const aiApi = {
  ask: (payload: AskPayload) =>
    api.post<{ answer?: string }>(`${BASE}/ask`, payload, { skipAuth: true }),

  chat: (payload: ChatPayload) =>
    api.post<{ response?: string; timestamp?: string }>(`${BASE}/chat`, payload, { skipAuth: true }),
};
