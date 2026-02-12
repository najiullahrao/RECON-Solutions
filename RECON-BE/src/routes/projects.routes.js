import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';

const router = express.Router();

// Get all projects with search and filters
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

  if (stage) {
    query = query.eq('stage', stage);
  }

  if (location) {
    const safe = sanitizeForSearch(location);
    if (safe) query = query.ilike('location', `%${safe}%`);
  }

  if (service_id) {
    query = query.eq('service_id', service_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Projects list error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Public: Get single project
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, services(name)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Project not found' });
  res.json(data);
});

// Create project with images
router.post('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { title, service_id, location, stage, description, images } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

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
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.status(201).json(data);
});

// Update project (partial update; only provided fields are updated)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  const { title, service_id, location, stage, description, images } = req.body;

  const payload = {};
  if (title !== undefined) payload.title = title;
  if (service_id !== undefined) payload.service_id = service_id;
  if (location !== undefined) payload.location = location;
  if (stage !== undefined) payload.stage = stage;
  if (description !== undefined) payload.description = description;
  if (images !== undefined) payload.images = Array.isArray(images) ? images : [];

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('Project update error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json(data);
});

// Admin only: Delete project
router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error('Project delete error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  res.json({ message: 'Project deleted' });
});

export default router;