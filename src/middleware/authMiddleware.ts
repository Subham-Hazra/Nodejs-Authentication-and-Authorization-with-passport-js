import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

// Middleware to authenticate requests using the JWT strategy
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err:any, user:any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.user = user; // Attach user to the request object
    next();
  })(req, res, next);
};