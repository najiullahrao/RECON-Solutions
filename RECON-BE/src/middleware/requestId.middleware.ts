import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  const existing = req.headers['x-request-id'];
  (req as { id?: string }).id = Array.isArray(existing) ? existing[0] : (existing as string | undefined) ?? randomUUID();
  next();
}
