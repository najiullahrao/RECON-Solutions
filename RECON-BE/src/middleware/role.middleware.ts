import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import * as response from '../utils/response.js';

export const requireRole = (roles: string[]) => {
  const allowed = roles.map((r) => r.toUpperCase());
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      response.error(res, 'Profile not found or access denied', 403, 'FORBIDDEN');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      response.error(res, 'Profile not found or access denied', 403, 'FORBIDDEN');
      return;
    }

    const userRole = (data.role ?? '').toString().toUpperCase();
    if (!allowed.includes(userRole)) {
      response.error(res, 'Forbidden', 403, 'FORBIDDEN');
      return;
    }

    next();
  };
};
