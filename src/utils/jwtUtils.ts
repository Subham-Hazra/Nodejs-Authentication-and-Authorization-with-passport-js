import jwt from 'jsonwebtoken';

export class JwtUtils {
  // Ensure secrets are set at runtime
  private static accessTokenSecret: string | undefined; 
  private static refreshTokenSecret: string | undefined ;

  private static ensureSecrets(): void {
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables.');
    }

  }
  static addTokenSecretKeys() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  }

  // Generate an access token
  static generateAccessToken(userId: string): string {
    this.ensureSecrets();
    return jwt.sign({ id: userId }, this.accessTokenSecret!, { expiresIn: '15m' });
  }

  // Generate a refresh token
  static generateRefreshToken(userId: string): string {
    this.ensureSecrets();
    return jwt.sign({ id: userId }, this.refreshTokenSecret!, { expiresIn: '7d' });
  }

  // Verify an access token
  static verifyAccessToken(token: string): string | jwt.JwtPayload {
    this.ensureSecrets();
    try {
      return jwt.verify(token, this.accessTokenSecret!);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify a refresh token
  static verifyRefreshToken(token: string): string | jwt.JwtPayload {
    this.ensureSecrets();
    try {
      return jwt.verify(token, this.refreshTokenSecret!);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
