import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyJWT } from '@/lib/auth/jwt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'token_required', message: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Verify the JWT token
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.email || !decoded.type || decoded.type !== 'password_reset') {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid reset token' },
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
      'SELECT id, email, verified_at FROM users WHERE email = $1',
      [decoded.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.verified_at) {
      return NextResponse.json(
        { error: 'email_not_verified', message: 'Email must be verified before resetting password' },
        { status: 400 }
      );
    }

    // Check if token has been used
    const tokenResult = await pool.query(
      'SELECT is_used FROM password_reset_tokens WHERE user_id = $1 AND token_hash = $2 ORDER BY created_at DESC LIMIT 1',
      [user.id, token] // In production, hash the token for comparison
    );

    if (tokenResult.rows.length > 0 && tokenResult.rows[0].is_used) {
      return NextResponse.json(
        { error: 'token_used', message: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      expires_in: maxAge - tokenAge
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'validation_failed', message: 'Failed to validate reset token' },
      { status: 500 }
    );
  }
} 