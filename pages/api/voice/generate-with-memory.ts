// Filename: pages/api/voice/generate-with-memory.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { BambaiVoiceEngine } from '@/lib/voice/BambaiVoiceEngine';
import { VoiceMemorySystem } from '@/lib/voice/VoiceMemorySystem';

const bambai = new BambaiVoiceEngine();
const memorySystem = new VoiceMemorySystem();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = 'anonymous';

    const { 
      text, 
      mode = 'auto', 
      tone = 'neutral',
      context = 'general',
      memoryEvent 
    } = req.body;

    // Store memory event if provided
    if (memoryEvent && userId !== 'anonymous') {
      await memorySystem.rememberUser(userId, {
        ...memoryEvent,
        timestamp: new Date()
      });
    }

    // Generate voice with personalization
    let audioBuffer: Buffer;
    
    if (userId !== 'anonymous' && context !== 'general') {
      // Use memory-enhanced narration
      audioBuffer = await memorySystem.generatePersonalizedNarration(
        userId,
        text,
        context as 'game' | 'analysis' | 'welcome'
      );
    } else {
      // Standard generation with auto-detection
      audioBuffer = await bambai.generateVoice(text, mode === 'auto' ? undefined : mode, tone);
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(audioBuffer);
  } catch (error) {
    console.error('Voice generation error:', error);
    res.status(500).json({ error: 'Failed to generate voice' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '50mb',
  },
};
