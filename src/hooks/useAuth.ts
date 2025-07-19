'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService, User, UserRole, isSuperAdmin, isAdmin } from '@/lib/auth/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminAccess: () => Promise<boolean>;
  checkDashboardAccess: (dashboardId: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;

      const verification = await authService.verifyToken(token, ipAddress, userAgent);
      
      if (verification.valid && verification.user) {
        setUser(verification.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      return '127.0.0.1';
    } catch (error) {
      return 'unknown';
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;

      const result = await authService.login(email, password, ipAddress, userAgent);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;

      const result = await authService.checkAdminAccess(token, ipAddress, userAgent);
      return result.isAdmin || result.isSuperAdmin;
    } catch (error) {
      return false;
    }
  };

  const checkDashboardAccess = async (dashboardId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;

      const result = await authService.checkDashboardAccess(token, dashboardId, ipAddress, userAgent);
      return result.canAccess;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user ? isAdmin(user.role) : false,
    isSuperAdmin: user ? isSuperAdmin(user.role) : false,
    login,
    logout,
    checkAdminAccess,
    checkDashboardAccess,
    loading
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 