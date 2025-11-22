import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody, validateQuery } from '../../middleware/validate';
import * as controllers from './learning.controllers';
import * as validators from './learning.validators';

const router = Router();

/**
 * @route   GET /api/v1/learning/courses
 * @desc    Get all available courses
 * @access  Private
 */
router.get(
  '/courses',
  clerkAuth,
  validateQuery(validators.getCoursesQuerySchema),
  controllers.getCourses
);

/**
 * @route   GET /api/v1/learning/progress
 * @desc    Get user's course progress
 * @access  Private
 */
router.get(
  '/progress',
  clerkAuth,
  controllers.getCourseProgress
);

/**
 * @route   POST /api/v1/learning/progress
 * @desc    Update course progress
 * @access  Private
 */
router.post(
  '/progress',
  clerkAuth,
  validateBody(validators.createCourseProgressSchema),
  controllers.updateProgress
);

/**
 * @route   POST /api/v1/learning/quiz
 * @desc    Submit quiz answers
 * @access  Private
 */
router.post(
  '/quiz',
  clerkAuth,
  validateBody(validators.submitQuizSchema),
  controllers.submitQuiz
);

export default router;

