
import { NextApiRequest, NextApiResponse } from 'next';
import { EmotionalDigestEngine } from '../../../lib/storytelling/EmotionalDigestEngine';
import { SecurityAdapter } from '../../../../backend/src/security/core/SecurityAdapter';

const securityAdapter = new SecurityAdapter();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'anonymous';

    // Rate limiting
    const rateLimitOk = await securityAdapter.checkRateLimit(clientIp);
    if (!rateLimitOk) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: 900 // 15 minutes
      });
    }

    const { pgn, storyType } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'PGN string is required' });
    }

    if (!storyType || typeof storyType !== 'string') {
      return res.status(400).json({ error: 'Story type is required' });
    }

    const validStoryTypes = ['brilliance', 'sacrifice', 'heartbreak', 'comeback', 'blunder'];
    if (!validStoryTypes.includes(storyType)) {
      return res.status(400).json({ 
        error: 'Invalid story type',
        validTypes: validStoryTypes 
      });
    }

    const pgnValid = securityAdapter.validatePGN(pgn);
    if (!pgnValid) {
      return res.status(400).json({ 
        error: 'Invalid PGN format detected'
      });
    }

    const digestEngine = new EmotionalDigestEngine();
    const narration = await digestEngine.generateStoryNarration(pgn, storyType as 'brilliance' | 'sacrifice' | 'heartbreak' | 'comeback' | 'blunder');

    securityAdapter.logSecurityEvent('STORY_GENERATED', {
      storyType,
      pgnLength: pgn.length,
      ip: clientIp
    });

    res.status(200).json({
      success: true,
      narration,
      storyType,
      metadata: {
        generatedAt: new Date().toISOString(),
        voiceMode: digestEngine['getVoiceModeForStory'](storyType as 'brilliance' | 'sacrifice' | 'heartbreak' | 'comeback' | 'blunder')
      }
    });

  } catch (error) {
    console.error('Error generating story narration:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'anonymous';
    securityAdapter.logSecurityEvent('STORY_GENERATION_ERROR', {
      error: errorMessage,
      ip: clientIp
    });

    res.status(500).json({ 
      error: 'Failed to generate story narration',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    });
  }
}
