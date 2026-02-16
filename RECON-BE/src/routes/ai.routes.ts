import express from 'express';
import { validateBody } from '../middleware/validation.middleware.js';
import { askBody, chatBody } from '../validations/ai.validations.js';
import * as response from '../utils/response.js';
import * as aiService from '../services/ai.service.js';

const router = express.Router();

router.post('/ask', validateBody(askBody), async (req, res) => {
  try {
    const data = await aiService.ask(req.body);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'AI service unavailable: ' + err, 500);
  }
});

router.post('/chat', validateBody(chatBody), async (req, res) => {
  try {
    const data = await aiService.chat(req.body);
    response.success(res, data);
  } catch (err) {
    response.error(res, 'AI service unavailable', 500);
  }
});

export default router;
