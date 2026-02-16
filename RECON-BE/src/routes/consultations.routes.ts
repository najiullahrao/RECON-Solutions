import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';
import { CONSULTATION_STATUSES } from '../constants/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, service, location, message } = req.body;

  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Name, email, and phone are required' });
    return;
  }

  const { data, error } = await supabase
    .from('consultations')
    .insert({ name, email, phone, service, location, message })
    .select()
    .single();

  if (error) {
    console.error('Consultation submit error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.status(201).json({ message: 'Consultation request submitted', data });
});

router.get('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status, search, from_date, to_date } = req.query;

  let query = supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && typeof status === 'string') {
    query = query.eq('status', status);
  }

  if (search) {
    const safe = sanitizeForSearch(search);
    if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  if (from_date && typeof from_date === 'string') {
    query = query.gte('created_at', from_date);
  }

  if (to_date && typeof to_date === 'string') {
    query = query.lte('created_at', to_date);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Consultations list error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.patch('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status } = req.body as { status?: string };

  if (!status || !(CONSULTATION_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const { data, error } = await supabase
    .from('consultations')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Consultation update error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.get('/my', requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Consultations my list error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

export default router;
