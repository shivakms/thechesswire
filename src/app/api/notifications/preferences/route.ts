import { NextRequest, NextResponse } from 'next/server';
import { notificationSystem } from '@/lib/notifications';
import { verifyJWT } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const preferences = await notificationSystem.getUserPreferences(decoded.userId);

    return NextResponse.json({
      preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    
    return NextResponse.json(
      { error: 'fetch_failed', message: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const preferences = await request.json();

    await notificationSystem.updateUserPreferences(decoded.userId, preferences);

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    
    return NextResponse.json(
      { error: 'update_failed', message: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
} 