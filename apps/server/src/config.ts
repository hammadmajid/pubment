import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret,
  jwtExpiresIn: 60 * 60 * 24, // 24 hours in seconds
};
