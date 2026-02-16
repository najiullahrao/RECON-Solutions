import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, category, active } = req.query;

  let query = supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    const safe = sanitizeForSearch(search);
    if (safe) query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (category && typeof category === 'string') {
    query = query.eq('category', category);
  }

  if (active !== undefined) {
    query = query.eq('active', active === 'true');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Services list error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(data);
});

router.post('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { name, category, description } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const { data, error } = await supabase
    .from('services')
    .insert({ name, category, description })
    .select()
    .single();

  if (error) {
    console.error('Service create error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.status(201).json(data);
});

router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { name, category, description, active } = req.body;

  const { data, error } = await supabase
    .from('services')
    .update({ name, category, description, active })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Service update error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Service deactivate error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json({ message: 'Service deactivated', data });
});

export default router;
