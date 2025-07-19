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

    const { method, code } = await request.json();
    
    if (!method || !code) {
      return NextResponse.json({ error: 'Method and code are required' }, { status: 400 });
    }

    const userId = session.user.id;
    let isValid = false;

    switch (method) {
      case 'totp':
        isValid = await mfaSystem.verifyTOTP(userId, code);
        break;
      case 'sms':
        isValid = await mfaSystem.verifySMS(userId, code);
        break;
      case 'email':
        isValid = await mfaSystem.verifyEmail(userId, code);
        break;
      default:
        return NextResponse.json({ error: 'Invalid verification method' }, { status: 400 });
    }

    if (isValid) {
      // Enable the MFA method
      await mfaSystem.enableMFAMethod(userId, method);
      
      return NextResponse.json({
        success: true,
        message: 'Verification successful'
      });
    } else {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 