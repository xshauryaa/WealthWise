import { Router } from 'express';
import { clerkAuth } from '../../middleware/clerkAuth';
import { validateBody } from '../../middleware/validate';
import * as controllers from './ai-advisor.controllers';
import * as validators from './ai-advisor.validators';

const router = Router();

/**
 * @route   POST /api/v1/ai-advisor/advice
 * @desc    Get AI financial advice
 * @access  Private
 */
router.post(
  '/advice',
  clerkAuth,
  validateBody(validators.getAdviceSchema),
  controllers.getAdvice
);

/**
 * @route   POST /api/v1/ai-advisor/chat
 * @desc    Create a new chat session
 * @access  Private
 */
router.post(
  '/chat',
  clerkAuth,
  validateBody(validators.createChatSessionSchema),
  controllers.createChatSession
);

/**
 * @route   POST /api/v1/ai-advisor/chat/message
 * @desc    Send a message in a chat session
 * @access  Private
 */
router.post(
  '/chat/message',
  clerkAuth,
  validateBody(validators.sendMessageSchema),
  controllers.sendMessage
);

export default router;
