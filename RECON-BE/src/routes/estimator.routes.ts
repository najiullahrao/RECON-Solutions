import express from 'express';
import { validateBody } from '../middleware/validation.middleware.js';
import { estimatorBody } from '../validations/estimator.validations.js';
import * as response from '../utils/response.js';
import * as aiService from '../services/ai.service.js';

const router = express.Router();

router.post('/', validateBody(estimatorBody), async (req, res) => {
  try {
    const data = await aiService.getEstimate(req.body);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'Estimator service unavailable', 500);
  }
});

export default router;