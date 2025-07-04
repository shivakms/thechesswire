// app/api/voice/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export async function POST(request: NextRequest) {
  try {
    // Check if we're using ElevenLabs or fallback
    if (!ELEVENLABS_API_KEY) {
      console.log('No ElevenLabs API key, using browser fallback');
      return NextResponse.json(
        { fallback: true },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { text, voiceId, modelId, voiceSettings } = body;

    // Make request to ElevenLabs
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: modelId || 'eleven_monolingual_v1',
        voice_settings: voiceSettings || {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status);
      return NextResponse.json(
        { fallback: true },
        { status: 200 }
      );
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio file
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { fallback: true },
      { status: 200 }
    );
  }
}