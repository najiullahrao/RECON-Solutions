import { supabase } from '../config/supabase.js';
import type { CreateProjectBody, UpdateProjectBody } from '../validations/project.validations.js';

export async function listProjects(filters: {
  search?: string;
  stage?: string;
  location?: string;
  service_id?: string;
}) {
  let query = supabase
    .from('projects')
    .select('*, services(name)')
    .order('created_at', { ascending: false });

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters.stage) query = query.eq('stage', filters.stage);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.service_id) query = query.eq('service_id', filters.service_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, services(name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(body: CreateProjectBody & { images?: string[] }) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: body.title,
      service_id: body.service_id,
      location: body.location,
      stage: body.stage,
      description: body.description,
      images: Array.isArray(body.images) ? body.images : []
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, body: Partial<UpdateProjectBody>) {
  const payload: Record<string, unknown> = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.service_id !== undefined) payload.service_id = body.service_id;
  if (body.location !== undefined) payload.location = body.location;
  if (body.stage !== undefined) payload.stage = body.stage;
  if (body.description !== undefined) payload.description = body.description;
  if (body.images !== undefined) payload.images = body.images;

  if (Object.keys(payload).length === 0) return null;

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
