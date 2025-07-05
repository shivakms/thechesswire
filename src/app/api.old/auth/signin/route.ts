// File: /src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, username, password } = body;

  try {
    // Determine which credential was provided
    const loginField = email ? 'email' : 'username';
    const loginValue = email || username;

    if (!loginValue || !password) {
      return NextResponse.json(
        { message: 'Missing credentials' },
        { status: 400 }
      );
    }

    // Find user by email OR username
    const user = await findUserByEmailOrUsername(loginField, loginValue);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token (in production, use JWT or similar)
    const token = generateSessionToken(user.id);

    // Log signin event
    await logSigninEvent(user.id, request);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      email: user.email,
      isTitledPlayer: user.isTitledPlayer,
      ipHash: await hashIP(request.headers.get('x-forwarded-for') || '')
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Helper functions
async function findUserByEmailOrUsername(_field: string, _value: string): Promise<{
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  isTitledPlayer: boolean;
} | null> {
  // In production, query your database
  // Example with Prisma:
  // return await prisma.user.findFirst({
  //   where: {
  //     [field]: value.toLowerCase()
  //   }
  // });
  
  console.log('Finding user by', _field, ':', _value);
  // Placeholder
  return {
    id: '123',
    email: 'user@example.com',
    username: 'chessmaster',
    passwordHash: '$2a$10$...',
    isTitledPlayer: false
  };
}

function generateSessionToken(userId: string): string {
  // In production, use JWT or similar
  return `session_${userId}_${Date.now()}`;
}

async function hashIP(ip: string): Promise<string> {
  // Hash IP for privacy
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(ip).digest('hex');
}

async function logSigninEvent(userId: string, request: NextRequest) {
  // Log signin for security monitoring
  const event = {
    userId,
    timestamp: new Date().toISOString(),
    ipHash: await hashIP(request.headers.get('x-forwarded-for') || ''),
    userAgent: request.headers.get('user-agent'),
    method: request.headers.get('referer')?.includes('username') ? 'username' : 'email'
  };
  
  console.log('Signin event:', event);
  // In production, save to database
}
