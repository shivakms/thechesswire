import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PGNAnalyzer } from '../../../lib/chess/PGNAnalyzer';
import { BambaiVoiceEngine } from '../../../lib/voice/BambaiVoiceEngine';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pgnAnalyzer = new PGNAnalyzer();
const voiceEngine = new BambaiVoiceEngine();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const articleDataStr = Array.isArray(fields.articleData) ? fields.articleData[0] : fields.articleData;
    const pgnAnalysisStr = Array.isArray(fields.pgnAnalysis) ? fields.pgnAnalysis[0] : fields.pgnAnalysis;

    if (!articleDataStr) {
      return res.status(400).json({ error: 'Article data is required' });
    }

    const articleData = JSON.parse(articleDataStr);
    const pgnAnalysis = pgnAnalysisStr ? JSON.parse(pgnAnalysisStr) : null;

    let voiceNarrationUrl = null;
    if (articleData.voiceNarration && articleData.accessLevel === 'premium') {
      try {
        const narrationText = `${articleData.title}. ${articleData.content}`;
        const audioBuffer = await voiceEngine.generateVoice(
          narrationText,
          'poeticStoryteller',
          'dramatic'
        );
        voiceNarrationUrl = `/api/voice/narration-${Date.now()}.mp3`;
      } catch (error) {
        console.error('Voice narration failed:', error);
      }
    }

    const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const article = {
      id: articleId,
      ...articleData,
      voiceNarrationUrl,
      pgnAnalysis,
      createdAt: new Date().toISOString(),
      published: true
    };

    res.status(200).json({
      success: true,
      articleId,
      article,
      voiceNarrationUrl
    });

  } catch (error) {
    console.error('Article creation error:', error);
    res.status(500).json({ 
      error: 'Article creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
