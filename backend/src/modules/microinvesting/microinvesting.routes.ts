import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody, validateQuery } from '../../middleware/validate';
import * as controllers from './microinvesting.controllers';
import * as validators from './microinvesting.validators';

const router = Router();

/**
 * @route   GET /api/v1/microinvesting
 * @desc    Get all investments for authenticated user
 * @access  Private
 */
router.get(
  '/',
  clerkAuth,
  validateQuery(validators.getInvestmentQuerySchema),
  controllers.getInvestments
);

/**
 * @route   POST /api/v1/microinvesting
 * @desc    Create a new investment
 * @access  Private
 */
router.post(
  '/',
  clerkAuth,
  validateBody(validators.createInvestmentSchema),
  controllers.createInvestment
);

/**
 * @route   GET /api/v1/microinvesting/portfolio
 * @desc    Get portfolio summary
 * @access  Private
 */
router.get(
  '/portfolio',
  clerkAuth,
  controllers.getPortfolio
);

/**
 * @route   POST /api/v1/microinvesting/round-up
 * @desc    Create or update round-up rule
 * @access  Private
 */
router.post(
  '/round-up',
  clerkAuth,
  validateBody(validators.createRoundUpRuleSchema),
  controllers.createRoundUpRule
);

export default router;

