import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  type?: 'access' | 'refresh' | 'verification' | 'reset' | 'password_reset' | 'email_verification';
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static secret = JWT_SECRET;

  static sign(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = JWT_EXPIRES_IN): string {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  static verify(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  static verifyToken(token: string): JWTPayload | null {
    return this.verify(token);
  }

  static generateTokenPair(userId: string, email: string, role: string = 'user') {
    const accessToken = this.sign({
      userId,
      email,
      role,
      type: 'access'
    }, '15m');

    const refreshToken = this.sign({
      userId,
      email,
      role,
      type: 'refresh'
    }, '7d');

    return { accessToken, refreshToken };
  }

  static decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      console.error('JWT decode failed:', error);
      return null;
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

// Legacy function exports for backward compatibility
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = JWT_EXPIRES_IN): string {
  return JWTService.sign(payload, expiresIn);
}

export function verifyJWT(token: string): JWTPayload | null {
  return JWTService.verify(token);
}

export function decodeJWT(token: string): JWTPayload | null {
  return JWTService.decode(token);
} 