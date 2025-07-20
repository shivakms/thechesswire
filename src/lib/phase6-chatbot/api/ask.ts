// Phase 6: Bambai AI Assistant API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { bambaiAgent } from '../chatbot_core/agent';
import { moderationService } from '../utils/moderation';
import { getChatbotConfig } from '../chatbot_core/config';
import { ChatResponse, ErrorResponse, RateLimitInfo } from '../types';
import logger from '@/lib/logger';

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: Date }>();

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | ErrorResponse>> {
  const startTime = Date.now();

  try {
    // CORS check
    const origin = request.headers.get('origin');
    const config = getChatbotConfig();
    
    if (origin && !config.security.allowedOrigins.includes(origin)) {
      return NextResponse.json({
        error: 'CORS policy violation',
        code: 'CORS_ERROR',
        timestamp: new Date(),
      }, { status: 403 });
    }

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const rateLimitResult = checkRateLimit(clientId, config);
    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        details: rateLimitResult,
        timestamp: new Date(),
      }, { status: 429 });
    }

    // Parse request body
    const body = await request.json();
    const { message, sessionId, userId, voiceMode } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        error: 'Invalid message format',
        code: 'INVALID_INPUT',
        timestamp: new Date(),
      }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({
        error: 'Session ID is required',
        code: 'MISSING_SESSION_ID',
        timestamp: new Date(),
      }, { status: 400 });
    }

    // Content moderation
    if (config.features.enableModeration) {
      const moderationResult = await moderationService.moderate(message);
      if (moderationResult.isToxic) {
        logger.warn('🚫 Message blocked by moderation', {
          sessionId,
          userId,
          reason: moderationResult.reason,
        });

        return NextResponse.json({
          error: 'Message blocked by content moderation',
          code: 'CONTENT_MODERATION',
          details: moderationResult,
          timestamp: new Date(),
        }, { status: 400 });
      }
    }

    // Process message with Bambai AI
    const response = await bambaiAgent.processMessage(message, sessionId, userId);

    // Log successful interaction
    logger.info('✅ Chatbot response generated', {
      sessionId,
      userId,
      messageLength: message.length,
      responseLength: response.message.length,
      processingTime: response.metadata.processingTime,
      tools: response.metadata.tools,
    });

    // Add CORS headers
    const responseHeaders = new Headers();
    if (origin) {
      responseHeaders.set('Access-Control-Allow-Origin', origin);
    }
    responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Forwarded-For, X-Real-IP');
    responseHeaders.set('Access-Control-Max-Age', '86400');

    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    logger.error('❌ Error in chatbot API', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
      timestamp: new Date(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const config = getChatbotConfig();
  
  const responseHeaders = new Headers();
  
  if (origin && config.security.allowedOrigins.includes(origin)) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
  }
  
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Forwarded-For, X-Real-IP');
  responseHeaders.set('Access-Control-Max-Age', '86400');

  return new NextResponse(null, {
    status: 200,
    headers: responseHeaders,
  });
}

function checkRateLimit(clientId: string, config: any): { success: boolean; info?: RateLimitInfo } {
  const now = new Date();
  const windowMs = config.security.rateLimitWindow;
  const limit = config.security.rateLimit;

  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: new Date(now.getTime() + windowMs),
    });
    
    return {
      success: true,
      info: {
        remaining: limit - 1,
        resetTime: new Date(now.getTime() + windowMs),
        limit,
      },
    };
  }

  if (clientData.count >= limit) {
    return {
      success: false,
      info: {
        remaining: 0,
        resetTime: clientData.resetTime,
        limit,
      },
    };
  }

  // Increment count
  clientData.count++;
  rateLimitStore.set(clientId, clientData);

  return {
    success: true,
    info: {
      remaining: limit - clientData.count,
      resetTime: clientData.resetTime,
      limit,
    },
  };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = new Date();
  for (const [clientId, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(clientId);
    }
  }
}, 60000); // Clean up every minute 