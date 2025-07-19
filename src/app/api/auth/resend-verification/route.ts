import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { signJWT } from '@/lib/auth/jwt';
import { sendEmail } from '@/lib/email';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Rate limiter for resend verification requests
const resendLimiter = new RateLimiterMemory({
  keyGenerator: (req: NextRequest) => {
    const email = req.body?.email || 'unknown';
    return `resend_verification:${email}`;
  },
  points: 3, // 3 attempts
  duration: 3600, // per hour
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'email_required', message: 'Email address is required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    try {
      await resendLimiter.consume(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Too many verification requests. Please wait an hour before trying again.' },
        { status: 429 }
      );
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, verified_at, created_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.verified_at) {
      return NextResponse.json(
        { error: 'already_verified', message: 'This email is already verified' },
        { status: 400 }
      );
    }

    // Check if user was created recently (within last 5 minutes)
    const userAge = Date.now() - new Date(user.created_at).getTime();
    const minAge = 5 * 60 * 1000; // 5 minutes

    if (userAge < minAge) {
      return NextResponse.json(
        { error: 'too_soon', message: 'Please wait a few minutes before requesting another verification email' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = await signJWT(
      {
        email: user.email,
        type: 'email_verification',
        userId: user.id
      },
      '24h'
    );

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - TheChessWire',
        template: 'email-verification',
        data: {
          username: user.email.split('@')[0],
          verificationUrl,
          expiresIn: '24 hours',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@thechesswire.news'
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'email_send_failed', message: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    // Log the resend event
    await pool.query(
      'INSERT INTO user_events (user_id, event_type, details, created_at) VALUES ($1, $2, $3, NOW())',
      [
        user.id,
        'verification_resent',
        JSON.stringify({
          ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    
    return NextResponse.json(
      { error: 'resend_failed', message: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
} 