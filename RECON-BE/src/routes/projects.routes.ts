import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { sanitizeForSearch } from '../utils/sanitize.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { createProjectBody, updateProjectBody, projectIdParam } from '../validations/project.validations.js';
import * as response from '../utils/response.js';
import * as projectService from '../services/project.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.query;
    const search = typeof q.search === 'string' ? sanitizeForSearch(q.search) : undefined;
    const stage = typeof q.stage === 'string' ? q.stage : undefined;
    const location = typeof q.location === 'string' ? sanitizeForSearch(q.location) || undefined : undefined;
    const service_id = typeof q.service_id === 'string' ? q.service_id : undefined;
    const data = await projectService.listProjects({ search, stage, location, service_id });
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.get('/:id', validateParams(projectIdParam), async (req, res) => {
  try {
    const id = String(req.params.id);
    const data = await projectService.getProjectById(id);
    response.success(res, data);
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
    if (code === 'PGRST116') return response.error(res, 'Project not found', 404, 'NOT_FOUND');
    response.error(res, 'Something went wrong', 500);
  }
});

router.post('/', requireAuth, requireRole(['ADMIN', 'STAFF']), validateBody(createProjectBody), async (req, res) => {
  try {
    const body = req.body as { images?: string[] };
    const data = await projectService.createProject({ ...req.body, images: body.images });
    response.success(res, data, 201);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.put('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), validateParams(projectIdParam), validateBody(updateProjectBody), async (req, res) => {
  const { title, service_id, location, stage, description, images } = req.body;
  const payload: Record<string, unknown> = {};
  if (title !== undefined) payload.title = title;
  if (service_id !== undefined) payload.service_id = service_id;
  if (location !== undefined) payload.location = location;
  if (stage !== undefined) payload.stage = stage;
  if (description !== undefined) payload.description = description;
  if (images !== undefined) payload.images = Array.isArray(images) ? images : [];
  if (Object.keys(payload).length === 0) {
    response.error(res, 'No fields to update', 400, 'VALIDATION_ERROR');
    return;
  }
  try {
    const id = String(req.params.id);
    const data = await projectService.updateProject(id, payload as Parameters<typeof projectService.updateProject>[1]);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(projectIdParam), async (req, res) => {
  try {
    await projectService.deleteProject(String(req.params.id));
    response.success(res, { message: 'Project deleted' });
  } catch (err) {
    response.error(res, 'Something went wrong', 500);
  }
});

export default router;
