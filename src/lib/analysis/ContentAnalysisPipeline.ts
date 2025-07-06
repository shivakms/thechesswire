import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';
import { VoiceMemorySystem } from '../voice/VoiceMemorySystem';
import * as crypto from 'crypto';

export interface ContentAnalysisResult {
  id: string;
  contentType: 'pgn' | 'article' | 'voice' | 'video';
  emotionalProfile: EmotionalProfile;
  qualityScore: number;
  recommendations: ContentRecommendation[];
  metadata: ContentMetadata;
  timestamp: Date;
}

export interface EmotionalProfile {
  dominantEmotion: string;
  intensity: number;
  emotionalTimeline: EmotionalMoment[];
  sentimentScore: number;
  engagementPrediction: number;
}

export interface EmotionalMoment {
  timestamp: number;
  emotion: string;
  intensity: number;
  trigger: string;
  context?: string;
}

export interface ContentRecommendation {
  type: 'voice_mode' | 'narrative_style' | 'pacing' | 'emphasis' | 'social_optimization';
  suggestion: string;
  confidence: number;
  reasoning: string;
}

export interface ContentMetadata {
  wordCount?: number;
  duration?: number;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  topics: string[];
  keyMoments: string[];
  viralPotential: number;
}

export interface AnalysisConfig {
  includeEmotionalAnalysis: boolean;
  includeQualityScoring: boolean;
  includeRecommendations: boolean;
  voiceAnalysis: boolean;
  socialOptimization: boolean;
  realTimeProcessing: boolean;
}

export class ContentAnalysisPipeline {
  private bambaiEngine: BambaiVoiceEngine;
  private memorySystem: VoiceMemorySystem;
  private analysisCache: Map<string, ContentAnalysisResult>;

  constructor() {
    this.bambaiEngine = new BambaiVoiceEngine();
    this.memorySystem = new VoiceMemorySystem();
    this.analysisCache = new Map();
  }

  async analyzeContent(
    content: string,
    contentType: 'pgn' | 'article' | 'voice' | 'video',
    config: Partial<AnalysisConfig> = {}
  ): Promise<ContentAnalysisResult> {
    if (!content || typeof content !== 'string' || content.length > 100000) {
      throw new Error('Invalid content input - must be string under 100KB');
    }

    const sanitizedContent = content.slice(0, 50000);
    const contentHash = crypto.createHash('sha256').update(sanitizedContent).digest('hex');
    
    // Check cache first
    if (this.analysisCache.has(contentHash)) {
      return this.analysisCache.get(contentHash)!;
    }

    const defaultConfig: AnalysisConfig = {
      includeEmotionalAnalysis: true,
      includeQualityScoring: true,
      includeRecommendations: true,
      voiceAnalysis: true,
      socialOptimization: true,
      realTimeProcessing: false
    };

    const finalConfig = { ...defaultConfig, ...config };

    const result: ContentAnalysisResult = {
      id: crypto.randomBytes(8).toString('hex'),
      contentType,
      emotionalProfile: await this.analyzeEmotionalProfile(sanitizedContent, contentType),
      qualityScore: await this.calculateQualityScore(sanitizedContent, contentType),
      recommendations: await this.generateRecommendations(sanitizedContent, contentType, finalConfig),
      metadata: await this.extractMetadata(sanitizedContent, contentType),
      timestamp: new Date()
    };

    this.analysisCache.set(contentHash, result);
    
    return result;
  }

