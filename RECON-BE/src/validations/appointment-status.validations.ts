import { z } from 'zod';

export const appointmentIdParam = z.object({
  id: z.string().uuid()
});

export const updateAppointmentStatusBody = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
});
