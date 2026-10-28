import express from 'express';
import cors from 'cors';
import { requireAuth } from './auth.js';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import applianceRoutes from './routes/appliances.routes.js';
import challengeRoutes from './routes/challenges.routes.js';
import recommendationRoutes from './routes/recommendations.routes.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'energytrack-api' }));
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);
app.use('/api', accountRoutes);
app.use('/api', applianceRoutes);
app.use('/api', challengeRoutes);
app.use('/api', recommendationRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  if (err?.name === 'ValidationError' || err?.name === 'CastError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Something went wrong. Please retry.' });
});
export default app;
