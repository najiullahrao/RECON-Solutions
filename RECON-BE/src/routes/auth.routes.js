import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });

  await supabase.from('profiles').insert({
    id: data.user.id,
    full_name
  });

  res.json({ message: 'Registered successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(401).json({ error: error.message });

  res.json(data);
});

export default router;
