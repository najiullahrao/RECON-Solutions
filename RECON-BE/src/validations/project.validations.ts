import { z } from 'zod';

const uuidOptional = z.string().uuid().optional();

export const createProjectBody = z.object({
  title: z.string().min(1),
  service_id: uuidOptional,
  location: z.string().optional(),
  stage: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional()
});

export const updateProjectBody = z.object({
  title: z.string().min(1).optional(),
  service_id: uuidOptional,
  location: z.string().optional(),
  stage: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional()
});

export const projectIdParam = z.object({
  id: z.string().uuid()
});

export type CreateProjectBody = z.infer<typeof createProjectBody>;
export type UpdateProjectBody = z.infer<typeof updateProjectBody>;
