import { supabase } from '../config/supabase.js';

export const requireRole = (roles) => async (req, res, next) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || !data) {
    return res.status(403).json({ error: 'Profile not found or access denied' });
  }

  if (!roles.includes(data.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
