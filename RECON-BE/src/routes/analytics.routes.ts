import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as response from '../utils/response.js';
import * as analyticsService from '../services/analytics.service.js';

const router = express.Router();

router.get('/stats', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const data = await analyticsService.getStats();
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Failed to fetch analytics', 500);
  }
});

router.get('/trends', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const data = await analyticsService.getTrends();
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Failed to fetch trends', 500);
  }
});

router.get('/popular-services', requireAuth, requireRole(['ADMIN', 'STAFF']), async (_req, res) => {
  try {
    const data = await analyticsService.getPopularServices();
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Failed to fetch popular services', 500);
  }
});

export default router;
