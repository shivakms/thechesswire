import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyJWT } from '@/lib/auth/jwt';
import { sendEmail } from '@/lib/email';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'verification_token_required', message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the JWT token
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.email || !decoded.type || decoded.type !== 'email_verification') {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired (24 hours)
    const tokenAge = Date.now() - ((decoded.iat || 0) * 1000);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'token_expired', message: 'Verification link has expired' },
        { status: 400 }
      );
    }

    // Check if user exists and is not already verified
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

    if (user.verified_at) {
      return NextResponse.json(
        { error: 'already_verified', message: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Update user verification status
    await pool.query(
      'UPDATE users SET verified_at = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Create user profile if it doesn't exist
    await pool.query(
      `INSERT INTO user_profiles (user_id, username, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, user.email.split('@')[0]]
    );

    // Send welcome email
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to TheChessWire! 🎉</h1>
        <p>Hello ${user.email.split('@')[0]},</p>
        <p>Welcome to the most secure, intelligent, and visionary chess journalism platform!</p>
        <p>Best regards,<br>TheChessWire.news Team</p>
      </div>
    `;
    await sendEmail(user.email, 'Welcome to TheChessWire! 🎉', welcomeHtml);

    // Log the verification event
    await pool.query(
      'INSERT INTO user_events (user_id, event_type, details, created_at) VALUES ($1, $2, $3, NOW())',
      [
        user.id,
        'email_verified',
        JSON.stringify({
          verified_at: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        verified_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid verification token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'verification_failed', message: 'Email verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'token_required', message: 'Verification token is required' },
      { status: 400 }
    );
  }

  try {
    // Verify the JWT token
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.email || !decoded.type || decoded.type !== 'email_verification') {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const tokenAge = Date.now() - ((decoded.iat || 0) * 1000);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'token_expired', message: 'Verification link has expired' },
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

    return NextResponse.json({
      valid: true,
      email: user.email,
      already_verified: !!user.verified_at,
      expires_in: maxAge - tokenAge
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    return NextResponse.json(
      { error: 'invalid_token', message: 'Invalid verification token' },
      { status: 400 }
    );
  }
} 