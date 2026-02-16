import { z } from 'zod';

export const askBody = z.object({
  question: z.string().min(1)
});

export const chatBody = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).min(1)
});

export type AskBody = z.infer<typeof askBody>;
export type ChatBody = z.infer<typeof chatBody>;
