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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as any;

    const notifications = await notificationSystem.getUserNotifications(
      decoded.userId,
      { limit, offset, unreadOnly, type }
    );

    const unreadCount = await notificationSystem.getUnreadCount(decoded.userId);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    
    return NextResponse.json(
      { error: 'fetch_failed', message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { type, title, message, data, options } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    const notificationId = await notificationSystem.createNotification(
      decoded.userId,
      type,
      title,
      message,
      data,
      options
    );

    return NextResponse.json({
      success: true,
      notificationId,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Create notification error:', error);
    
    return NextResponse.json(
      { error: 'creation_failed', message: 'Failed to create notification' },
      { status: 500 }
    );
  }
} 