import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody, validateQuery } from '../../middleware/validate';
import * as controllers from './notifications.controllers';
import * as validators from './notifications.validators';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get all notifications for authenticated user
 * @access  Private
 */
router.get(
  '/',
  clerkAuth,
  validateQuery(validators.getNotificationsQuerySchema),
  controllers.getNotifications
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get(
  '/unread-count',
  clerkAuth,
  controllers.getUnreadCount
);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put(
  '/:id/read',
  clerkAuth,
  controllers.markAsRead
);

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
  '/read-all',
  clerkAuth,
  controllers.markAllAsRead
);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
  '/:id',
  clerkAuth,
  controllers.deleteNotification
);

export default router;

