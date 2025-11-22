import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './clerkAuth';

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      // TODO: Fetch user role from database using req.auth.userId
      // For now, this is a placeholder structure
      const userRole = 'user'; // Would be fetched from DB

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Authorization check failed' 
      });
    }
  };
};

/**
 * Permission-based authorization middleware
 * Checks if the authenticated user has specific permissions
 */
export const requirePermission = (permission: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      // TODO: Implement permission checking logic
      // This would involve fetching user permissions from database
      // and checking against the required permission

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Permission check failed' 
      });
    }
  };
};

/**
 * Ownership verification middleware
 * Ensures the authenticated user owns the resource they're trying to access
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      
      // TODO: Implement ownership verification
      // This would check if the resource belongs to req.auth.userId

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Ownership verification failed' 
      });
    }
  };
};
