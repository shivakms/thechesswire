import { NextApiRequest, NextApiResponse } from 'next';
import { ReplayEngine } from '../../../lib/chess/ReplayEngine';
import { PGNAnalyzer } from '../../../lib/chess/PGNAnalyzer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, config } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'Valid PGN is required' });
    }

    if (config.accessLevel === 'freemium' && config.voiceNarration) {
      return res.status(403).json({ error: 'Voice narration requires premium access' });
    }

    const pgnAnalyzer = new PGNAnalyzer();
    const analysis = await pgnAnalyzer.analyzePGN(pgn);

    if (!analysis.isValid) {
      return res.status(400).json({ error: 'Invalid PGN provided' });
    }

    const replayEngine = new ReplayEngine(pgn, analysis, config);
    const session = replayEngine.exportSession();

    res.status(200).json({
      success: true,
      session,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Replay narration generation error:', error);
    res.status(500).json({ 
      error: 'Replay narration generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
