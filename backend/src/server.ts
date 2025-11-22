import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { initializeKeepAliveCron } from './config/cron';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

/**
 * Initialize Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with actual frontend domain
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

/**
 * Body parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware (development only)
 */
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/**
 * Health check endpoint
 * Used by Render keep-alive cron and monitoring services
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

/**
 * Mount API routes
 */
app.use('/api/v1', apiRouter);

/**
 * 404 handler - must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler - must be last
 */
app.use(errorHandler);

/**
 * Start server
 */
const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║                                        ║');
  console.log('║        🚀 WealthWise Backend 🚀       ║');
  console.log('║                                        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Environment: ${env.NODE_ENV}`);
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`✅ API endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('');

  // Initialize keep-alive cron job
  initializeKeepAliveCron();
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Export for testing
export default app;

