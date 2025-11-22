import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { env } from '../config/env';

/**
 * Extended Express Request type with Clerk auth information
 */
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    claims: Record<string, any>;
  };
}

/**
 * Clerk authentication middleware
 * Verifies the session token from Authorization header
 * Attaches user info to req.auth
 */
export const clerkAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession(token, token);

    if (!session) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired session token' 
      });
      return;
    }

    // Attach auth information to request
    req.auth = {
      userId: session.userId,
      sessionId: session.id,
      claims: session as any,
    };

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if no token is provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const session = await clerkClient.sessions.verifySession(token, token);

    if (session) {
      req.auth = {
        userId: session.userId,
        sessionId: session.id,
        claims: session as any,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
