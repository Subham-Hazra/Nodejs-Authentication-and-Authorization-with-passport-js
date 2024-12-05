// src/app.ts
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
import PassportConfig from "./config/passport";
import helmet from "helmet";
import cors from "cors";
import { JwtUtils } from "./utils/jwtUtils";
import { authRateLimiter, protectedRateLimiter } from "./middleware/rateLimiter";
import { AppRouter } from "./routes/router";
import router from "./routes/allRoutes";

dotenv.config();

const app = express();
app.use(express.json());

// Security Headers with Helmet
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", // Replace '*' with trusted origins
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

//Initialize private tokens for JWT
JwtUtils.addTokenSecretKeys();

//Rate limiting of Auth Routes
app.use("/api/auth", authRateLimiter);
//Rate limiting of protected Routes
app.use("/api/protected", protectedRateLimiter);
// Configure Passport
PassportConfig.configure();
app.use(passport.initialize());

// Ensure HTTPS in Production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware for Audit Logging
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth")) {
    console.log(
      `[AUTH LOG] ${req.method} - ${req.path} at ${new Date().toISOString()}`
    );
  }
  next();
});

// Use Authentication Routes
app.use("/api", router);
router.stack.forEach((middleware: any) => {
    console.log("middleware : ", middleware)
    if (middleware.route) { // Routes registered directly
      console.log(middleware.route.path);
    } else if (middleware.name === 'router') { // Middleware that contains a router
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          console.log('route : ',handler.route.path);
        }
      });
    }
  });
  

export default app;
