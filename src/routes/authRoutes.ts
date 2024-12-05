import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validateRegistration, validateLogin } from '../utils/validation';
import { AuthController } from '../controllers/authController';
import logger from '../utils/logger';
import { AppRouter } from './router';

const router = new AppRouter().routerInstance;

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred', { errors: errors.array() });
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Log request details
const logRequestDetails = (req: Request, _: Response, next: NextFunction) => {
  logger.info(`Request received`, {
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body,
  });
  next();
};

// Register route
router.post(
  '/auth/register',
  validateRegistration,
  handleValidationErrors as any,
  logRequestDetails,
  AuthController.register
);

// Login route
router.post(
  '/auth/login',
  validateLogin,
  handleValidationErrors as any,
  logRequestDetails,
  AuthController.login
);

// Refresh token route
router.post(
  '/auth/refresh',
  logRequestDetails,
  handleValidationErrors as any,
  AuthController.refreshToken
);

export default router;
