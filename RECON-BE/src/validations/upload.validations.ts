import { z } from 'zod';

export const deleteImageParams = z.object({
  public_id: z.string().min(1)
});
