/**
 * Shared API response and entity types aligned with backend.
 */

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: { message: string; code?: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return 'error' in res && res.error != null;
}

// Auth
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthSession {
  user: { id: string; email?: string };
  session: { access_token: string };
}

export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface MeResponse {
  user: { id: string; email?: string };
  profile: { id?: string; full_name?: string; role: UserRole };
}

// Services
export interface Service {
  id: string;
  name: string;
  category?: string;
  description?: string;
  active?: boolean;
  created_at?: string;
}

export interface CreateServicePayload {
  name: string;
  category?: string;
  description?: string;
}

export interface UpdateServicePayload {
  name?: string;
  category?: string;
  description?: string;
  active?: boolean;
}

// Projects
export interface Project {
  id: string;
  title: string;
  service_id?: string;
  location?: string;
  stage?: string;
  description?: string;
  images?: string[];
  created_at?: string;
}

export interface CreateProjectPayload {
  title: string;
  service_id?: string;
  location?: string;
  stage?: string;
  description?: string;
  images?: string[];
}

export interface UpdateProjectPayload {
  title?: string;
  service_id?: string;
  location?: string;
  stage?: string;
  description?: string;
  images?: string[];
}

// Consultations
export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  service?: string;
  location?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface SubmitConsultationPayload {
  name: string;
  email: string;
  phone: string;
  service?: string;
  location?: string;
  message?: string;
}

// Appointments
export interface Appointment {
  id: string;
  user_id: string;
  service: string;
  preferred_date: string;
  location?: string;
  status?: string;
  created_at?: string;
}

export interface CreateAppointmentPayload {
  service: string;
  preferred_date: string;
  location?: string;
}

// AI
export interface AskPayload {
  question: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatPayload {
  messages: ChatMessage[];
}

// Analytics
export interface AnalyticsStats {
  overview: { totalProjects: number; totalConsultations: number; totalAppointments: number };
  projects: { byStage: Record<string, number> };
  consultations: { byStatus: Record<string, number>; last30Days: number };
  appointments: { byStatus: Record<string, number>; last30Days: number };
}

export type AnalyticsTrends = Record<string, { consultations: number; appointments: number }>;

export interface PopularService {
  service: string;
  count: number;
}
