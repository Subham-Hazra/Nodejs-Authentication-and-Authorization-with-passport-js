import { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger';
import { AppRouter } from './router';

const router = new AppRouter().routerInstance;

// Centralized error handler
const errorHandler = (err: any, _: Request, res: Response, __: NextFunction) => {
  logger.error('Error in protected route', { error: err.message });
  res.status(500).json({ message: 'An error occurred while processing your request.' });
};

// Protected route: Dashboard
router.get(
  '/protected/dashboard',
  authenticateJWT,
  (req: any, res: Response, next: NextFunction) => {
    try {
      logger.info(`Dashboard accessed by user`, { userId: req.user?.id });
      res.status(200).json({ message: `Welcome, ${req?.user?.username}!` });
    } catch (err) {
      next(err);
    }
  },
  errorHandler
);

// Protected route: Profile
router.get(
  '/protected/profile',
  authenticateJWT,
  (req: any, res: Response, next: NextFunction) => {
    try {
      logger.info(`Profile accessed by user`, { userId: req.user?.id });
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },
  errorHandler
);

export default router;