  private async analyzeEmotionalProfile(content: string, contentType: string): Promise<EmotionalProfile> {
    const emotionPatterns = {
      excitement: /(?:brilliant|amazing|incredible|stunning|magnificent)/gi,
      tension: /(?:critical|pressure|decisive|sharp|dangerous)/gi,
      triumph: /(?:victory|success|genius|masterful|perfect)/gi,
      frustration: /(?:blunder|mistake|error|disaster|collapse)/gi,
      wonder: /(?:beautiful|elegant|artistic|poetic|magical)/gi,
      calm: /(?:quiet|peaceful|solid|stable|safe)/gi
    };

    const emotionalTimeline: EmotionalMoment[] = [];
    let dominantEmotion = 'neutral';
    let maxIntensity = 0;
    let totalSentiment = 0;
    let emotionCount = 0;

    const chunks = this.chunkContent(content, 200);
    
    chunks.forEach((chunk, index) => {
      for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
        const matches = chunk.match(pattern);
        if (matches) {
          const intensity = Math.min(matches.length * 0.2, 1.0);
          
          emotionalTimeline.push({
            timestamp: (index / chunks.length) * 100,
            emotion,
            intensity,
            trigger: matches[0],
            context: chunk.slice(0, 50) + '...'
          });

          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            dominantEmotion = emotion;
          }

          totalSentiment += this.getEmotionSentiment(emotion) * intensity;
          emotionCount++;
        }
      }
    });

    const sentimentScore = emotionCount > 0 ? totalSentiment / emotionCount : 0;
    const engagementPrediction = this.predictEngagement(dominantEmotion, maxIntensity, emotionalTimeline.length);

    return {
      dominantEmotion,
      intensity: maxIntensity,
      emotionalTimeline,
      sentimentScore,
      engagementPrediction
    };
  }

  private async calculateQualityScore(content: string, contentType: string): Promise<number> {
    let score = 0.5; // Base score

    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 100 && wordCount <= 2000) score += 0.2;
    else if (wordCount > 50) score += 0.1;

    const complexityIndicators = [
      /(?:strategy|tactic|position|evaluation)/gi,
      /(?:opening|middlegame|endgame)/gi,
      /(?:sacrifice|combination|pattern)/gi
    ];

    complexityIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) score += Math.min(matches.length * 0.05, 0.15);
    });

    if (contentType === 'pgn') {
      const pgnQuality = this.assessPGNQuality(content);
      score += pgnQuality * 0.3;
    }

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 0.1;

    return Math.min(Math.max(score, 0), 1);
  }

  private async generateRecommendations(
    content: string,
    contentType: string,
    config: AnalysisConfig
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    if (config.voiceAnalysis) {
      const voiceRec = await this.analyzeVoiceRecommendations(content);
      recommendations.push(...voiceRec);
    }

    if (config.socialOptimization) {
      const socialRec = await this.analyzeSocialOptimization(content, contentType);
      recommendations.push(...socialRec);
    }

    if (contentType === 'pgn') {
      recommendations.push(...this.generatePGNRecommendations(content));
    } else if (contentType === 'article') {
      recommendations.push(...this.generateArticleRecommendations(content));
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private async analyzeVoiceRecommendations(content: string): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];
    
    const emotionIntensity = this.detectEmotionIntensity(content);
    
    if (emotionIntensity.tension > 0.6) {
      recommendations.push({
        type: 'voice_mode',
        suggestion: 'Use Dramatic Narrator mode for high-tension moments',
        confidence: 0.85,
        reasoning: 'High tension detected in content requires dramatic voice delivery'
      });
    }

    if (emotionIntensity.wonder > 0.5) {
      recommendations.push({
        type: 'voice_mode',
        suggestion: 'Use Poetic Sage mode for beautiful positions',
        confidence: 0.8,
        reasoning: 'Aesthetic elements detected benefit from poetic narration'
      });
    }

    const wordCount = content.split(/\s+/).length;
    if (wordCount > 500) {
      recommendations.push({
        type: 'pacing',
        suggestion: 'Add strategic pauses every 100-150 words',
        confidence: 0.75,
        reasoning: 'Long content needs pacing breaks for better comprehension'
      });
    }

    return recommendations;
  }

  private async analyzeSocialOptimization(content: string, contentType: string): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];
    
    const viralIndicators = [
      /(?:shocking|unbelievable|incredible|never seen)/gi,
      /(?:genius|brilliant|masterpiece|legendary)/gi,
      /(?:blunder|mistake|disaster|collapse)/gi
    ];

    let viralScore = 0;
    viralIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) viralScore += matches.length;
    });

    if (viralScore > 3) {
      recommendations.push({
        type: 'social_optimization',
        suggestion: 'High viral potential - prioritize for social media distribution',
        confidence: 0.9,
        reasoning: 'Multiple viral trigger words detected'
      });
    }

    if (contentType === 'pgn' && content.length < 1000) {
      recommendations.push({
        type: 'social_optimization',
        suggestion: 'Perfect for TikTok/YouTube Shorts format',
        confidence: 0.8,
        reasoning: 'Short chess content performs well on vertical video platforms'
      });
    }

    return recommendations;
  }

  private generatePGNRecommendations(content: string): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];
    
    if (/(?:sacrifice|combination|tactic)/gi.test(content)) {
      recommendations.push({
        type: 'narrative_style',
        suggestion: 'Emphasize tactical brilliance with dramatic pauses',
        confidence: 0.85,
        reasoning: 'Tactical content benefits from suspenseful narration'
      });
    }

    if (/(?:endgame|king and pawn|rook endgame)/gi.test(content)) {
      recommendations.push({
        type: 'voice_mode',
        suggestion: 'Use Thoughtful Philosopher mode for endgame analysis',
        confidence: 0.8,
        reasoning: 'Endgame content requires contemplative, educational tone'
      });
    }

    return recommendations;
  }

  private generateArticleRecommendations(content: string): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    if (avgSentenceLength > 30) {
      recommendations.push({
        type: 'narrative_style',
        suggestion: 'Break up long sentences for better voice flow',
        confidence: 0.75,
        reasoning: 'Long sentences are difficult to narrate naturally'
      });
    }

    return recommendations;
  }

  private async extractMetadata(content: string, contentType: string): Promise<ContentMetadata> {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    const duration = Math.round((wordCount / 150) * 60);
    
    const complexityScore = this.calculateComplexityScore(content);
    let complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    
    if (complexityScore < 0.3) complexity = 'beginner';
    else if (complexityScore < 0.6) complexity = 'intermediate';
    else if (complexityScore < 0.8) complexity = 'advanced';
    else complexity = 'expert';

    const topics = this.extractTopics(content);
    
    const keyMoments = this.extractKeyMoments(content);
    
    const viralPotential = this.calculateViralPotential(content, contentType);

    return {
      wordCount,
      duration,
      complexity,
      topics,
      keyMoments,
      viralPotential
    };
  }

  private chunkContent(content: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private getEmotionSentiment(emotion: string): number {
    const sentimentMap: Record<string, number> = {
      excitement: 0.8,
      triumph: 0.9,
      wonder: 0.7,
      calm: 0.5,
      tension: 0.3,
      frustration: 0.1
    };
    return sentimentMap[emotion] || 0.5;
  }

  private predictEngagement(dominantEmotion: string, intensity: number, timelineLength: number): number {
    const baseEngagement = intensity * 0.6;
    const emotionMultiplier = this.getEmotionEngagementMultiplier(dominantEmotion);
    const varietyBonus = Math.min(timelineLength * 0.05, 0.3);
    
    return Math.min(baseEngagement * emotionMultiplier + varietyBonus, 1.0);
  }

  private getEmotionEngagementMultiplier(emotion: string): number {
    const multipliers: Record<string, number> = {
      excitement: 1.3,
      triumph: 1.2,
      tension: 1.4,
      wonder: 1.1,
      frustration: 0.9,
      calm: 0.8
    };
    return multipliers[emotion] || 1.0;
  }

  private assessPGNQuality(pgn: string): number {
    let quality = 0.5;
    
    if (/\d+\.\s*[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8]/g.test(pgn)) quality += 0.2;
    
    if (/[!?]+/.test(pgn)) quality += 0.15;
    
    if (/\{[^}]+\}/.test(pgn)) quality += 0.15;
    
    return Math.min(quality, 1.0);
  }

  private detectEmotionIntensity(content: string): Record<string, number> {
    const patterns = {
      tension: /(?:critical|pressure|decisive|sharp|dangerous)/gi,
      wonder: /(?:beautiful|elegant|artistic|poetic|magical)/gi,
      excitement: /(?:brilliant|amazing|incredible|stunning)/gi
    };

    const intensities: Record<string, number> = {};
    
    for (const [emotion, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      intensities[emotion] = matches ? Math.min(matches.length * 0.2, 1.0) : 0;
    }

    return intensities;
  }

  private calculateComplexityScore(content: string): number {
    let score = 0;
    
    const technicalTerms = /(?:zugzwang|zwischenzug|fianchetto|en passant|castling)/gi;
    const techMatches = content.match(technicalTerms);
    if (techMatches) score += techMatches.length * 0.1;
    
    const advancedConcepts = /(?:pawn structure|weak squares|piece coordination|initiative)/gi;
    const advMatches = content.match(advancedConcepts);
    if (advMatches) score += advMatches.length * 0.15;
    
    return Math.min(score, 1.0);
  }

  private extractTopics(content: string): string[] {
    const topicPatterns = {
      'Opening Theory': /(?:opening|debut|theory|preparation)/gi,
      'Tactics': /(?:tactic|combination|fork|pin|skewer)/gi,
      'Strategy': /(?:strategy|plan|structure|weakness)/gi,
      'Endgame': /(?:endgame|ending|king and pawn)/gi,
      'Psychology': /(?:psychology|pressure|confidence|mental)/gi
    };

    const topics: string[] = [];
    
    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(content)) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractKeyMoments(content: string): string[] {
    const keyMomentPatterns = [
      /(?:brilliant|genius|masterful|stunning)\s+(?:move|sacrifice|combination)/gi,
      /(?:critical|decisive|turning)\s+(?:moment|point|move)/gi,
      /(?:blunder|mistake|error)\s+(?:that|which|leading)/gi
    ];

    const keyMoments: string[] = [];
    
    keyMomentPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        keyMoments.push(...matches.slice(0, 3)); // Limit to 3 per pattern
      }
    });

    return keyMoments.slice(0, 5); // Max 5 key moments
  }

  private calculateViralPotential(content: string, contentType: string): number {
    let potential = 0.3; // Base potential
    
    const viralTriggers = /(?:shocking|unbelievable|never seen|incredible|genius|disaster)/gi;
    const triggers = content.match(viralTriggers);
    if (triggers) potential += triggers.length * 0.1;
    
    const emotionWords = /(?:amazing|brilliant|terrible|stunning|magnificent)/gi;
    const emotions = content.match(emotionWords);
    if (emotions) potential += emotions.length * 0.05;
    
    if (contentType === 'pgn' && content.length < 500) potential += 0.2; // Short chess content
    
    return Math.min(potential, 1.0);
  }

  async batchAnalyze(
    contentItems: Array<{ content: string; type: 'pgn' | 'article' | 'voice' | 'video' }>,
    config: Partial<AnalysisConfig> = {}
  ): Promise<ContentAnalysisResult[]> {
    if (!Array.isArray(contentItems) || contentItems.length === 0) {
      throw new Error('Invalid content items - must be non-empty array');
    }

    const results: ContentAnalysisResult[] = [];
    const maxBatchSize = 10;
    const itemsToProcess = contentItems.slice(0, maxBatchSize);

    for (const item of itemsToProcess) {
      try {
        const result = await this.analyzeContent(item.content, item.type, config);
        results.push(result);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to analyze content item: ${error}`);
      }
    }

    return results;
  }

  clearCache(): void {
    this.analysisCache.clear();
  }

  getCacheSize(): number {
    return this.analysisCache.size;
  }
}
