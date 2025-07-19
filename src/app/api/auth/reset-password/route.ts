import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyJWT } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Verify the JWT token
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.email || !decoded.type || decoded.type !== 'password_reset') {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired (1 hour)
    const tokenAge = Date.now() - (decoded.iat * 1000);
    const maxAge = 60 * 60 * 1000; // 1 hour

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'token_expired', message: 'Password reset link has expired' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [decoded.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if the new password is the same as the current one
    const isSamePassword = await bcrypt.compare(password, user.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'same_password', message: 'New password must be different from the current password' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);

    // Update the user's password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    );

    // Mark the reset token as used
    await pool.query(
      'UPDATE password_reset_tokens SET is_used = TRUE WHERE user_id = $1 AND is_used = FALSE',
      [user.id]
    );

    // Invalidate all existing sessions for this user
    await pool.query(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
      [user.id]
    );

    // Log the password reset event
    await pool.query(
      'INSERT INTO user_events (user_id, event_type, details, created_at) VALUES ($1, $2, $3, NOW())',
      [
        user.id,
        'password_reset',
        JSON.stringify({
          ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          reset_method: 'email_token'
        })
      ]
    );

    // Send password change notification email
    try {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail({
        to: user.email,
        subject: 'Password Changed - TheChessWire',
        template: 'password-changed',
        data: {
          username: user.email.split('@')[0],
          changedAt: new Date().toISOString(),
          ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@thechesswire.news'
        }
      });
    } catch (emailError) {
      console.error('Failed to send password change notification:', emailError);
      // Don't fail the reset if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'reset_failed', message: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 