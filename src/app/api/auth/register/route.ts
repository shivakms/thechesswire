import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { JWTService } from '@/lib/auth/jwt';
import { UserRole } from '@/lib/auth/roles';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = 'free_user' } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Prevent registration of admin roles
    if (role === 'admin' || role === 'super_admin') {
      return NextResponse.json(
        { error: 'Admin roles cannot be registered publicly' },
        { status: 403 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole,
      ipAddress,
      userAgent
    });

    if (!newUser.success || !newUser.user) {
      return NextResponse.json(
        { error: newUser.error || 'Registration failed' },
        { status: 500 }
      );
    }

    // Generate JWT tokens
    const tokenPair = JWTService.generateTokenPair(
      newUser.user.id,
      newUser.user.email,
      newUser.user.role
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        firstName: newUser.user.firstName,
        lastName: newUser.user.lastName,
        role: newUser.user.role,
        isVerified: newUser.user.isVerified,
        isActive: newUser.user.isActive
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

    console.log('🔐 API Registration successful:', { 
      email: newUser.user.email, 
      role: newUser.user.role,
      ipAddress 
    });

    return response;

  } catch (error) {
    console.error('❌ API Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 