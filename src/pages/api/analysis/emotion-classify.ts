import { NextApiRequest, NextApiResponse } from 'next';
import { PGNEmotionClassifier } from '@/lib/analysis/PGNEmotionClassifier';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'Valid PGN string is required' });
    }

    const heatmap = await PGNEmotionClassifier.classifyPGN(pgn);

    res.json({ 
      success: true, 
      heatmap,
      message: 'PGN emotion classification completed successfully'
    });
  } catch (error) {
    console.error('Emotion classification API error:', error);
    res.status(500).json({ 
      error: 'Failed to classify PGN emotions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
