import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/stats', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { data: projectsData } = await supabase.from('projects').select('stage');
    const projectsByStage: Record<string, number> = {};
    projectsData?.forEach((p: { stage?: string }) => {
      if (p.stage) projectsByStage[p.stage] = (projectsByStage[p.stage] || 0) + 1;
    });

    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    const { data: consultationsData } = await supabase.from('consultations').select('status');
    const consultationsByStatus: Record<string, number> = {};
    consultationsData?.forEach((c: { status?: string }) => {
      if (c.status) consultationsByStatus[c.status] = (consultationsByStatus[c.status] || 0) + 1;
    });

    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    const { data: appointmentsData } = await supabase.from('appointments').select('status');
    const appointmentsByStatus: Record<string, number> = {};
    appointmentsData?.forEach((a: { status?: string }) => {
      if (a.status) appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: recentAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    res.json({
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
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/trends', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const { data: consultations } = await supabase
      .from('consultations')
      .select('created_at')
      .order('created_at', { ascending: true });

    const { data: appointments } = await supabase
      .from('appointments')
      .select('created_at')
      .order('created_at', { ascending: true });

    const monthlyData: Record<string, { consultations: number; appointments: number }> = {};

    consultations?.forEach((c: { created_at: string }) => {
      const month = new Date(c.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { consultations: 0, appointments: 0 };
      monthlyData[month].consultations++;
    });

    appointments?.forEach((a: { created_at: string }) => {
      const month = new Date(a.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { consultations: 0, appointments: 0 };
      monthlyData[month].appointments++;
    });

    res.json(monthlyData);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

router.get('/popular-services', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const { data: consultations } = await supabase.from('consultations').select('service');
    const { data: appointments } = await supabase.from('appointments').select('service');

    const serviceCounts: Record<string, number> = {};

    consultations?.forEach((c: { service?: string }) => {
      if (c.service) serviceCounts[c.service] = (serviceCounts[c.service] || 0) + 1;
    });

    appointments?.forEach((a: { service?: string }) => {
      if (a.service) serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
    });

    const sorted = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }));

    res.json(sorted);
  } catch (error) {
    console.error('Popular services error:', error);
    res.status(500).json({ error: 'Failed to fetch popular services' });
  }
});

export default router;
