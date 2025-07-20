/**
 * Centralized Authentication Service
 * 
 * This module provides a unified authentication interface across the entire platform.
 * It eliminates duplicate authentication logic and provides consistent security measures.
 */

import { JWTService } from './jwt';
import { authService } from './auth';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: 'free_user' | 'premium_user' | 'admin' | 'super_admin';
  isVerified: boolean;
  isActive: boolean;
  subscriptionTier?: string;
  lastLogin?: Date;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface AuthSession {
  userId: string;
  role: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export class CentralizedAuthService {
  private static instance: CentralizedAuthService;
  private sessions: Map<string, AuthSession> = new Map();

  private constructor() {}

  public static getInstance(): CentralizedAuthService {
    if (!CentralizedAuthService.instance) {
      CentralizedAuthService.instance = new CentralizedAuthService();
    }
    return CentralizedAuthService.instance;
  }

  /**
   * Login user with comprehensive validation
   */
  async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      // Validate email format
      if (!this.isValidEmail(credentials.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Attempt login
      const result = await authService.login(
        credentials.email,
        credentials.password,
        ipAddress,
        userAgent
      );

      if (!result.success || !result.user || !result.token) {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }

      // Generate JWT tokens
      const tokenPair = JWTService.generateTokenPair(
        result.user.id,
        result.user.email,
        result.user.role
      );

      // Create session
      const session: AuthSession = {
        userId: result.user.id,
        role: result.user.role,
        token: tokenPair.accessToken,
        expiresAt: new Date(Date.now() + tokenPair.expiresIn),
        ipAddress,
        userAgent
      };

      this.sessions.set(tokenPair.accessToken, session);

      // Map user data
      const authUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        isVerified: result.user.isVerified,
        isActive: result.user.isActive,
        subscriptionTier: result.user.subscriptionTier,
        lastLogin: new Date()
      };

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed due to server error'
      };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData, ipAddress: string, userAgent: string): Promise<AuthResult> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Attempt registration
      const result = await authService.register(
        data.email,
        data.password,
        data.username,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Registration failed'
        };
      }

      return {
        success: true,
        user: result.user ? {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          role: result.user.role,
          isVerified: result.user.isVerified,
          isActive: result.user.isActive
        } : undefined
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed due to server error'
      };
    }
  }

  /**
   * Verify authentication token
   */
  async verifyToken(token: string, ipAddress: string, userAgent: string): Promise<{ valid: boolean; user?: AuthUser; error?: string }> {
    try {
      // Check if token exists in sessions
      const session = this.sessions.get(token);
      if (!session) {
        return {
          valid: false,
          error: 'Invalid session token'
        };
      }

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        this.sessions.delete(token);
        return {
          valid: false,
          error: 'Session expired'
        };
      }

      // Security check: Verify IP address and user agent
      if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
        console.warn('Security warning: IP or User Agent mismatch for token:', token);
        // In production, you might want to invalidate the session here
      }

      // Verify token with JWT service
      const jwtResult = JWTService.verifyToken(token);
      if (!jwtResult.valid) {
        this.sessions.delete(token);
        return {
          valid: false,
          error: 'Invalid JWT token'
        };
      }

      // Get user data
      const user = await authService.getUserById(session.userId);
      if (!user) {
        this.sessions.delete(token);
        return {
          valid: false,
          error: 'User not found'
        };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        lastLogin: user.lastLogin
      };

      return {
        valid: true,
        user: authUser
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        valid: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove session
      this.sessions.delete(token);

      // Call auth service logout
      await authService.logout(token);

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string, ipAddress: string, userAgent: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const jwtResult = JWTService.verifyRefreshToken(refreshToken);
      if (!jwtResult.valid) {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      // Get user data
      const user = await authService.getUserById(jwtResult.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Generate new token pair
      const tokenPair = JWTService.generateTokenPair(
        user.id,
        user.email,
        user.role
      );

      // Create new session
      const session: AuthSession = {
        userId: user.id,
        role: user.role,
        token: tokenPair.accessToken,
        expiresAt: new Date(Date.now() + tokenPair.expiresIn),
        ipAddress,
        userAgent
      };

      this.sessions.set(tokenPair.accessToken, session);

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        lastLogin: user.lastLogin
      };

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  /**
   * Check if user has admin access
   */
  async checkAdminAccess(token: string, ipAddress: string, userAgent: string): Promise<{ isAdmin: boolean; isSuperAdmin: boolean; error?: string }> {
    try {
      const verification = await this.verifyToken(token, ipAddress, userAgent);
      if (!verification.valid || !verification.user) {
        return {
          isAdmin: false,
          isSuperAdmin: false,
          error: verification.error
        };
      }

      const isAdmin = verification.user.role === 'admin' || verification.user.role === 'super_admin';
      const isSuperAdmin = verification.user.role === 'super_admin';

      return {
        isAdmin,
        isSuperAdmin
      };

    } catch (error) {
      console.error('Admin access check error:', error);
      return {
        isAdmin: false,
        isSuperAdmin: false,
        error: 'Admin access check failed'
      };
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(data: RegisterData): { isValid: boolean; error?: string } {
    // Validate email
    if (!this.isValidEmail(data.email)) {
      return {
        isValid: false,
        error: 'Invalid email format'
      };
    }

    // Validate username
    if (!data.username || data.username.length < 3 || data.username.length > 30) {
      return {
        isValid: false,
        error: 'Username must be between 3 and 30 characters'
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, hyphens, and underscores'
      };
    }

    // Validate password
    if (!data.password || data.password.length < 12) {
      return {
        isValid: false,
        error: 'Password must be at least 12 characters long'
      };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(data.password)) {
      return {
        isValid: false,
        error: 'Password must contain uppercase, lowercase, number, and special character'
      };
    }

    return { isValid: true };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await authService.getUserById(userId);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.updateUser(userId, updates);
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Profile update failed'
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Password change failed'
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.requestPasswordReset(email);
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'Password reset request failed'
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.resetPassword(token, newPassword);
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Password reset failed'
      };
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
      }
    }
  }
}

// Export singleton instance
export const centralizedAuth = CentralizedAuthService.getInstance();

// Export utility functions
export const login = (credentials: LoginCredentials, ipAddress: string, userAgent: string) => 
  centralizedAuth.login(credentials, ipAddress, userAgent);

export const register = (data: RegisterData, ipAddress: string, userAgent: string) => 
  centralizedAuth.register(data, ipAddress, userAgent);

export const verifyToken = (token: string, ipAddress: string, userAgent: string) => 
  centralizedAuth.verifyToken(token, ipAddress, userAgent);

export const logout = (token: string) => centralizedAuth.logout(token);

export const refreshToken = (refreshToken: string, ipAddress: string, userAgent: string) => 
  centralizedAuth.refreshToken(refreshToken, ipAddress, userAgent);

export const checkAdminAccess = (token: string, ipAddress: string, userAgent: string) => 
  centralizedAuth.checkAdminAccess(token, ipAddress, userAgent); 