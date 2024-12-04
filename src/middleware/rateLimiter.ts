// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Rate Limiting
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});

export const protectedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Higher limit for protected routes
});