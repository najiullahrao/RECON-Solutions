import { z } from 'zod';

export const consultationIdParam = z.object({
  id: z.string().uuid()
});

export const updateConsultationStatusBody = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
});
