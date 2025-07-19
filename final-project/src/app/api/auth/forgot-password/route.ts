import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import { sendPasswordResetEmail } from '@/lib/email';
import { logSecurityEvent } from '@/lib/security';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, username, verified_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
      }

      const user = result.rows[0];

      // Check if email is verified
      if (!user.verified_at) {
        return NextResponse.json(
          { 
            error: 'Email Not Verified',
            message: 'Please verify your email address before requesting a password reset.'
          },
          { status: 403 }
        );
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await client.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 WHERE id = $3',
        [resetToken, resetExpiry, user.id]
      );

      // Send reset email
      await sendPasswordResetEmail(email, resetToken, user.username);

      // Log password reset request
      await logSecurityEvent({
        userId: user.id,
        eventType: 'password_reset_requested',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { email }
      });

      return NextResponse.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Forgot password failed:', error);
    return NextResponse.json(
      { 
        error: 'Request Failed',
        message: 'Failed to process password reset request.'
      },
      { status: 500 }
    );
  }
} 