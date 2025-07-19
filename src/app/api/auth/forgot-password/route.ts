import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { pool } from '@/lib/database';
import { sendEmail } from '@/lib/email';
import { JWTService } from '@/lib/auth/jwt';
import { logSecurityEvent } from '@/lib/security';

// Rate limiter for forgot password
const forgotPasswordLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // 1 hour
});

export async function POST(request: NextRequest) {
  // Get client IP for security logging
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // Rate limiting
    try {
      await forgotPasswordLimiter.consume(clientIP);
    } catch (rateLimitError) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'missing_email', message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, verified_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Don't reveal if email exists or not
        return NextResponse.json(
          { success: true, message: 'If the email exists, a password reset link has been sent.' }
        );
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = JWTService.sign({
        userId: user.id,
        email: user.email,
        type: 'password_reset'
      }, '1h');

      // Store reset token in database
      await client.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
        [resetToken, user.id]
      );

      // Send password reset email
      const emailResult = await sendEmail(
        user.email,
        'Password Reset Request - TheChessWire',
        `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your TheChessWire account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        `
      );

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
      }

      // Log security event
      await logSecurityEvent('password_reset_requested', {
        userId: user.id,
        email: user.email,
        ip: clientIP
      });

      return NextResponse.json(
        { success: true, message: 'If the email exists, a password reset link has been sent.' }
      );

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Password reset error:', error);
    
    // Log security event
    await logSecurityEvent('password_reset_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP
    });

    return NextResponse.json(
      { error: 'internal_error', message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 