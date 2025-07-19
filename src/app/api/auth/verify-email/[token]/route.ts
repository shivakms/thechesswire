import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET verified_at = NOW() WHERE verification_token = $1 AND verified_at IS NULL RETURNING id, email',
        [token]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            error: 'Invalid Token',
            message: 'Verification token is invalid or already used'
          },
          { status: 400 }
        );
      }

      // Clear the verification token
      await client.query(
        'UPDATE users SET verification_token = NULL WHERE id = $1',
        [result.rows[0].id]
      );

      // Log successful verification
      await client.query(
        'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, details) VALUES ($1, $2, $3, $4, $5)',
        [
          result.rows[0].id,
          'email_verified',
          request.ip || 'unknown',
          request.headers.get('user-agent') || 'unknown',
          JSON.stringify({ email: result.rows[0].email })
        ]
      );

      return NextResponse.json({
        message: 'Email verified successfully. You can now log in.',
        userId: result.rows[0].id
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json(
      { 
        error: 'Verification Failed',
        message: 'Failed to verify email. Please try again.'
      },
      { status: 500 }
    );
  }
} 