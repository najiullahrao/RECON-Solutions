/** User roles (profiles.role) */
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES);

/** Consultation request statuses */
export const CONSULTATION_STATUSES = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
] as const;

/** Appointment statuses */
export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
] as const;
