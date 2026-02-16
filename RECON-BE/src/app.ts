import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import servicesRoutes from './routes/services.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import consultationsRoutes from './routes/consultations.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import aiRoutes from './routes/ai.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/projects', projectsRoutes);
app.use('/consultations', consultationsRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/ai', aiRoutes);
app.use('/upload', uploadRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
