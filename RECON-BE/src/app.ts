import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { requestId } from './middleware/requestId.middleware.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.routes.js';
import servicesRoutes from './routes/services.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import consultationsRoutes from './routes/consultations.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import aiRoutes from './routes/ai.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import * as response from './utils/response.js';

const app = express();

app.use(requestId);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id ?? crypto.randomUUID()
  })
);

app.use(cors({
  origin: config.frontendUrl ?? true,
  credentials: true
}));
app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  handler: (req, res) => response.error(res, 'Too many requests', 429, 'RATE_LIMIT')
});
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  handler: (req, res) => response.error(res, 'Too many auth attempts', 429, 'RATE_LIMIT')
});

app.use(generalLimiter);
app.use('/auth', authLimiter, authRoutes);
app.use('/services', servicesRoutes);
app.use('/projects', projectsRoutes);
app.use('/consultations', consultationsRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/ai', aiRoutes);
app.use('/upload', uploadRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/health', (_req: Request, res: Response) => {
  response.success(res, { status: 'ok', timestamp: new Date() });
});

app.use((_req: Request, res: Response) => {
  response.error(res, 'Not found', 404, 'NOT_FOUND');
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.id;
  logger.error({ err, requestId }, 'Unhandled error');
  response.error(res, 'Something went wrong', 500);
});

export default app;
