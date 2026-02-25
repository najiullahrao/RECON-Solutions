import { z } from 'zod';

export const estimatorBody = z.object({
  projectType: z.enum(['renovation', 'new_construction', 'extension', 'interior', 'exterior']),
  area: z.number().positive(),          // in square feet or marla
  areaUnit: z.enum(['sqft', 'marla']).default('marla'),
  location: z.string().min(1),
  quality: z.enum(['basic', 'standard', 'premium']).default('standard'),
  floors: z.number().int().min(1).max(10).default(1),
  additionalNotes: z.string().optional(),
});

export type EstimatorBody = z.infer<typeof estimatorBody>;