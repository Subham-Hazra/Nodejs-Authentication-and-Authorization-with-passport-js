import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/userModel';

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
              return done(null, user);
            }
            return done(null, false, { message: 'User not found' });
          } catch (error) {
            console.error('Error in JWT Strategy:', error);
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
            return done(null, false, { message: 'Incorrect username' });
          }

          if (user.isLocked()) {
            return done(null, false, { message: 'Account is locked' });
          }

          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (error) {
          console.error('Error in Local Strategy:', error);
          return done(error);
        }
      })
    );

    console.log("Passport Configuration Completed");
  }
}

export default PassportConfig;
