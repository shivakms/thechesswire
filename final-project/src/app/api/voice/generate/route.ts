import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/security';

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FEMALE_VOICE_ID = 'PmypFHWgqk9ACZdL8ugT'; // Female voice as specified in PROMPT.md

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

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 503 }
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Security validation
    const securityResult = await validateRequest(request);
    if (!securityResult.allowed) {
      return NextResponse.json(
        { error: 'Request blocked for security reasons' },
        { status: 403 }
      );
    }

    const { text, voiceMode = 'calm', voiceId = FEMALE_VOICE_ID } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Validate voice mode
    if (!VOICE_SETTINGS[voiceMode as keyof typeof VOICE_SETTINGS]) {
      return NextResponse.json(
        { error: 'Invalid voice mode' },
        { status: 400 }
      );
    }

    const settings = VOICE_SETTINGS[voiceMode as keyof typeof VOICE_SETTINGS];

    console.log(`🎙️ Generating voice for mode: ${voiceMode}, text length: ${text.length}`);

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
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', {
        status: elevenLabsResponse.status,
        statusText: elevenLabsResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Voice generation failed',
          details: elevenLabsResponse.status === 401 ? 'Invalid API key' : 'Service temporarily unavailable'
        },
        { status: 500 }
      );
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    console.log(`✅ Voice generated successfully: ${audioBuffer.byteLength} bytes`);

    // Return audio response with optimized headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': audioBuffer.byteLength.toString(),
        'X-Voice-Mode': voiceMode,
        'X-Voice-ID': voiceId,
      },
    });

  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 