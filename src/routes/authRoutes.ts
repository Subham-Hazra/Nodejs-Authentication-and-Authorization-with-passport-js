import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validateRegistration, validateLogin } from '../utils/validation';  // Assuming these are validation middlewares
import { AuthController } from '../controllers/authController';  // Importing the AuthController

const router = Router();

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req); // Check if validation errors exist
  if (!errors.isEmpty()) {
    // Pass the error to the next error handling middleware
    return next(new Error(JSON.stringify(errors.array())));
  }
  next(); // Proceed to the next middleware if no validation errors
};

// Register route
router.post(
  '/register',
  validateRegistration, // Custom validation middleware for registration
  handleValidationErrors, // Error handling for validation errors
  AuthController.register // Call the register method in AuthController
);

// Login route
router.post(
  '/login',
  validateLogin, // Custom validation middleware for login
  handleValidationErrors, // Error handling for validation errors
  AuthController.login // Call the login method in AuthController
);

// Refresh token route
router.post(
  '/refresh',
  handleValidationErrors, // Error handling for validation errors
  AuthController.refreshToken // Call the refreshToken method in AuthController
);

export default router;
