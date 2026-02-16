import { supabase } from '../config/supabase.js';
import type { CreateAppointmentBody } from '../validations/appointment.validations.js';

export async function createAppointment(userId: string, body: CreateAppointmentBody) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: userId,
      service: body.service,
      preferred_date: body.preferred_date,
      location: body.location
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMyAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('preferred_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function listAppointments(filters: { status?: string | string[] }) {
  let query = supabase
    .from('appointments')
    .select('*, profiles(full_name)')
    .order('preferred_date', { ascending: true });

  const statuses = filters.status == null
    ? []
    : Array.isArray(filters.status)
      ? filters.status.filter((s): s is string => typeof s === 'string' && s.length > 0)
      : [filters.status];
  if (statuses.length === 1) query = query.eq('status', statuses[0]);
  else if (statuses.length > 1) query = query.in('status', statuses);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
