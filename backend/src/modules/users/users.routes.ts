import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody } from '../../middleware/validate';
import * as controllers from './users.controllers';
import * as validators from './users.validators';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  clerkAuth,
  controllers.getCurrentUser
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  clerkAuth,
  validateBody(validators.updateUserProfileSchema),
  controllers.updateProfile
);

/**
 * @route   PUT /api/v1/users/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put(
  '/settings',
  clerkAuth,
  validateBody(validators.updateUserSettingsSchema),
  controllers.updateSettings
);

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/me',
  clerkAuth,
  controllers.deleteAccount
);

export default router;
