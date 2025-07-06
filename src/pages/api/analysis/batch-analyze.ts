import { NextApiRequest, NextApiResponse } from 'next';
import { ContentAnalysisPipeline, AnalysisConfig } from '@/lib/analysis/ContentAnalysisPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentItems, config } = req.body;

    if (!contentItems || !Array.isArray(contentItems)) {
      return res.status(400).json({ 
        error: 'Missing or invalid contentItems array' 
      });
    }

    if (contentItems.length > 10) {
      return res.status(400).json({ 
        error: 'Batch size limited to 10 items per request' 
      });
    }

    const validContentTypes = ['pgn', 'article', 'video', 'audio'];
    for (const item of contentItems) {
      if (!item.content || !item.type) {
        return res.status(400).json({ 
          error: 'Each content item must have content and type fields' 
        });
      }
      
      if (!validContentTypes.includes(item.type)) {
        return res.status(400).json({ 
          error: `Invalid content type: ${item.type}. Must be one of: ${validContentTypes.join(', ')}` 
        });
      }
    }

    const analysisConfig: AnalysisConfig = {
      includeEmotionalAnalysis: config?.includeEmotionalAnalysis ?? true,
      generateNarrativeAdaptations: config?.generateNarrativeAdaptations ?? true,
      extractKeyMoments: config?.extractKeyMoments ?? true,
      generateSocialSnippets: config?.generateSocialSnippets ?? true,
      voiceMode: config?.voiceMode ?? 'dramatic',
      targetAudience: config?.targetAudience ?? 'competitive'
    };

    const startTime = Date.now();
    const results = await ContentAnalysisPipeline.batchAnalyzeContent(
      contentItems,
      analysisConfig
    );
    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      results,
      totalProcessed: results.length,
      processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch content analysis API error:', error);
    res.status(500).json({ 
      error: 'Internal server error during batch content analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
