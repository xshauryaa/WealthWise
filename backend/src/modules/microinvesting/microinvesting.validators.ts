import { z } from 'zod';

/**
 * Microinvesting validation schemas
 */

export const createInvestmentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  assetType: z.enum(['stocks', 'crypto', 'etf', 'bonds']),
  symbol: z.string().min(1, 'Symbol is required'),
  quantity: z.number().positive('Quantity must be positive').optional(),
  notes: z.string().optional(),
});

export const createRoundUpRuleSchema = z.object({
  isEnabled: z.boolean(),
  roundUpMultiple: z.number().positive().default(1),
  minimumAmount: z.number().positive().optional(),
  maximumAmount: z.number().positive().optional(),
});

export const getInvestmentQuerySchema = z.object({
  assetType: z.enum(['stocks', 'crypto', 'etf', 'bonds']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type CreateRoundUpRuleInput = z.infer<typeof createRoundUpRuleSchema>;
export type GetInvestmentQuery = z.infer<typeof getInvestmentQuerySchema>;

