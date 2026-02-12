import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { APPOINTMENT_STATUSES } from '../constants/index.js';

const router = express.Router();

// User: Create appointment (requires login)
router.post('/', requireAuth, async (req, res) => {
  const { service, preferred_date, location } = req.body;

  if (!service || !preferred_date) {
    return res.status(400).json({ error: 'Service and preferred date are required' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({ 
      user_id: req.user.id, 
      service, 
      preferred_date, 
      location 
    })
    .select()
    .single();

  if (error) {
    console.error('Appointment create error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.status(201).json({ message: 'Appointment requested', data });
});

// User: Get own appointments
router.get('/my', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', req.user.id)
    .order('preferred_date', { ascending: true });

  if (error) {
    console.error('Appointments my list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Admin/Staff: Get all appointments
router.get('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from('appointments')
    .select('*, profiles(full_name)')
    .order('preferred_date', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    console.error('Appointments list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Admin/Staff: Update appointment status
router.patch('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { status } = req.body;

  if (!APPOINTMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Appointment update error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

export default router;