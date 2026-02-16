import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { createServiceBody, updateServiceBody, serviceIdParam } from '../validations/service.validations.js';
import * as response from '../utils/response.js';
import * as serviceService from '../services/service.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? sanitizeForSearch(req.query.search) : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const active =
      req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const data = await serviceService.listServices({ search, category, active });
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.get('/:id', validateParams(serviceIdParam), async (req, res) => {
  try {
    const data = await serviceService.getServiceById(String(req.params.id));
    response.success(res, data);
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
    if (code === 'PGRST116') return response.error(res, 'Service not found', 404, 'NOT_FOUND');
    response.error(res, 'Something went wrong', 500);
  }
});

router.post('/', requireAuth, requireRole(['ADMIN']), validateBody(createServiceBody), async (req, res) => {
  try {
    const data = await serviceService.createService(req.body);
    response.success(res, data, 201);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.put('/:id', requireAuth, requireRole(['ADMIN']), validateParams(serviceIdParam), validateBody(updateServiceBody), async (req, res) => {
  try {
    const data = await serviceService.updateService(String(req.params.id), req.body);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(serviceIdParam), async (req, res) => {
  try {
    const result = await serviceService.deactivateService(String(req.params.id));
    response.success(res, { message: result.message, data: result.data });
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

export default router;
