
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
    
    const thread = await generator.generateTwitterThread(pgn, options);

    res.status(200).json({
      success: true,
      thread,
      tweetCount: thread.length
    });
  } catch (error) {
    console.error('Twitter thread generation error:', error);
    res.status(500).json({
      error: 'Failed to generate Twitter thread',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
