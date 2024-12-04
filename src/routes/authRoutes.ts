import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validateRegistration, validateLogin } from '../utils/validation'; // Assuming these are validation middlewares
import { AuthController } from '../controllers/authController'; // Importing the AuthController
import logger from '../utils/logger'; // Logger for audit logs
import AppRouter from './authRoutes';

const router:any = AppRouter.router;

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req); // Check for validation errors
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred', { errors: errors.array() });
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next(); // Proceed to the next middleware if no validation errors
};

// Enhanced audit logging middleware
const logRequestDetails = (req: Request, _: Response, next: NextFunction) => {
  logger.info(`Request received`, {
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body, // Be careful about logging sensitive data
  });
  next();
};

// Register route
router.post(
  '/auth/register',
  validateRegistration, // Custom validation middleware for registration
  handleValidationErrors as any, // Error handling for validation errors
  logRequestDetails, // Log request details for audit trail
  AuthController.register // Call the register method in AuthController
);

// Login route
router.post(
  '/auth/login',
  validateLogin, // Custom validation middleware for login
  handleValidationErrors as any, // Error handling for validation errors
  logRequestDetails, // Log request details for audit trail
  AuthController.login // Call the login method in AuthController
);

// Refresh token route
router.post(
  '/auth/refresh',
  logRequestDetails, // Log request details for audit trail
  handleValidationErrors as any, // Error handling for validation errors
  AuthController.refreshToken // Call the refreshToken method in AuthController
);

export default router;
