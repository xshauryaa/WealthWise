import { z } from 'zod';

/**
 * AI advisor validation schemas
 */

export const getAdviceSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  category: z.enum(['investment', 'budgeting', 'savings', 'general']).optional(),
  context: z.record(z.any()).optional(),
});

export const createChatSessionSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  initialMessage: z.string().min(1, 'Initial message is required'),
});

export const sendMessageSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  message: z.string().min(1, 'Message is required'),
});

export type GetAdviceInput = z.infer<typeof getAdviceSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
