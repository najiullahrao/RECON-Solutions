import { supabase } from '../config/supabase.js';
import type { CreateServiceBody, UpdateServiceBody } from '../validations/service.validations.js';

export async function listServices(filters: {
  search?: string;
  category?: string;
  active?: boolean;
}) {
  let query = supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.active !== undefined) query = query.eq('active', filters.active);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getServiceById(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createService(body: CreateServiceBody) {
  const { data, error } = await supabase
    .from('services')
    .insert({ name: body.name, category: body.category, description: body.description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id: string, body: UpdateServiceBody) {
  const { data, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateService(id: string) {
  const { data, error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { data, message: 'Service deactivated' };
}
