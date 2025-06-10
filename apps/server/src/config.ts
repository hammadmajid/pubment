import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

if (!jwtSecret || !jwtExpiresIn) {
  throw new Error(
    'JWT_SECRET and JWT_EXPIRES_IN environment variables are required',
  );
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
  jwtExpiresIn,
};
