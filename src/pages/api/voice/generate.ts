// Filename: src/pages/api/voice/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const NICOLE_VOICE_ID = 'piTKgcLEGmPE4e6mEKli';
    
    console.log('API Key exists:', !!process.env.ELEVENLABS_API_KEY);
    console.log('API Key starts with:', process.env.ELEVENLABS_API_KEY?.substring(0, 5));
    
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not found in environment variables');
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }
    
    console.log('Generating voice with ElevenLabs...');
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${NICOLE_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(500).json({ success: false, error: `ElevenLabs API error: ${response.status}` });
    }
    
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    console.log('Voice generated successfully');
    
    return res.status(200).json({ 
      success: true, 
      audio: audioBase64 
    });
    
  } catch (error) {
    console.error('Voice generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate voice' 
    });
  }
}