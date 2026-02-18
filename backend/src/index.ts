import express from 'express';
import cors from 'cors';
import { config } from './config';

// Import routers
import metricsRouter from './routes/metrics';
import predictionsRouter from './routes/predictions';
import anomaliesRouter from './routes/anomalies';
import logsRouter from './routes/logs';
// import anomaliesRouter from './routes/anomalies';
import explanationsRouter from './routes/explanations';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'System Monitoring API (Node.js)',
    version: '1.0.0',
    docs: '/api-docs' // Placeholder
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api/metrics', metricsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/anomalies', anomaliesRouter);
app.use('/api/logs', logsRouter);
// app.use('/api/anomalies', anomaliesRouter);
app.use('/api/explanations', explanationsRouter);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
