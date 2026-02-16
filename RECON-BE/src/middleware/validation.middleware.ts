import type { Request, Response, NextFunction } from 'express';
import type { z, ZodSchema } from 'zod';
import * as response from '../utils/response.js';

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data as z.infer<T>;
      next();
      return;
    }
    const first = parsed.error.flatten().fieldErrors;
    const message = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('; ') || parsed.error.message;
    response.error(res, message, 400, 'VALIDATION_ERROR');
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (parsed.success) {
      (req as unknown as { query: z.infer<T> }).query = parsed.data;
      next();
      return;
    }
    const first = parsed.error.flatten().fieldErrors;
    const message = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('; ') || parsed.error.message;
    response.error(res, message, 400, 'VALIDATION_ERROR');
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (parsed.success) {
      Object.assign(req.params, parsed.data);
      next();
      return;
    }
    const first = parsed.error.flatten().fieldErrors;
    const message = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('; ') || parsed.error.message;
    response.error(res, message, 400, 'VALIDATION_ERROR');
  };
}
