import { z } from 'zod';

export const createServiceBody = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional()
});

export const updateServiceBody = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional()
});

export const serviceIdParam = z.object({
  id: z.string().uuid()
});

export type CreateServiceBody = z.infer<typeof createServiceBody>;
export type UpdateServiceBody = z.infer<typeof updateServiceBody>;
