
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

    const { games } = req.body;

    if (!games || !Array.isArray(games)) {
      return res.status(400).json({ error: 'Games array is required' });
    }

    if (games.length === 0) {
      return res.status(400).json({ error: 'At least one game is required' });
    }

    for (const game of games) {
      if (!game.pgn || typeof game.pgn !== 'string') {
        return res.status(400).json({ error: 'Each game must have a valid PGN string' });
      }

      const pgnValid = securityAdapter.validatePGN(game.pgn);
      if (!pgnValid) {
        return res.status(400).json({ 
          error: 'Invalid PGN format detected'
        });
      }
    }

    if (games.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 games allowed per digest' });
    }

    const digestEngine = new EmotionalDigestEngine();
    const weeklyDigest = await digestEngine.generateWeeklyDigest(games);

    securityAdapter.logSecurityEvent('DIGEST_GENERATED', {
      gamesCount: games.length,
      storiesGenerated: weeklyDigest.stories.length,
      week: weeklyDigest.week,
      ip: clientIp
    });

    res.status(200).json({
      success: true,
      digest: weeklyDigest,
      metadata: {
        generatedAt: new Date().toISOString(),
        gamesAnalyzed: games.length,
        storiesCreated: weeklyDigest.stories.length
      }
    });

  } catch (error) {
    console.error('Error generating emotional digest:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'anonymous';
    securityAdapter.logSecurityEvent('DIGEST_GENERATION_ERROR', {
      error: errorMessage,
      ip: clientIp
    });

    res.status(500).json({ 
      error: 'Failed to generate emotional digest',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    });
  }
}
