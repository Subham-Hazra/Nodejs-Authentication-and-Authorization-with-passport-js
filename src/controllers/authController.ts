import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { JwtUtils } from '../utils/jwtUtils';
import logger from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { username, password }: { username: string; password: string } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        logger.warn(`Registration attempt with existing username: ${username}`);
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = new User({ username, password });
      await user.save();

      logger.info(`User registered successfully: ${username}`);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error:any) {
      logger.error(`Error during registration: ${error.message}`);
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { username, password }: { username: string; password: string } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        logger.warn(`Login attempt with non-existent username: ${username}`);
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isLocked()) {
        logger.warn(`Login attempt for locked account: ${username}`);
        return res.status(403).json({ message: 'Account locked. Please try again later.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incFailedLoginAttempts();
        logger.warn(`Invalid password attempt for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const accessToken = JwtUtils.generateAccessToken(user._id.toString());
      const refreshToken = JwtUtils.generateRefreshToken(user._id.toString());

      // Set the refresh token in a secure HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`Login successful for username: ${username}`);
      res.status(200).json({ accessToken });
    } catch (error: any) {
      logger.error(`Error during login: ${error.message}`);
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        logger.warn('Missing refresh token in cookie');
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const decoded = JwtUtils.verifyRefreshToken(refreshToken);
      if (typeof decoded === 'string') {
        logger.warn('Invalid refresh token');
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const userId = decoded.id.toString();
      const newAccessToken = JwtUtils.generateAccessToken(userId);
      const newRefreshToken = JwtUtils.generateRefreshToken(userId);

      // Rotate the refresh token
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`Refresh token used successfully for user ID: ${userId}`);
      res.status(200).json({ accessToken: newAccessToken });
    } catch (error: any) {
      logger.error(`Error during token refresh: ${error.message}`);
      next(error);
    }
  }
}
