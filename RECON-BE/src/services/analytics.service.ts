import { supabase } from '../config/supabase.js';

export async function getStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // Parallelize all database queries for better performance
  const [
    { count: totalProjects },
    { data: projectsData },
    { count: totalConsultations },
    { data: consultationsData },
    { count: totalAppointments },
    { data: appointmentsData },
    { count: recentConsultations },
    { count: recentAppointments }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('stage'),
    supabase.from('consultations').select('*', { count: 'exact', head: true }),
    supabase.from('consultations').select('status'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('status'),
    supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoISO),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoISO)
  ]);

  // Process data synchronously (fast operations)
  const projectsByStage: Record<string, number> = {};
  projectsData?.forEach((p: { stage?: string }) => {
    if (p.stage) projectsByStage[p.stage] = (projectsByStage[p.stage] || 0) + 1;
  });

  const consultationsByStatus: Record<string, number> = {};
  consultationsData?.forEach((c: { status?: string }) => {
    if (c.status) consultationsByStatus[c.status] = (consultationsByStatus[c.status] || 0) + 1;
  });

  const appointmentsByStatus: Record<string, number> = {};
  appointmentsData?.forEach((a: { status?: string }) => {
    if (a.status) appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1;
  });

  return {
    overview: {
      totalProjects,
      totalConsultations,
      totalAppointments
    },
    projects: { byStage: projectsByStage },
    consultations: {
      byStatus: consultationsByStatus,
      last30Days: recentConsultations
    },
    appointments: {
      byStatus: appointmentsByStatus,
      last30Days: recentAppointments
    }
  };
}

export async function getTrends() {
  // Fetch consultations and appointments in parallel
  const [{ data: consultations }, { data: appointments }] = await Promise.all([
    supabase.from('consultations').select('created_at').order('created_at', { ascending: true }),
    supabase.from('appointments').select('created_at').order('created_at', { ascending: true })
  ]);

  const monthlyData: Record<string, { consultations: number; appointments: number }> = {};

  // Process consultations
  consultations?.forEach((c: { created_at: string }) => {
    const month = new Date(c.created_at).toISOString().slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { consultations: 0, appointments: 0 };
    monthlyData[month].consultations++;
  });

  // Process appointments
  appointments?.forEach((a: { created_at: string }) => {
    const month = new Date(a.created_at).toISOString().slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { consultations: 0, appointments: 0 };
    monthlyData[month].appointments++;
  });

  return monthlyData;
}

export async function getPopularServices() {
  // Fetch consultations and appointments in parallel
  const [{ data: consultations }, { data: appointments }] = await Promise.all([
    supabase.from('consultations').select('service'),
    supabase.from('appointments').select('service')
  ]);

  const serviceCounts: Record<string, number> = {};

  // Process consultations
  consultations?.forEach((c: { service?: string }) => {
    if (c.service) serviceCounts[c.service] = (serviceCounts[c.service] || 0) + 1;
  });

  // Process appointments
  appointments?.forEach((a: { service?: string }) => {
    if (a.service) serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
  });

  return Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([service, count]) => ({ service, count }));
}
