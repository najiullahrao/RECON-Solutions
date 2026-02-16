import { supabase } from '../config/supabase.js';
import type { SubmitConsultationBody } from '../validations/consultation.validations.js';

export async function submitConsultation(body: SubmitConsultationBody, userId?: string) {
  const row = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    service: body.service,
    location: body.location,
    message: body.message,
    ...(userId && { user_id: userId }),
  };

  const { data, error } = await supabase
    .from('consultations')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listConsultations(filters: {
  status?: string | string[];
  search?: string;
  from_date?: string;
  to_date?: string;
}) {
  let query = supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });

  const statuses = filters.status == null
    ? []
    : Array.isArray(filters.status)
      ? filters.status.filter((s): s is string => typeof s === 'string' && s.length > 0)
      : [filters.status];
  if (statuses.length === 1) query = query.eq('status', statuses[0]);
  else if (statuses.length > 1) query = query.in('status', statuses);
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }
  if (filters.from_date) query = query.gte('created_at', filters.from_date);
  if (filters.to_date) query = query.lte('created_at', filters.to_date);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateConsultationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('consultations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMyConsultations(userId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
