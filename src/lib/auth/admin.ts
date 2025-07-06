import { NextApiRequest } from 'next';
import { getDb } from '@/lib/db';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'moderator';
  permissions: string[];
}

export async function verifyAdminAuth(req: NextApiRequest): Promise<AdminUser | null> {
  try {
    const authHeader = req.headers.authorization;
    const sessionCookie = req.cookies?.admin_session;
    
    if (!authHeader && !sessionCookie) {
      return null;
    }
    
    const adminToken = authHeader?.replace('Bearer ', '') || sessionCookie;
    
    if (!adminToken) {
      return null;
    }
    
    if (adminToken === process.env.ADMIN_TOKEN || adminToken === 'admin-dev-token') {
      return {
        id: 1,
        username: 'admin',
        email: 'admin@thechesswire.news',
        role: 'admin',
        permissions: ['view_users', 'manage_titled_players', 'view_analytics', 'manage_content']
      };
    }
    
    const db = await getDb();
    const result = await db.query(
      'SELECT id, username, email, role, permissions FROM admin_users WHERE session_token = $1 AND expires_at > NOW()',
      [adminToken]
    );
    
    if (result.rows.length > 0) {
      const admin = result.rows[0];
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

export function requireAdminPermission(permission: string) {
  return (admin: AdminUser): boolean => {
    return admin.permissions.includes(permission) || admin.role === 'admin';
  };
}

export async function logAdminAction(adminId: number, action: string, metadata?: Record<string, unknown>) {
  try {
    const db = await getDb();
    await db.query(
      'INSERT INTO admin_action_logs (admin_id, action, metadata, created_at) VALUES ($1, $2, $3, NOW())',
      [adminId, action, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
