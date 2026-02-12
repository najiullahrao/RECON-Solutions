/** User roles (profiles.role) */
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER'
};

export const ROLE_VALUES = Object.values(ROLES);

/** Consultation request statuses */
export const CONSULTATION_STATUSES = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
];

/** Appointment statuses */
export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
];
