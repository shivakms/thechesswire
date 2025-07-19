import jwt from 'jsonwebtoken';
import { UserRole } from './roles';

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'chesswire-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  // Generate JWT token
  static generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JWTPayload = {
      userId,
      email,
      role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
      expiresIn: '7d' // 7 days
    });
  }

  // Verify JWT token
  static verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }

  // Generate both access and refresh tokens
  static generateTokenPair(userId: string, email: string, role: UserRole): TokenResponse {
    const accessToken = this.generateToken(userId, email, role);
    const refreshToken = this.generateRefreshToken(userId);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    };
  }

  // Refresh access token using refresh token
  static refreshAccessToken(refreshToken: string, userData: { userId: string; email: string; role: UserRole }): { success: boolean; accessToken?: string; error?: string } {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type: string };
      
      if (decoded.type !== 'refresh') {
        return { success: false, error: 'Invalid refresh token' };
      }

      if (decoded.userId !== userData.userId) {
        return { success: false, error: 'Token mismatch' };
      }

      const newAccessToken = this.generateToken(userData.userId, userData.email, userData.role);
      
      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  // Decode token without verification (for logging)
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
} 