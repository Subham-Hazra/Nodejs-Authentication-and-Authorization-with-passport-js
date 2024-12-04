import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/userModel';
import logger from '../utils/logger'; // Assuming a logger utility is available

class PassportConfig {
  static configure(): void {
    // Ensure the access token secret is set
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables.');
    }

    // JWT Strategy
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        },
        async (jwtPayload, done) => {
          try {
            const user = await User.findById(jwtPayload.id);
            if (user) {
              logger.info(`JWT authentication successful for user: ${user.id}`);
              return done(null, user);
            }
            logger.warn(`JWT authentication failed: User not found for ID ${jwtPayload.id}`);
            return done(null, false, { message: 'User not found' });
          } catch (error: any) {
            logger.error('Error in JWT Strategy', { error: error.message });
            return done(error, false);
          }
        }
      )
    );

    // Local Strategy
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          const user = await User.findOne({ username });
          if (!user) {
            logger.warn(`Local authentication failed: User not found with username ${username}`);
            return done(null, false, { message: 'Incorrect username' });
          }

          if (user.isLocked()) {
            logger.warn(`Local authentication failed: Account locked for username ${username}`);
            return done(null, false, { message: 'Account is locked' });
          }

          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            logger.warn(`Local authentication failed: Incorrect password for username ${username}`);
            return done(null, false, { message: 'Incorrect password' });
          }

          logger.info(`Local authentication successful for username: ${username}`);
          return done(null, user);
        } catch (error: any) {
          logger.error('Error in Local Strategy', { error: error.message });
          return done(error);
        }
      })
    );

    logger.info('Passport Configuration Completed');
  }
}

export default PassportConfig;
