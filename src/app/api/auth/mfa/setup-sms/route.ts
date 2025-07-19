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

    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const userId = session.user.id;
    await mfaSystem.generateSMSVerification(userId, phoneNumber);

    return NextResponse.json({
      success: true,
      message: 'SMS verification code sent'
    });

  } catch (error) {
    console.error('SMS setup error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS verification code' },
      { status: 500 }
    );
  }
} 