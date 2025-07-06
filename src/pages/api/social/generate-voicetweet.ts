
import { NextApiRequest, NextApiResponse } from 'next';
import { VoiceTweetGenerator } from '../../../lib/social/VoiceTweetGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, options } = req.body;

    if (!pgn) {
      return res.status(400).json({ error: 'PGN is required' });
    }

    const generator = new VoiceTweetGenerator();
    
    const story = await generator.generateTweetableStory(pgn, options);
    
    if (options?.includeAudio) {
      await generator.generateVoiceAudiogram(story, options.audiogramConfig);
    }
    
    if (options?.includeImage) {
      await generator.generateQuoteImage(story, options.imageConfig);
    }

    res.status(200).json({
      success: true,
      story
    });
  } catch (error) {
    console.error('VoiceTweet generation error:', error);
    res.status(500).json({
      error: 'Failed to generate voice tweet',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
