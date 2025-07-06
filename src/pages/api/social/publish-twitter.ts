
import { NextApiRequest, NextApiResponse } from 'next';
import { VoiceTweetGenerator } from '../../../lib/social/VoiceTweetGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stories, options } = req.body;

    if (!stories || !Array.isArray(stories)) {
      return res.status(400).json({ error: 'Stories array is required' });
    }

    const generator = new VoiceTweetGenerator();
    
    const result = await generator.publishToTwitter(stories, options);

    if (result.success) {
      res.status(200).json({
        success: true,
        tweetIds: result.tweetIds,
        publishedCount: result.tweetIds?.length || 0
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Twitter publish error:', error);
    res.status(500).json({
      error: 'Failed to publish to Twitter',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
