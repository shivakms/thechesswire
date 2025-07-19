import { NextRequest, NextResponse } from 'next/server';
import { mfaSystem } from '@/lib/auth/mfa';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userId = session.user.id;
    await mfaSystem.generateEmailVerification(userId, email);

    return NextResponse.json({
      success: true,
      message: 'Email verification code sent'
    });

  } catch (error) {
    console.error('Email setup error:', error);
    return NextResponse.json(
      { error: 'Failed to send email verification code' },
      { status: 500 }
    );
  }
} 