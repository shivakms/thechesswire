import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/security';
import logger from '@/lib/logger';

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FEMALE_VOICE_ID = 'PmypFHWgqk9ACZdL8ugT';

// Voice mode settings optimized for the female voice
const VOICE_SETTINGS = {
  calm: { 
    stability: 0.5, 
    similarity_boost: 0.75, 
    style: 0.0, 
    use_speaker_boost: true 
  },
  expressive: { 
    stability: 0.3, 
    similarity_boost: 0.75, 
    style: 0.5, 
    use_speaker_boost: true 
  },
  dramatic: { 
    stability: 0.2, 
    similarity_boost: 0.75, 
    style: 0.8, 
    use_speaker_boost: true 
  },
  poetic: { 
    stability: 0.4, 
    similarity_boost: 0.75, 
    style: 0.6, 
    use_speaker_boost: true 
  }
};

// Request timeout for ElevenLabs API
const ELEVENLABS_TIMEOUT = 30000; // 30 seconds

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate API key
    if (!ELEVENLABS_API_KEY) {
      logger.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 503 }
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for voice generation', {
        ip: request.ip,
        userAgent: request.headers.get('user-agent')
      });
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Security validation
    const securityResult = await validateRequest(request);
    if (!securityResult.allowed) {
      logger.warn('Voice generation request blocked', {
        ip: request.ip,
        reason: securityResult.reason
      });
      return NextResponse.json(
        { error: 'Request blocked for security reasons' },
        { status: 403 }
      );
    }

    const { text, voiceMode = 'calm', voiceId = FEMALE_VOICE_ID } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      logger.warn('Invalid text input for voice generation');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      logger.warn('Text too long for voice generation', { length: text.length });
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Validate voice mode
    if (!VOICE_SETTINGS[voiceMode as keyof typeof VOICE_SETTINGS]) {
      logger.warn('Invalid voice mode requested', { voiceMode });
      return NextResponse.json(
        { error: 'Invalid voice mode' },
        { status: 400 }
      );
    }

    const settings = VOICE_SETTINGS[voiceMode as keyof typeof VOICE_SETTINGS];

    logger.info('Generating voice', {
      mode: voiceMode,
      textLength: text.length,
      voiceId
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ELEVENLABS_TIMEOUT);

    try {
      // Call ElevenLabs API with optimized settings
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text.trim(),
            model_id: 'eleven_monolingual_v1',
            voice_settings: settings,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        logger.error('ElevenLabs API error', {
          status: elevenLabsResponse.status,
          statusText: elevenLabsResponse.statusText,
          error: errorText,
          voiceMode,
          textLength: text.length
        });
        
        let errorMessage = 'Voice generation failed';
        let statusCode = 500;

        if (elevenLabsResponse.status === 401) {
          errorMessage = 'Voice service authentication failed';
          statusCode = 503;
        } else if (elevenLabsResponse.status === 429) {
          errorMessage = 'Voice service rate limit exceeded';
          statusCode = 429;
        } else if (elevenLabsResponse.status === 400) {
          errorMessage = 'Invalid voice request';
          statusCode = 400;
        }

        return NextResponse.json(
          { 
            error: errorMessage,
            details: elevenLabsResponse.status === 401 ? 'Invalid API key' : 'Service temporarily unavailable'
          },
          { status: statusCode }
        );
      }

      const audioBuffer = await elevenLabsResponse.arrayBuffer();
      const generationTime = Date.now() - startTime;

      logger.info('Voice generated successfully', {
        mode: voiceMode,
        textLength: text.length,
        audioSize: audioBuffer.byteLength,
        generationTime: `${generationTime}ms`
      });

      // Return audio response with optimized headers
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
          'Content-Length': audioBuffer.byteLength.toString(),
          'X-Voice-Mode': voiceMode,
          'X-Voice-ID': voiceId,
          'X-Generation-Time': generationTime.toString(),
          'X-Content-Length': audioBuffer.byteLength.toString(),
        },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.error('Voice generation timeout', {
          mode: voiceMode,
          textLength: text.length,
          timeout: ELEVENLABS_TIMEOUT
        });
        return NextResponse.json(
          { error: 'Voice generation timeout' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.error('Voice generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${errorTime}ms`
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
} 