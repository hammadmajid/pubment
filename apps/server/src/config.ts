import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  isProduction: process.env.NODE_ENV === 'production',
};
