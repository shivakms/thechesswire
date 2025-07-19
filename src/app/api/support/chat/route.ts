import { NextRequest, NextResponse } from 'next/server';
import { aiSupportSystem } from '@/lib/ai-support';
import { verifyJWT } from '@/lib/auth/jwt';

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

    const { message, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'missing_message', message: 'Message is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Process the message through AI support system
    const aiResponse = await aiSupportSystem.processUserMessage(
      decoded.userId,
      message,
      context
    );

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      suggestedActions: aiResponse.suggestedActions,
      category: aiResponse.category,
      priority: aiResponse.priority,
      autoResolve: aiResponse.autoResolve,
      responseTime
    });

  } catch (error) {
    console.error('AI support chat error:', error);
    
    return NextResponse.json(
      { error: 'chat_failed', message: 'Failed to process your message' },
      { status: 500 }
    );
  }
} 