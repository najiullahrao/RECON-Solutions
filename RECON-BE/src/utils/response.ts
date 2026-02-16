import type { Response } from 'express';

export function success(res: Response, data: unknown, status = 200): void {
  res.status(status).json({ data });
}

export function error(res: Response, message: string, status = 500, code?: string): void {
  res.status(status).json({ error: { message, ...(code && { code }) } });
}

export function paginated(res: Response, data: unknown[], meta: { total: number; page?: number; limit?: number }): void {
  res.status(200).json({ data, meta });
}
