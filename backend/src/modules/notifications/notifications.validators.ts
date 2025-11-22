import { z } from 'zod';

/**
 * Notifications validation schemas
 */

export const createNotificationSchema = z.object({
  type: z.enum(['info', 'warning', 'success', 'error']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const getNotificationsQuerySchema = z.object({
  type: z.enum(['info', 'warning', 'success', 'error']).optional(),
  isRead: z.string().transform((val) => val === 'true').optional(),
  isArchived: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export const sendPushNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.any()).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type SendPushNotificationInput = z.infer<typeof sendPushNotificationSchema>;

