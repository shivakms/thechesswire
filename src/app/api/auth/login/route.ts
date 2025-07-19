import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { JWTService } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate user
    const result = await authService.login(email, password, ipAddress, userAgent);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const tokenPair = JWTService.generateTokenPair(
      result.user.id,
      result.user.email,
      result.user.role
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        isVerified: result.user.isVerified,
        isActive: result.user.isActive
      },
      tokens: tokenPair
    });

    // Set HTTP-only cookies for security
    response.cookies.set('auth_token', tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenPair.expiresIn / 1000 // Convert to seconds
    });

    response.cookies.set('refresh_token', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    console.log('🔐 API Login successful:', { 
      email: result.user.email, 
      role: result.user.role,
      ipAddress 
    });

    return response;

  } catch (error) {
    console.error('❌ API Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 