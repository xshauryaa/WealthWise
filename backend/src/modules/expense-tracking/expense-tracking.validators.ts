import { z } from 'zod';

/**
 * Expense tracking validation schemas
 */

export const createExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const getExpenseQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type GetExpenseQuery = z.infer<typeof getExpenseQuerySchema>;
