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

    const userId = session.user.id;
    const email = session.user.email || '';

    const { secret, qrCode, backupCodes } = await mfaSystem.generateTOTPSecret(userId, email);

    return NextResponse.json({
      success: true,
      qrCode,
      backupCodes
    });

  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup TOTP authentication' },
      { status: 500 }
    );
  }
} 