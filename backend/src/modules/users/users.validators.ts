import { z } from 'zod';

/**
 * Users validation schemas
 */

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  profileImageUrl: z.string().url().optional(),
});

export const updateUserSettingsSchema = z.object({
  currency: z.string().length(3).optional(),
  language: z.string().length(2).optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
});

export const getUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type GetUserQuery = z.infer<typeof getUserQuerySchema>;
