import { NextApiRequest, NextApiResponse } from 'next';
import { ContentAnalysisPipeline } from '@/lib/analysis/ContentAnalysisPipeline';

const pipeline = new ContentAnalysisPipeline();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, contentType, config } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Valid content is required' });
    }

    if (!contentType || !['pgn', 'article', 'voice', 'video'].includes(contentType)) {
      return res.status(400).json({ error: 'Valid content type is required' });
    }

    if (content.length > 100000) {
      return res.status(400).json({ error: 'Content too large (max 100KB)' });
    }

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const result = await pipeline.analyzeContent(content, contentType, config);

    res.status(200).json({
      success: true,
      analysis: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced pipeline analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
