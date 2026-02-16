import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { registerBody, loginBody } from '../validations/auth.validations.js';
import * as response from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  if (!req.user) {
    response.error(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    return;
  }
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', req.user.id)
    .single();
  if (error || !profile) {
    response.success(res, { user: { id: req.user.id, email: req.user.email }, profile: { role: 'USER' } });
    return;
  }
  response.success(res, {
    user: { id: req.user.id, email: req.user.email },
    profile: { id: profile.id, full_name: profile.full_name, role: profile.role ?? 'USER' },
  });
});

router.post('/register', validateBody(registerBody), async (req, res) => {
  const result = await authService.register(req.body);
  if ('error' in result) {
    const status = result.error === 'Registration failed' ? 500 : 400;
    return response.error(res, result.error, status);
  }
  response.success(res, { message: 'Registered successfully' }, 201);
});

router.post('/login', validateBody(loginBody), async (req, res) => {
  const result = await authService.login(req.body);
  if ('error' in result) {
    return response.error(res, result.error, 401);
  }
  response.success(res, result.data);
});

export default router;
