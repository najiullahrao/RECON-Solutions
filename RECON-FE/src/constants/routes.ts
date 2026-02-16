export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  CONSULTATIONS: '/consultations',
  APPOINTMENTS: '/appointments',
  AI: '/ai',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MY_CONSULTATIONS: '/consultations/my',
  MY_APPOINTMENTS: '/appointments/my',
  ADMIN_CONSULTATIONS: '/admin/consultations',
  ADMIN_APPOINTMENTS: '/admin/appointments',
  PROFILE: '/profile',
} as const;

export function serviceDetailPath(id: string): string {
  return `/services/${id}`;
}

export function projectDetailPath(id: string): string {
  return `/projects/${id}`;
}
