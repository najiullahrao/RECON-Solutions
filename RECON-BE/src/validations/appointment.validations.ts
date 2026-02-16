import { z } from 'zod';

export const createAppointmentBody = z.object({
  service: z.string().min(1),
  preferred_date: z.string().min(1),
  location: z.string().optional()
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentBody>;
