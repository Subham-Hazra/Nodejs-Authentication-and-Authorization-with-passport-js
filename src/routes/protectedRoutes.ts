import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger'; // Logger for audit and error logging

const router = Router();

// Centralized error handler for protected routes
const errorHandler = (err: any, _: Request, res: Response, __: NextFunction) => {
  logger.error('Error in protected route', { error: err.message, stack: err.stack });
  res.status(500).json({ message: 'An error occurred while processing your request.' });
};

// Protected route: Dashboard
router.get(
  '/dashboard',
  authenticateJWT,
  (req: any, res: Response, next: NextFunction) => {
    try {
      logger.info(`Dashboard accessed by user`, { userId: req.user?.id });
      res.status(200).json({ message: `Welcome, ${req?.user?.username}!` });
    } catch (err) {
      next(err); // Forward error to centralized error handler
    }
  },
  errorHandler
);

// Protected route: Profile
router.get(
  '/profile',
  authenticateJWT,
  (req: any, res: Response, next: NextFunction) => {
    try {
      logger.info(`Profile accessed by user`, { userId: req.user?.id });
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err); // Forward error to centralized error handler
    }
  },
  errorHandler
);

export default router;
