// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import PassportConfig from './config/passport';
import { JwtUtils } from './utils/jwtUtils';
import protectedRoutes from './routes/protectedRoutes';

dotenv.config();

const app = express();
app.use(express.json());

// Configure Passport
// MongoDB Connection
PassportConfig.configure();
app.use(passport.initialize());
JwtUtils.addTokenSecretKeys();
mongoose.connect(process.env.MONGO_URI!)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Use Authentication Routes
app.use('/api/auth', authRoutes);
//Use protected Routes
app.use('/api/protected', protectedRoutes); // Protected routes

export default app;
