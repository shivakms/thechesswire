import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import { logSecurityEvent } from '@/lib/security';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
      'Password must contain uppercase, lowercase, number, and special character')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify token and update password
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expiry > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            error: 'Invalid Token',
            message: 'Reset token is invalid or expired'
          },
          { status: 400 }
        );
      }

      const userId = result.rows[0].id;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password and clear reset token
      await client.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expiry = NULL WHERE id = $2',
        [hashedPassword, userId]
      );

      // Log password reset
      await logSecurityEvent({
        userId,
        eventType: 'password_reset_completed',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      return NextResponse.json({
        message: 'Password reset successfully. You can now log in with your new password.'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json(
      { 
        error: 'Reset Failed',
        message: 'Failed to reset password. Please try again.'
      },
      { status: 500 }
    );
  }
} 