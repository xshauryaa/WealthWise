import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody, validateQuery } from '../../middleware/validate';
import * as controllers from './expense-tracking.controllers';
import * as validators from './expense-tracking.validators';

const router = Router();

/**
 * @route   GET /api/v1/expense-tracking
 * @desc    Get all expenses for authenticated user
 * @access  Private
 */
router.get(
  '/',
  clerkAuth,
  validateQuery(validators.getExpenseQuerySchema),
  controllers.getExpenses
);

/**
 * @route   POST /api/v1/expense-tracking
 * @desc    Create a new expense
 * @access  Private
 */
router.post(
  '/',
  clerkAuth,
  validateBody(validators.createExpenseSchema),
  controllers.createExpense
);

/**
 * @route   PUT /api/v1/expense-tracking/:id
 * @desc    Update an expense
 * @access  Private
 */
router.put(
  '/:id',
  clerkAuth,
  validateBody(validators.updateExpenseSchema),
  controllers.updateExpense
);

/**
 * @route   DELETE /api/v1/expense-tracking/:id
 * @desc    Delete an expense
 * @access  Private
 */
router.delete(
  '/:id',
  clerkAuth,
  controllers.deleteExpense
);

export default router;
