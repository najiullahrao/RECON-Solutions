import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { createAppointmentBody } from '../validations/appointment.validations.js';
import { appointmentIdParam, updateAppointmentStatusBody } from '../validations/appointment-status.validations.js';
import * as response from '../utils/response.js';
import * as appointmentService from '../services/appointment.service.js';

const router = express.Router();

router.post('/', requireAuth, validateBody(createAppointmentBody), async (req, res) => {
  if (!req.user) {
    response.error(res, 'Forbidden', 403, 'FORBIDDEN');
    return;
  }
  try {
    const data = await appointmentService.createAppointment(req.user.id, req.body);
    response.success(res, { message: 'Appointment requested', data }, 201);
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
    const data = await appointmentService.listMyAppointments(req.user.id);
    response.success(res, data);
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
    const data = await appointmentService.listAppointments({ status });
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.patch('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), validateParams(appointmentIdParam), validateBody(updateAppointmentStatusBody), async (req, res) => {
  try {
    const id = String(req.params.id);
    const data = await appointmentService.updateAppointmentStatus(id, req.body.status);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

export default router;
