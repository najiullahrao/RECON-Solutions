import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { submitConsultationBody } from '../validations/consultation.validations.js';
import { consultationIdParam, updateConsultationStatusBody } from '../validations/consultation-status.validations.js';
import * as response from '../utils/response.js';
import * as consultationService from '../services/consultation.service.js';

const router = express.Router();

router.post('/', optionalAuth, validateBody(submitConsultationBody), async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await consultationService.submitConsultation(req.body, userId);
    response.success(res, { message: 'Consultation request submitted', data }, 201);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.get('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const status = req.query.status === undefined
      ? undefined
      : Array.isArray(req.query.status)
        ? (req.query.status as string[]).filter(Boolean)
        : typeof req.query.status === 'string'
          ? req.query.status
          : undefined;
    const search = typeof req.query.search === 'string' ? sanitizeForSearch(req.query.search) : undefined;
    const from_date = typeof req.query.from_date === 'string' ? req.query.from_date : undefined;
    const to_date = typeof req.query.to_date === 'string' ? req.query.to_date : undefined;
    const data = await consultationService.listConsultations({ status, search, from_date, to_date });
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.patch('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), validateParams(consultationIdParam), validateBody(updateConsultationStatusBody), async (req, res) => {
  try {
    const id = String(req.params.id);
    const data = await consultationService.updateConsultationStatus(id, req.body.status);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.get('/my', requireAuth, async (req, res) => {
  if (!req.user) {
    response.error(res, 'Forbidden', 403, 'FORBIDDEN');
    return;
  }
  try {
    const data = await consultationService.listMyConsultations(req.user.id);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

export default router;
