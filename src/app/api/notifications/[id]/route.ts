import { NextRequest, NextResponse } from 'next/server';
import { notificationSystem } from '@/lib/notifications';
import { verifyJWT } from '@/lib/auth/jwt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const { action } = await request.json();

    if (action === 'mark_read') {
      await notificationSystem.markAsRead(id, decoded.userId);
      
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'invalid_action', message: 'Invalid action specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Update notification error:', error);
    
    return NextResponse.json(
      { error: 'update_failed', message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    await notificationSystem.deleteNotification(id, decoded.userId);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    
    return NextResponse.json(
      { error: 'delete_failed', message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 