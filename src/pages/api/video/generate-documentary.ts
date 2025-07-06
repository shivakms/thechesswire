import { NextApiRequest, NextApiResponse } from 'next';
import { YouTubeDocumentaryGenerator } from '@/lib/video/YouTubeDocumentaryGenerator';

const documentaryGenerator = new YouTubeDocumentaryGenerator();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, gameInfo, config } = req.body;

    if (!pgn || typeof pgn !== 'string' || pgn.length > 100000) {
      return res.status(400).json({ error: 'Valid PGN is required (max 100KB)' });
    }
    
    if (pgn.trim().length === 0) {
      return res.status(400).json({ error: 'PGN cannot be empty' });
    }

    if (gameInfo && typeof gameInfo !== 'object') {
      return res.status(400).json({ error: 'Game info must be an object' });
    }

    if (config && typeof config !== 'object') {
      return res.status(400).json({ error: 'Config must be an object' });
    }

    const documentary = await documentaryGenerator.generateDocumentary(pgn, gameInfo, config);

    res.status(200).json({
      success: true,
      documentary,
      message: 'YouTube documentary generated successfully'
    });

  } catch (error) {
    console.error('Documentary generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate documentary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
