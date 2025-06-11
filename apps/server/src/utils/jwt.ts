import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { IUser } from '../models';

/**
 * Generate a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export const generateToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from request
 * @param req Express request object
 * @returns JWT token or null if not found
 */
export const extractTokenFromRequest = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Check cookies (if using cookie-based auth)
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};
