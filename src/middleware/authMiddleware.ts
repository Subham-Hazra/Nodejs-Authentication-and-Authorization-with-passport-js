import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger'; // Assuming you have a logger file

// Middleware to authenticate requests using the JWT strategy
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      // Log the error for audit purposes
      logger.error(`JWT authentication error: ${err.message}`, { path: req.path, ip: req.ip });
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
    if (!user) {
      // Log unauthorized access attempts
      logger.warn(`Unauthorized access attempt`, { path: req.path, ip: req.ip });
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.user = user; // Attach user to the request object for use in protected routes
    logger.info(`JWT authentication successful for user: ${user.id}`, { path: req.path, ip: req.ip });
    next();
  })(req, res, next);
};
