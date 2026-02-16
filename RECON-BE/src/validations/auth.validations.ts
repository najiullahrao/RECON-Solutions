import { z } from 'zod';

export const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1)
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type RegisterBody = z.infer<typeof registerBody>;
export type LoginBody = z.infer<typeof loginBody>;
