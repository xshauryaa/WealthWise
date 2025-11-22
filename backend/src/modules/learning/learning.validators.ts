import { z } from 'zod';

/**
 * Learning validation schemas
 */

export const createCourseProgressSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
  completed: z.boolean().default(false),
  timeSpent: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const submitQuizSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.record(z.string(), z.any()),
});

export const getCoursesQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  completed: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export type CreateCourseProgressInput = z.infer<typeof createCourseProgressSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>;

