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

    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Backup code is required' }, { status: 400 });
    }

    const userId = session.user.id;
    const isValid = await mfaSystem.verifyBackupCode(userId, code);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Backup code verification successful'
      });
    } else {
      return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 });
    }

  } catch (error) {
    console.error('Backup code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify backup code' },
      { status: 500 }
    );
  }
} 