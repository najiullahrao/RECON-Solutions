import express from 'express';
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

// Routes
app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/projects', projectsRoutes);
app.use('/consultations', consultationsRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/ai', aiRoutes);
app.use('/upload', uploadRoutes);
app.use('/analytics', analyticsRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Global error handler (must be after routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
