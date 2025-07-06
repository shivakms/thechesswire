import { NextApiRequest, NextApiResponse } from 'next';
import { PGNAnalyzer } from '../../../lib/chess/PGNAnalyzer';

const pgnAnalyzer = new PGNAnalyzer();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, enhanceContent = false, originalContent = '' } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'Valid PGN string is required' });
    }

    const analysis = await pgnAnalyzer.analyzePGN(pgn);

    let enhancedContent = originalContent;
    if (enhanceContent && analysis.isValid && originalContent) {
      enhancedContent = await pgnAnalyzer.enhanceContentWithAI(originalContent, analysis);
    }

    res.status(200).json({
      success: true,
      analysis,
      enhancedContent: enhanceContent ? enhancedContent : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('PGN analysis error:', error);
    res.status(500).json({ 
      error: 'PGN analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
