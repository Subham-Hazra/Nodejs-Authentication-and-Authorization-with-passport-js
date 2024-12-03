import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Protected route example
router.get('/dashboard', authenticateJWT, (req: any, res: Response) => {
  res.status(200).json({ message: `Welcome, ${req?.user?.username}!` });
});

// Another protected route
router.get('/profile', authenticateJWT, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

export default router;
