import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { LoginPayload, RegisterPayload, AuthSession, MeResponse } from '../types/api';

const AUTH = '/auth';

export const authApi = {
  getMe: () => api.get<MeResponse>(`${AUTH}/me`),

  login: (payload: LoginPayload) =>
    api.post<AuthSession>(`${AUTH}/login`, payload, { skipAuth: true }) as Promise<ApiResponse<AuthSession>>,

  register: (payload: RegisterPayload) =>
    api.post<{ message: string }>(`${AUTH}/register`, payload, { skipAuth: true }),
};
