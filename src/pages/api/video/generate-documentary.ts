import { NextApiRequest, NextApiResponse } from 'next';
import { YouTubeDocumentaryGenerator, DocumentaryConfig } from '@/lib/video/YouTubeDocumentaryGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgn, config }: { pgn: string; config: DocumentaryConfig } = req.body;

    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({ error: 'Valid PGN is required' });
    }

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Valid configuration is required' });
    }

    const requiredFields = ['narrationStyle', 'includeAnalysis', 'includeMoveAnnotations', 'maxDuration'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        return res.status(400).json({ error: `Missing required config field: ${field}` });
      }
    }

    const validStyles = ['wiseMentor', 'enthusiasticCommentator', 'thoughtfulPhilosopher', 'warmEncourager', 'poeticStoryteller', 'whisperMode', 'dramaticNarrator'];
    if (!validStyles.includes(config.narrationStyle)) {
      return res.status(400).json({ error: 'Invalid narration style' });
    }

    if (config.maxDuration < 60 || config.maxDuration > 600) {
      return res.status(400).json({ error: 'Max duration must be between 60 and 600 seconds' });
    }

    const generator = new YouTubeDocumentaryGenerator();
    const documentary = await generator.generateDocumentary(pgn, config);

    res.status(200).json({
      success: true,
      documentary
    });

  } catch (error) {
    console.error('Documentary generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
