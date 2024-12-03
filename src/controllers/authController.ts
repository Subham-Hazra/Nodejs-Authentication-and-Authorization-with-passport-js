import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { JwtUtils } from '../utils/jwtUtils';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { username, password }: { username: string; password: string } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = new User({ username, password });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      next(error);  // Pass error to next error-handling middleware
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { username, password }: { username: string; password: string } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isLocked()) {
        return res.status(403).json({ message: 'Account locked. Please try again later.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incFailedLoginAttempts();
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const accessToken = JwtUtils.generateAccessToken(user._id.toString());
      const refreshToken = JwtUtils.generateRefreshToken(user._id.toString());

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      next(error);  // Pass error to next error-handling middleware
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const decoded = JwtUtils.verifyRefreshToken(refreshToken);

      if (typeof decoded === 'string') {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const accessToken = JwtUtils.generateAccessToken(decoded.id.toString());

      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);  // Pass error to next error-handling middleware
    }
  }
}
