import { NextApiRequest, NextApiResponse } from 'next';
import { SixtySecondsGenius } from '@/lib/video/SixtySecondsGenius';

const geniusGenerator = new SixtySecondsGenius();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, config } = req.body;

    if (!pgn || typeof pgn !== 'string' || pgn.length > 50000) {
      return res.status(400).json({ error: 'Valid PGN is required (max 50KB)' });
    }
    
    if (pgn.trim().length === 0) {
      return res.status(400).json({ error: 'PGN cannot be empty' });
    }

    const geniusShort = await geniusGenerator.generateDailyShort(pgn, config);

    res.status(200).json({
      success: true,
      short: geniusShort,
      message: '60 Seconds of Genius short generated successfully'
    });

  } catch (error) {
    console.error('Genius short generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate genius short',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
