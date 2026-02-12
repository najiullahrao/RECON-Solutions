import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';
import { CONSULTATION_STATUSES } from '../constants/index.js';

const router = express.Router();

// Public: Submit consultation request
router.post('/', async (req, res) => {
  const { name, email, phone, service, location, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  const { data, error } = await supabase
    .from('consultations')
    .insert({ name, email, phone, service, location, message })
    .select()
    .single();

  if (error) {
    console.error('Consultation submit error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.status(201).json({ message: 'Consultation request submitted', data });
});

// Admin/Staff: Get all consultations with filters
router.get('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status, search, from_date, to_date } = req.query;

  let query = supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    const safe = sanitizeForSearch(search);
    if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  if (from_date) {
    query = query.gte('created_at', from_date);
  }

  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Consultations list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Admin/Staff: Update consultation status
router.patch('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status } = req.body;

  if (!CONSULTATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('consultations')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Consultation update error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// User: Get own consultations (if logged in)
router.get('/my', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Consultations my list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

export default router;