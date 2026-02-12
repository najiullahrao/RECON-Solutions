import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';

const router = express.Router();

// Get all services with search and filters
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

  if (category) {
    query = query.eq('category', category);
  }

  if (active !== undefined) {
    query = query.eq('active', active === 'true');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Services list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Public: Get single service
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Service not found' });
  res.json(data);
});

// Admin only: Create service
router.post('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { name, category, description } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const { data, error } = await supabase
    .from('services')
    .insert({ name, category, description })
    .select()
    .single();

  if (error) {
    console.error('Service create error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.status(201).json(data);
});

// Admin only: Update service
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
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Admin only: Delete service (soft delete)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Service deactivate error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json({ message: 'Service deactivated', data });
});

export default router;