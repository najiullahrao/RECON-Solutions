import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, stage, location, service_id } = req.query;

  let query = supabase
    .from('projects')
    .select('*, services(name)')
    .order('created_at', { ascending: false });

  if (search) {
    const safe = sanitizeForSearch(search);
    if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (stage && typeof stage === 'string') {
    query = query.eq('stage', stage);
  }

  if (location) {
    const safe = sanitizeForSearch(location);
    if (safe) query = query.ilike('location', `%${safe}%`);
  }

  if (service_id && typeof service_id === 'string') {
    query = query.eq('service_id', service_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Projects list error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, services(name)')
    .eq('id', req.params.id)
    .single();

  if (error) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(data);
});

router.post('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { title, service_id, location, stage, description, images } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      title,
      service_id,
      location,
      stage,
      description,
      images: Array.isArray(images) ? images : []
    })
    .select()
    .single();

  if (error) {
    console.error('Project create error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.status(201).json(data);
});

router.put('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { title, service_id, location, stage, description, images } = req.body;

  const payload: Record<string, unknown> = {};
  if (title !== undefined) payload.title = title;
  if (service_id !== undefined) payload.service_id = service_id;
  if (location !== undefined) payload.location = location;
  if (stage !== undefined) payload.stage = stage;
  if (description !== undefined) payload.description = description;
  if (images !== undefined) payload.images = Array.isArray(images) ? images : [];

  if (Object.keys(payload).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json(data);
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { error } = await supabase.from('projects').delete().eq('id', req.params.id);

  if (error) {
    console.error('Project delete error:', error);
    res.status(500).json({ error: 'Something went wrong' });
    return;
  }
  res.json({ message: 'Project deleted' });
});

export default router;
