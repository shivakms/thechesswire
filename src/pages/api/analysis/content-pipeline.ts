import { NextApiRequest, NextApiResponse } from 'next';
import { ContentAnalysisPipeline, AnalysisConfig } from '@/lib/analysis/ContentAnalysisPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, contentType, config } = req.body;

    if (!content || !contentType) {
      return res.status(400).json({ 
        error: 'Missing required fields: content and contentType' 
      });
    }

    const validContentTypes = ['pgn', 'article', 'video', 'audio'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({ 
        error: `Invalid content type. Must be one of: ${validContentTypes.join(', ')}` 
      });
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
    const result = await ContentAnalysisPipeline.analyzeContent(
      content,
      contentType,
      analysisConfig
    );
    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      result,
      processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content analysis API error:', error);
    res.status(500).json({ 
      error: 'Internal server error during content analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
