import { NextApiRequest, NextApiResponse } from 'next';
import { YouTubeDocumentaryGenerator } from '@/lib/video/YouTubeDocumentaryGenerator';

const documentaryGenerator = new YouTubeDocumentaryGenerator();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgnList, gameInfoList, config } = req.body;

    if (!Array.isArray(pgnList) || pgnList.length === 0 || pgnList.length > 5) {
      return res.status(400).json({ error: 'Valid PGN list is required (max 5 items)' });
    }

    for (let i = 0; i < pgnList.length; i++) {
      const pgn = pgnList[i];
      if (!pgn || typeof pgn !== 'string' || pgn.length > 100000) {
        return res.status(400).json({ 
          error: `PGN at index ${i} must be valid string (max 100KB)` 
        });
      }
      if (pgn.trim().length === 0) {
        return res.status(400).json({ 
          error: `PGN at index ${i} cannot be empty` 
        });
      }
    }

    if (gameInfoList && !Array.isArray(gameInfoList)) {
      return res.status(400).json({ error: 'Game info list must be an array' });
    }

    if (config && typeof config !== 'object') {
      return res.status(400).json({ error: 'Config must be an object' });
    }

    const documentaries = await documentaryGenerator.generateBatchDocumentaries(
      pgnList, 
      gameInfoList, 
      config
    );

    res.status(200).json({
      success: true,
      documentaries,
      count: documentaries.length,
      message: `Generated ${documentaries.length} documentaries successfully`
    });

  } catch (error) {
    console.error('Batch documentary generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate batch documentaries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
