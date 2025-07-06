import { NextApiRequest, NextApiResponse } from 'next';
import { ContentAnalysisPipeline } from '@/lib/analysis/ContentAnalysisPipeline';

const pipeline = new ContentAnalysisPipeline();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentItems, config } = req.body;

    if (!Array.isArray(contentItems) || contentItems.length === 0) {
      return res.status(400).json({ error: 'Valid content items array is required' });
    }

    if (contentItems.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 items per batch' });
    }

    for (const item of contentItems) {
      if (!item.content || typeof item.content !== 'string') {
        return res.status(400).json({ error: 'Each item must have valid content' });
      }
      
      if (!item.type || !['pgn', 'article', 'voice', 'video'].includes(item.type)) {
        return res.status(400).json({ error: 'Each item must have valid type' });
      }

      if (item.content.length > 100000) {
        return res.status(400).json({ error: 'Each content item must be under 100KB' });
      }
    }

    const results = await pipeline.batchAnalyze(contentItems, config);

    res.status(200).json({
      success: true,
      results,
      processed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch enhanced analysis error:', error);
    res.status(500).json({ 
      error: 'Batch analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
