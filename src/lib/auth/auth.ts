import { UserRole, isSuperAdmin, isAdmin, canAccessDashboard } from './roles';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
  ipAddress: string;
  userAgent: string;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

// Super Admin credentials (you)
const SUPER_ADMIN_CREDENTIALS = {
  email: 'thechesswirenews@gmail.com', // Your email
  password: 'super-admin-secure-password-2024', // Change this to your secure password
  role: UserRole.SUPER_ADMIN,
  id: 'super-admin-001'
};

// Admin credentials (for testing)
const ADMIN_CREDENTIALS = {
  email: 'admin@chesswire.com',
  password: 'admin-secure-password-2024',
  role: UserRole.ADMIN,
  id: 'admin-001'
};

class AuthService {
  private sessions: Map<string, AuthSession> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers() {
    // Initialize Super Admin (you)
    this.users.set(SUPER_ADMIN_CREDENTIALS.id, {
      id: SUPER_ADMIN_CREDENTIALS.id,
      email: SUPER_ADMIN_CREDENTIALS.email,
      role: SUPER_ADMIN_CREDENTIALS.role,
      isVerified: true,
      isActive: true,
      lastLogin: new Date(),
      ipAddress: '',
      userAgent: ''
    });

    // Initialize regular admin
    this.users.set(ADMIN_CREDENTIALS.id, {
      id: ADMIN_CREDENTIALS.id,
      email: ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role,
      isVerified: true,
      isActive: true,
      lastLogin: new Date(),
      ipAddress: '',
      userAgent: ''
    });
  }

  async login(email: string, password: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      // Check Super Admin credentials
      if (email === SUPER_ADMIN_CREDENTIALS.email && password === SUPER_ADMIN_CREDENTIALS.password) {
        const user = this.users.get(SUPER_ADMIN_CREDENTIALS.id);
        if (!user) {
          return { success: false, error: 'Super Admin account not found' };
        }

        // Update user info
        user.lastLogin = new Date();
        user.ipAddress = ipAddress;
        user.userAgent = userAgent;

        // Generate session token
        const token = this.generateSecureToken();
        const session: AuthSession = {
          userId: user.id,
          role: user.role,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress,
          userAgent
        };

        this.sessions.set(token, session);

        console.log('🔐 Super Admin login successful:', { email, ipAddress, userAgent });
        return { success: true, user, token };
      }

      // Check Admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const user = this.users.get(ADMIN_CREDENTIALS.id);
        if (!user) {
          return { success: false, error: 'Admin account not found' };
        }

        // Update user info
        user.lastLogin = new Date();
        user.ipAddress = ipAddress;
        user.userAgent = userAgent;

        // Generate session token
        const token = this.generateSecureToken();
        const session: AuthSession = {
          userId: user.id,
          role: user.role,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress,
          userAgent
        };

        this.sessions.set(token, session);

        console.log('🔐 Admin login successful:', { email, ipAddress, userAgent });
        return { success: true, user, token };
      }

      // For demo purposes, create a regular user
      const demoUser: User = {
        id: 'demo-user-001',
        email,
        role: UserRole.FREE_USER,
        isVerified: true,
        isActive: true,
        lastLogin: new Date(),
        ipAddress,
        userAgent
      };

      this.users.set(demoUser.id, demoUser);

      const token = this.generateSecureToken();
      const session: AuthSession = {
        userId: demoUser.id,
        role: demoUser.role,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        ipAddress,
        userAgent
      };

      this.sessions.set(token, session);

      console.log('🔐 Demo user login successful:', { email, role: demoUser.role, ipAddress });
      return { success: true, user: demoUser, token };

    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async verifyToken(token: string, ipAddress: string, userAgent: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const session = this.sessions.get(token);
      
      if (!session) {
        return { valid: false, error: 'Invalid session token' };
      }

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        this.sessions.delete(token);
        return { valid: false, error: 'Session expired' };
      }

      // Security check: Verify IP address and user agent
      if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
        console.warn('⚠️ Security warning: IP or User Agent mismatch for token:', token);
        this.sessions.delete(token);
        return { valid: false, error: 'Security violation detected' };
      }

      const user = this.users.get(session.userId);
      if (!user) {
        this.sessions.delete(token);
        return { valid: false, error: 'User not found' };
      }

      if (!user.isActive) {
        return { valid: false, error: 'User account is inactive' };
      }

      return { valid: true, user };

    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return { valid: false, error: 'Token verification failed' };
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      this.sessions.delete(token);
      console.log('🔐 User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false };
    }
  }

  async checkAdminAccess(token: string, ipAddress: string, userAgent: string): Promise<{ isAdmin: boolean; isSuperAdmin: boolean; user?: User }> {
    const verification = await this.verifyToken(token, ipAddress, userAgent);
    
    if (!verification.valid || !verification.user) {
      return { isAdmin: false, isSuperAdmin: false };
    }

    const user = verification.user;
    const adminStatus = isAdmin(user.role);
    const superAdminStatus = isSuperAdmin(user.role);

    console.log('🔐 Admin access check:', { 
      email: user.email, 
      role: user.role, 
      isAdmin: adminStatus, 
      isSuperAdmin: superAdminStatus 
    });

    return { 
      isAdmin: adminStatus, 
      isSuperAdmin: superAdminStatus, 
      user 
    };
  }

  async checkDashboardAccess(token: string, dashboardId: string, ipAddress: string, userAgent: string): Promise<{ canAccess: boolean; user?: User; error?: string }> {
    const verification = await this.verifyToken(token, ipAddress, userAgent);
    
    if (!verification.valid || !verification.user) {
      return { canAccess: false, error: 'Invalid session' };
    }

    const user = verification.user;
    const hasAccess = canAccessDashboard(user.role, dashboardId);

    console.log('🔐 Dashboard access check:', { 
      email: user.email, 
      role: user.role, 
      dashboardId, 
      hasAccess 
    });

    return { 
      canAccess: hasAccess, 
      user 
    };
  }

  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Get all active sessions (for admin monitoring)
  async getActiveSessions(): Promise<AuthSession[]> {
    const activeSessions: AuthSession[] = [];
    
    this.sessions.forEach((session, token) => {
      if (new Date() < session.expiresAt) {
        activeSessions.push(session);
      }
    });

    return activeSessions;
  }

  // Get user by ID (for admin functions)
  async getUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  // Update user role (Super Admin only)
  async updateUserRole(userId: string, newRole: UserRole, adminToken: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; error?: string }> {
    const adminCheck = await this.checkAdminAccess(adminToken, ipAddress, userAgent);
    
    if (!adminCheck.isSuperAdmin) {
      return { success: false, error: 'Only Super Admin can update user roles' };
    }

    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.role = newRole;
    console.log('🔐 User role updated:', { userId, oldRole: user.role, newRole });
    
    return { success: true };
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for use in components
export { UserRole, isSuperAdmin, isAdmin, canAccessDashboard }; 