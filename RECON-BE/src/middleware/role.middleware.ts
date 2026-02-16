import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(403).json({ error: 'Profile not found or access denied' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      res.status(403).json({ error: 'Profile not found or access denied' });
      return;
    }

    if (!roles.includes(data.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
};
