import type { NextFunction, Request, Response } from 'express';
import { extractTokenFromRequest, verifyToken } from '../utils/jwt';

// Extend an Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user information to request object
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
      return;
    }

    // Add user information to request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};
