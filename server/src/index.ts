import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import facilitiesRouter from './routes/facilities';
import dashboardRouter from './routes/dashboard';
import geoRouter from './routes/geo';
import violationsRouter from './routes/violations';
import inspectionsRouter from './routes/inspections';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/facilities', facilitiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/geo', geoRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/inspections', inspectionsRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`AI Smart Compliance server listening on http://localhost:${PORT}`);
});

export default app;
