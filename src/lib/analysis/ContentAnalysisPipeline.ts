import { getDb } from '../db/index';
import { EmotionHeatmap, EmotionalMove } from './PGNEmotionClassifier';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BambaiVoiceEngine } from '@/lib/voice/BambaiVoiceEngine';

export interface ContentAnalysisResult {
  id: string;
  contentType: 'pgn' | 'article' | 'video' | 'audio';
  originalContent: string;
  emotionalProfile: EmotionHeatmap;
  narrativeAdaptations: {
    dramatic: string;
    educational: string;
    poetic: string;
    analytical: string;
  };
  keyMoments: Array<{
    timestamp: number;
    description: string;
    emotionalIntensity: number;
    suggestedNarration: string;
  }>;
  contentTags: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  estimatedEngagement: number;
  socialMediaSnippets: Array<{
    platform: string;
    content: string;
    hashtags: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisConfig {
  includeEmotionalAnalysis: boolean;
  generateNarrativeAdaptations: boolean;
  extractKeyMoments: boolean;
  generateSocialSnippets: boolean;
  voiceMode: 'calm' | 'dramatic' | 'poetic' | 'analytical';
  targetAudience: 'casual' | 'competitive' | 'educational' | 'entertainment';
}

export class ContentAnalysisPipeline {
  static async analyzeContent(
    content: string,
    contentType: ContentAnalysisResult['contentType'],
    config: AnalysisConfig = {
      includeEmotionalAnalysis: true,
      generateNarrativeAdaptations: true,
      extractKeyMoments: true,
      generateSocialSnippets: true,
      voiceMode: 'dramatic',
      targetAudience: 'competitive'
    }
  ): Promise<ContentAnalysisResult> {
    try {
      const analysisId = this.generateAnalysisId(content, contentType);
      
      const db = await getDb();
      const cached = await db.query(
        'SELECT analysis_result FROM content_analysis_cache WHERE analysis_id = $1',
        [analysisId]
      );

      if (cached.rows.length > 0) {
        return cached.rows[0].analysis_result;
      }

      let emotionalProfile: EmotionHeatmap | null = null;
      
      if (config.includeEmotionalAnalysis && contentType === 'pgn') {
        const { PGNEmotionClassifier } = await import('./PGNEmotionClassifier');
        emotionalProfile = await PGNEmotionClassifier.classifyPGN(content);
      } else if (config.includeEmotionalAnalysis) {
        emotionalProfile = await this.analyzeNonPGNContent(content, contentType);
      }

      const narrativeAdaptations = config.generateNarrativeAdaptations 
        ? await this.generateNarrativeAdaptations(content, emotionalProfile, config.voiceMode)
        : { dramatic: '', educational: '', poetic: '', analytical: '' };

      const keyMoments = config.extractKeyMoments 
        ? await this.extractKeyMoments(content, contentType, emotionalProfile)
        : [];

      const contentTags = await this.generateContentTags(content, contentType, emotionalProfile);
      const difficultyLevel = this.assessDifficultyLevel(content, contentType);
      const estimatedEngagement = this.calculateEngagementScore(emotionalProfile, keyMoments, contentTags);

      const socialMediaSnippets = config.generateSocialSnippets 
        ? await this.generateSocialMediaSnippets(content, emotionalProfile, keyMoments)
        : [];

      const result: ContentAnalysisResult = {
        id: analysisId,
        contentType,
        originalContent: content,
        emotionalProfile: emotionalProfile || { moves: [], peaks: { tension: [], hope: [], aggression: [], collapse: [] }, overallArc: 'Content analysis pending' },
        narrativeAdaptations,
        keyMoments,
        contentTags,
        difficultyLevel,
        estimatedEngagement,
        socialMediaSnippets,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.query(
        'INSERT INTO content_analysis_cache (analysis_id, content_type, analysis_result, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (analysis_id) DO UPDATE SET analysis_result = EXCLUDED.analysis_result, updated_at = NOW()',
        [analysisId, contentType, JSON.stringify(result)]
      );

      return result;
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw error;
    }
  }

  private static generateAnalysisId(content: string, contentType: string): string {
    let hash = 0;
    const str = `${contentType}:${content.trim()}`;
    if (str.length === 0) return '0';
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `analysis_${Math.abs(hash).toString(16)}`;
  }

  private static async analyzeNonPGNContent(
    content: string, 
    contentType: ContentAnalysisResult['contentType']
  ): Promise<EmotionHeatmap> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const moves = sentences.map((sentence, index) => ({
      moveNumber: index + 1,
      move: sentence.trim().substring(0, 50) + (sentence.length > 50 ? '...' : ''),
      fen: `content_${index}`,
      emotions: this.analyzeTextEmotions(sentence),
      narrative: sentence.trim(),
      intensity: this.calculateTextIntensity(sentence) as 'low' | 'medium' | 'high' | 'critical'
    }));

    const peaks = {
      tension: moves.filter(m => m.emotions.tension >= 75).slice(0, 3),
      hope: moves.filter(m => m.emotions.hope >= 75).slice(0, 3),
      aggression: moves.filter(m => m.emotions.aggression >= 75).slice(0, 3),
      collapse: moves.filter(m => m.emotions.collapse >= 75).slice(0, 3)
    };

    const overallArc = this.generateContentArc(moves, contentType);

    return { moves, peaks, overallArc };
  }

  private static analyzeTextEmotions(text: string) {
    const words = text.toLowerCase().split(/\s+/);
    
    let tension = 20;
    let hope = 30;
    let aggression = 15;
    let collapse = 10;

    const tensionWords = ['critical', 'pressure', 'complex', 'difficult', 'challenging', 'intense'];
    const hopeWords = ['brilliant', 'beautiful', 'winning', 'advantage', 'breakthrough', 'success'];
    const aggressionWords = ['attack', 'sacrifice', 'bold', 'aggressive', 'forcing', 'tactical'];
    const collapseWords = ['mistake', 'blunder', 'losing', 'collapse', 'disaster', 'error'];

    words.forEach(word => {
      if (tensionWords.some(tw => word.includes(tw))) tension += 15;
      if (hopeWords.some(hw => word.includes(hw))) hope += 20;
      if (aggressionWords.some(aw => word.includes(aw))) aggression += 18;
      if (collapseWords.some(cw => word.includes(cw))) collapse += 25;
    });

    const randomVariation = () => (Math.random() - 0.5) * 15;

    return {
      tension: Math.max(0, Math.min(100, tension + randomVariation())),
      hope: Math.max(0, Math.min(100, hope + randomVariation())),
      aggression: Math.max(0, Math.min(100, aggression + randomVariation())),
      collapse: Math.max(0, Math.min(100, collapse + randomVariation()))
    };
  }

  private static calculateTextIntensity(text: string): string {
    const intensityMarkers = text.match(/[!?]{1,3}|[A-Z]{2,}|\b(amazing|incredible|shocking|devastating)\b/gi);
    const exclamationCount = (text.match(/!/g) || []).length;
    
    if (intensityMarkers && intensityMarkers.length >= 3 || exclamationCount >= 2) return 'critical';
    if (intensityMarkers && intensityMarkers.length >= 2 || exclamationCount >= 1) return 'high';
    if (intensityMarkers && intensityMarkers.length >= 1) return 'medium';
    return 'low';
  }

  private static generateContentArc(moves: EmotionalMove[], contentType: string): string {
    const avgTension = moves.reduce((sum, m) => sum + m.emotions.tension, 0) / moves.length;
    const avgHope = moves.reduce((sum, m) => sum + m.emotions.hope, 0) / moves.length;
    const avgAggression = moves.reduce((sum, m) => sum + m.emotions.aggression, 0) / moves.length;

    if (contentType === 'article') {
      if (avgHope > 60) return 'An inspiring piece that builds hope and excitement throughout.';
      if (avgTension > 60) return 'A gripping analysis that maintains tension and intrigue.';
      return 'A thoughtful exploration with balanced emotional undertones.';
    }

    if (avgAggression > 50) return 'Dynamic content with bold, assertive energy.';
    if (avgTension > 50) return 'Engaging material that keeps the audience on edge.';
    return 'Steady, contemplative content with subtle emotional depth.';
  }

  private static async generateNarrativeAdaptations(
    content: string,
    emotionalProfile: EmotionHeatmap | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    voiceMode: string
  ) {
    const baseNarrative = content.substring(0, 200) + (content.length > 200 ? '...' : '');
    
    return {
      dramatic: await this.adaptForDramaticNarration(baseNarrative, emotionalProfile),
      educational: await this.adaptForEducationalNarration(baseNarrative, emotionalProfile),
      poetic: await this.adaptForPoeticNarration(baseNarrative, emotionalProfile),
      analytical: await this.adaptForAnalyticalNarration(baseNarrative, emotionalProfile)
    };
  }

  private static async adaptForDramaticNarration(content: string, profile: EmotionHeatmap | null): Promise<string> {
    if (!profile) return `In a moment of pure chess drama: ${content}`;
    
    const maxEmotion = Math.max(
      ...profile.moves.map((m: EmotionalMove) => Math.max(m.emotions.tension, m.emotions.hope, m.emotions.aggression, m.emotions.collapse))
    );
    
    if (maxEmotion > 80) {
      return `The tension reaches a crescendo as ${content.toLowerCase()} — this is chess at its most electrifying!`;
    }
    
    return `With dramatic flair, the story unfolds: ${content}`;
  }

  private static async adaptForEducationalNarration(content: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    profile: EmotionHeatmap | null): Promise<string> {
    return `Let's examine this position carefully. ${content} This demonstrates important principles of chess strategy and tactics.`;
  }

  private static async adaptForPoeticNarration(content: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    profile: EmotionHeatmap | null): Promise<string> {
    if (!profile) return `Like poetry in motion across the sixty-four squares: ${content}`;
    
    return `In the eternal dance of light and shadow, ${content.toLowerCase()} — where every move whispers secrets of the infinite game.`;
  }

  private static async adaptForAnalyticalNarration(content: string, profile: EmotionHeatmap | null): Promise<string> {
    return `From an analytical perspective: ${content} The position evaluation and tactical considerations reveal the underlying strategic framework.`;
  }

  private static async extractKeyMoments(
    content: string,
    contentType: ContentAnalysisResult['contentType'],
    emotionalProfile: EmotionHeatmap | null
  ): Promise<Array<{
    timestamp: number;
    description: string;
    emotionalIntensity: number;
    suggestedNarration: string;
  }>> {
    const moments: Array<{
      timestamp: number;
      description: string;
      emotionalIntensity: number;
      suggestedNarration: string;
    }> = [];
    
    if (emotionalProfile && emotionalProfile.moves.length > 0) {
      const criticalMoves = emotionalProfile.moves
        .filter((m: EmotionalMove) => m.intensity === 'critical' || m.intensity === 'high')
        .slice(0, 5);
      
      criticalMoves.forEach((move: EmotionalMove, index: number) => {
        const emotionValues = Object.values(move.emotions) as number[];
        moments.push({
          timestamp: index * 30,
          description: `Critical moment: ${move.move}`,
          emotionalIntensity: Math.max(...emotionValues),
          suggestedNarration: move.narrative
        });
      });
    }
    
    if (moments.length === 0) {
      moments.push({
        timestamp: 0,
        description: 'Opening analysis',
        emotionalIntensity: 50,
        suggestedNarration: 'The journey begins with careful consideration.'
      });
    }
    
    return moments;
  }

  private static async generateContentTags(
    content: string,
    contentType: ContentAnalysisResult['contentType'],
    emotionalProfile: EmotionHeatmap | null
  ): Promise<string[]> {
    const tags: string[] = [contentType];
    
    if (emotionalProfile) {
      const avgEmotions = {
        tension: emotionalProfile.moves.reduce((sum: number, m: EmotionalMove) => sum + m.emotions.tension, 0) / emotionalProfile.moves.length,
        hope: emotionalProfile.moves.reduce((sum: number, m: EmotionalMove) => sum + m.emotions.hope, 0) / emotionalProfile.moves.length,
        aggression: emotionalProfile.moves.reduce((sum: number, m: EmotionalMove) => sum + m.emotions.aggression, 0) / emotionalProfile.moves.length,
        collapse: emotionalProfile.moves.reduce((sum: number, m: EmotionalMove) => sum + m.emotions.collapse, 0) / emotionalProfile.moves.length
      };
      
      if (avgEmotions.tension > 60) tags.push('tactical', 'complex');
      if (avgEmotions.hope > 60) tags.push('inspiring', 'breakthrough');
      if (avgEmotions.aggression > 60) tags.push('aggressive', 'attacking');
      if (avgEmotions.collapse > 40) tags.push('blunder', 'learning');
    }
    
    const contentLower = content.toLowerCase();
    if (contentLower.includes('opening')) tags.push('opening');
    if (contentLower.includes('endgame')) tags.push('endgame');
    if (contentLower.includes('middlegame')) tags.push('middlegame');
    if (contentLower.includes('sacrifice')) tags.push('sacrifice');
    if (contentLower.includes('checkmate')) tags.push('checkmate');
    
    return [...new Set(tags)];
  }

  private static assessDifficultyLevel(
    content: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contentType: ContentAnalysisResult['contentType']
  ): ContentAnalysisResult['difficultyLevel'] {
    const complexityMarkers = [
      'variation', 'analysis', 'evaluation', 'strategic', 'tactical',
      'positional', 'endgame theory', 'opening preparation'
    ];
    
    const markerCount = complexityMarkers.filter((marker: string) => 
      content.toLowerCase().includes(marker)
    ).length;
    
    if (markerCount >= 4) return 'master';
    if (markerCount >= 3) return 'advanced';
    if (markerCount >= 2) return 'intermediate';
    return 'beginner';
  }

  private static calculateEngagementScore(
    emotionalProfile: EmotionHeatmap | null,
    keyMoments: Array<{
      timestamp: number;
      description: string;
      emotionalIntensity: number;
      suggestedNarration: string;
    }>,
    contentTags: string[]
  ): number {
    let score = 50;
    
    if (emotionalProfile) {
      const avgIntensity = emotionalProfile.moves.reduce((sum: number, m: EmotionalMove) => {
        const maxEmotion = Math.max(...(Object.values(m.emotions) as number[]));
        return sum + maxEmotion;
      }, 0) / emotionalProfile.moves.length;
      
      score += (avgIntensity - 50) * 0.5;
    }
    
    score += keyMoments.length * 5;
    score += contentTags.length * 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static async generateSocialMediaSnippets(
    content: string,
    emotionalProfile: EmotionHeatmap | null,
    keyMoments: Array<{
      timestamp: number;
      description: string;
      emotionalIntensity: number;
      suggestedNarration: string;
    }>
  ) {
    const snippets = [];
    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
    
    snippets.push({
      platform: 'twitter',
      content: `🔥 ${preview} #chess #analysis`,
      hashtags: ['chess', 'analysis', 'strategy']
    });
    
    snippets.push({
      platform: 'instagram',
      content: `✨ Dive into this incredible chess moment! ${preview}`,
      hashtags: ['chess', 'chesslife', 'strategy', 'tactics']
    });
    
    if (keyMoments.length > 0) {
      snippets.push({
        platform: 'youtube',
        content: `🎯 Key moment: ${keyMoments[0].description} - ${keyMoments[0].suggestedNarration}`,
        hashtags: ['chess', 'tutorial', 'analysis']
      });
    }
    
    return snippets;
  }

  static async batchAnalyzeContent(
    contentItems: Array<{ content: string; type: ContentAnalysisResult['contentType'] }>,
    config?: AnalysisConfig
  ): Promise<ContentAnalysisResult[]> {
    const results = [];
    
    for (const item of contentItems) {
      try {
        const result = await this.analyzeContent(item.content, item.type, config);
        results.push(result);
      } catch (error) {
        console.error(`Failed to analyze content item:`, error);
      }
    }
    
    return results;
  }

  static async getAnalysisHistory(limit: number = 50): Promise<ContentAnalysisResult[]> {
    try {
      const db = await getDb();
      const results = await db.query(
        'SELECT analysis_result FROM content_analysis_cache ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      
      return results.rows.map((row: { analysis_result: ContentAnalysisResult }) => row.analysis_result);
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      return [];
    }
  }
}
