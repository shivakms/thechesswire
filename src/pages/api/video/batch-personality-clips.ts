import { NextApiRequest, NextApiResponse } from 'next';
import { BambaiLivePersonality, LivePersonalityConfig } from '../../../lib/voice/BambaiLivePersonality';

const personalityGenerator = new BambaiLivePersonality();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { configs } = req.body;

    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({ error: 'Valid configs array is required' });
    }

    if (configs.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 configs per batch' });
    }

    const validatedConfigs: LivePersonalityConfig[] = configs.map(config => ({
      personality: ['enthusiastic', 'analytical', 'dramatic', 'humorous', 'philosophical'].includes(config.personality) 
        ? config.personality : 'enthusiastic',
      topic: typeof config.topic === 'string' && config.topic.length > 0 
        ? config.topic.slice(0, 500) : 'Amazing chess position',
      duration: Math.min(Math.max(config.duration || 30, 15), 90),
      energy_level: ['low', 'medium', 'high', 'extreme'].includes(config.energy_level) 
        ? config.energy_level : 'medium',
      target_audience: ['casual', 'serious', 'mixed'].includes(config.target_audience) 
        ? config.target_audience : 'mixed',
      include_chess_terms: Boolean(config.include_chess_terms),
      add_personality_quirks: Boolean(config.add_personality_quirks)
    }));

    const personalityClips = await personalityGenerator.batchGenerateClips(validatedConfigs);

    res.status(200).json({
      success: true,
      personalityClips,
      processed: personalityClips.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch personality clips generation error:', error);
    res.status(500).json({ 
      error: 'Batch personality clips generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
