import { Router } from 'express';

// Import module routes
import expenseTrackingRoutes from '../modules/expense-tracking/expense-tracking.routes';
import aiAdvisorRoutes from '../modules/ai-advisor/ai-advisor.routes';
import usersRoutes from '../modules/users/users.routes';
import microinvestingRoutes from '../modules/microinvesting/microinvesting.routes';
import learningRoutes from '../modules/learning/learning.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';

const router = Router();

/**
 * Main API router
 * Aggregates all module routes under /api/v1
 */

// Mount module routes
router.use('/expense-tracking', expenseTrackingRoutes);
router.use('/ai-advisor', aiAdvisorRoutes);
router.use('/users', usersRoutes);
router.use('/microinvesting', microinvestingRoutes);
router.use('/learning', learningRoutes);
router.use('/notifications', notificationsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'WealthWise API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      expenseTracking: '/api/v1/expense-tracking',
      aiAdvisor: '/api/v1/ai-advisor',
      users: '/api/v1/users',
      microinvesting: '/api/v1/microinvesting',
      learning: '/api/v1/learning',
      notifications: '/api/v1/notifications',
    },
  });
});

export default router;

