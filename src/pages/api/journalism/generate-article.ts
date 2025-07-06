import { NextApiRequest, NextApiResponse } from 'next';
import { AIJournalist, StorytellingConfig } from '../../../lib/journalism/AIJournalist';
import { PGNAnalyzer } from '../../../lib/chess/PGNAnalyzer';

const aiJournalist = new AIJournalist();
const pgnAnalyzer = new PGNAnalyzer();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, config } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'Valid PGN is required' });
    }

    const validatedConfig: StorytellingConfig = {
      mode: ['dramatic', 'analytical', 'historical', 'poetic', 'humorous'].includes(config.mode) 
        ? config.mode : 'dramatic',
      includeAlternateEndings: Boolean(config.includeAlternateEndings),
      historicalContext: Boolean(config.historicalContext),
      emotionalIntensity: ['low', 'medium', 'high', 'extreme'].includes(config.emotionalIntensity) 
        ? config.emotionalIntensity : 'medium',
      targetAudience: ['casual', 'serious', 'mixed'].includes(config.targetAudience) 
        ? config.targetAudience : 'mixed',
      accessLevel: ['freemium', 'premium'].includes(config.accessLevel) 
        ? config.accessLevel : 'freemium'
    };

    if (validatedConfig.accessLevel === 'freemium' && 
        (validatedConfig.includeAlternateEndings || validatedConfig.mode === 'poetic')) {
      return res.status(403).json({ 
        error: 'Advanced storytelling features require premium access' 
      });
    }

    const analysis = await pgnAnalyzer.analyzePGN(pgn);

    if (!analysis.isValid) {
      return res.status(400).json({ error: 'Invalid PGN provided' });
    }

    const generatedArticle = await aiJournalist.generateArticle(analysis, validatedConfig);

    res.status(200).json({
      success: true,
      article: generatedArticle,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI article generation error:', error);
    res.status(500).json({ 
      error: 'AI article generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
