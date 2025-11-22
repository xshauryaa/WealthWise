import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validation target types
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Higher-order function that creates a validation middleware
 * Validates request data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 * @returns Express middleware function
 */
export const validate = (
  schema: AnyZodObject,
  target: ValidationTarget = 'body'
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate the specified target
      const validated = await schema.parseAsync(req[target]);
      
      // Replace the original data with validated data
      req[target] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for clean API response
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: formattedErrors,
        });
        return;
      }

      // Pass other errors to error handler
      next(error);
    }
  };
};

/**
 * Convenience wrapper for body validation
 */
export const validateBody = (schema: AnyZodObject) => {
  return validate(schema, 'body');
};

/**
 * Convenience wrapper for query validation
 */
export const validateQuery = (schema: AnyZodObject) => {
  return validate(schema, 'query');
};

/**
 * Convenience wrapper for params validation
 */
export const validateParams = (schema: AnyZodObject) => {
  return validate(schema, 'params');
};
