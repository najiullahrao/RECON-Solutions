import { z } from 'zod';

export const submitConsultationBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  service: z.string().optional(),
  location: z.string().optional(),
  message: z.string().optional()
});

export type SubmitConsultationBody = z.infer<typeof submitConsultationBody>;
