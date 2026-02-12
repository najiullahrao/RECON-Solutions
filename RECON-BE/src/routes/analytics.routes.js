import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Get dashboard stats (Admin/Staff only)
router.get('/stats', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    // Total projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Projects by stage
    const { data: projectsByStage } = await supabase
      .from('projects')
      .select('stage')
      .then(({ data }) => {
        const grouped = {};
        data?.forEach(p => {
          grouped[p.stage] = (grouped[p.stage] || 0) + 1;
        });
        return { data: grouped };
      });

    // Total consultations
    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    // Consultations by status
    const { data: consultationsByStatus } = await supabase
      .from('consultations')
      .select('status')
      .then(({ data }) => {
        const grouped = {};
        data?.forEach(c => {
          grouped[c.status] = (grouped[c.status] || 0) + 1;
        });
        return { data: grouped };
      });

    // Total appointments
    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    // Appointments by status
    const { data: appointmentsByStatus } = await supabase
      .from('appointments')
      .select('status')
      .then(({ data }) => {
        const grouped = {};
        data?.forEach(a => {
          grouped[a.status] = (grouped[a.status] || 0) + 1;
        });
        return { data: grouped };
      });

    // Recent activity (last 30 days)
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
      projects: {
        byStage: projectsByStage
      },
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

// Get monthly trends
router.get('/trends', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { data: consultations } = await supabase
      .from('consultations')
      .select('created_at')
      .order('created_at', { ascending: true });

    const { data: appointments } = await supabase
      .from('appointments')
      .select('created_at')
      .order('created_at', { ascending: true });

    // Group by month
    const monthlyData = {};

    consultations?.forEach(c => {
      const month = new Date(c.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = { consultations: 0, appointments: 0 };
      monthlyData[month].consultations++;
    });

    appointments?.forEach(a => {
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

// Get popular services
router.get('/popular-services', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { data: consultations } = await supabase
      .from('consultations')
      .select('service');

    const { data: appointments } = await supabase
      .from('appointments')
      .select('service');

    const serviceCounts = {};

    consultations?.forEach(c => {
      if (c.service) serviceCounts[c.service] = (serviceCounts[c.service] || 0) + 1;
    });

    appointments?.forEach(a => {
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