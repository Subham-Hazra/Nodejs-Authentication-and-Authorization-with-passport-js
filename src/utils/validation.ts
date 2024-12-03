// src/utils/validation.ts
import { body } from 'express-validator';

export const validateRegistration = [
  body('username').isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters long'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const validateLogin = [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
