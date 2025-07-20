// Phase 6: Content Moderation Service for Bambai AI Assistant

import { ModerationResult } from '../types';
import logger from '@/lib/logger';

export class ModerationService {
  private toxicKeywords = [
    // Hate speech
    'hate', 'racist', 'bigot', 'nazi', 'supremacist',
    // Harassment
    'harass', 'bully', 'stalk', 'threaten', 'intimidate',
    // Violence
    'kill', 'murder', 'assault', 'attack', 'violence',
    // Self-harm
    'suicide', 'self-harm', 'cut', 'overdose',
    // Sexual content
    'porn', 'sexual', 'explicit', 'adult',
  ];

  private spamPatterns = [
    /\b(?:buy|sell|discount|offer|limited|act now)\b/gi,
    /\b(?:click here|visit|subscribe|join now)\b/gi,
    /\b(?:free|money|cash|earn|profit)\b/gi,
  ];

  async moderate(text: string): Promise<ModerationResult> {
    try {
      const lowerText = text.toLowerCase();
      
      // Check for toxic keywords
      const toxicScore = this.calculateToxicScore(lowerText);
      
      // Check for spam patterns
      const spamScore = this.calculateSpamScore(text);
      
      // Check for excessive repetition
      const repetitionScore = this.calculateRepetitionScore(text);
      
      // Calculate overall toxicity
      const isToxic = toxicScore > 0.3 || spamScore > 0.5 || repetitionScore > 0.7;
      
      const categories = {
        hate: this.calculateCategoryScore(lowerText, ['hate', 'racist', 'bigot', 'nazi']),
        harassment: this.calculateCategoryScore(lowerText, ['harass', 'bully', 'stalk', 'threaten']),
        self_harm: this.calculateCategoryScore(lowerText, ['suicide', 'self-harm', 'cut']),
        sexual: this.calculateCategoryScore(lowerText, ['porn', 'sexual', 'explicit']),
        violence: this.calculateCategoryScore(lowerText, ['kill', 'murder', 'assault', 'attack']),
      };

      const result: ModerationResult = {
        isToxic,
        categories,
        flagged: isToxic,
        reason: isToxic ? this.getModerationReason(toxicScore, spamScore, repetitionScore) : undefined,
      };

      if (isToxic) {
        logger.warn('🚫 Content flagged by moderation', {
          text: text.substring(0, 100) + '...',
          scores: { toxicScore, spamScore, repetitionScore },
          categories,
        });
      }

      return result;
    } catch (error) {
      logger.error('❌ Error in content moderation', error);
      
      // Default to allowing content if moderation fails
      return {
        isToxic: false,
        categories: {
          hate: 0,
          harassment: 0,
          self_harm: 0,
          sexual: 0,
          violence: 0,
        },
        flagged: false,
      };
    }
  }

  private calculateToxicScore(text: string): number {
    let score = 0;
    let matches = 0;

    for (const keyword of this.toxicKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const count = (text.match(regex) || []).length;
      if (count > 0) {
        matches++;
        score += count * 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  private calculateSpamScore(text: string): number {
    let score = 0;

    for (const pattern of this.spamPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  private calculateRepetitionScore(text: string): number {
    const words = text.split(/\s+/);
    const wordCount = new Map<string, number>();

    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        wordCount.set(cleanWord, (wordCount.get(cleanWord) || 0) + 1);
      }
    }

    let repetitionScore = 0;
    for (const [word, count] of wordCount) {
      if (count > 3) {
        repetitionScore += (count - 3) * 0.1;
      }
    }

    return Math.min(repetitionScore, 1.0);
  }

  private calculateCategoryScore(text: string, keywords: string[]): number {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const count = (text.match(regex) || []).length;
      if (count > 0) {
        matches++;
        score += count * 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  private getModerationReason(toxicScore: number, spamScore: number, repetitionScore: number): string {
    if (toxicScore > 0.3) {
      return 'Content contains potentially harmful language';
    } else if (spamScore > 0.5) {
      return 'Content appears to be spam or promotional';
    } else if (repetitionScore > 0.7) {
      return 'Content contains excessive repetition';
    }
    return 'Content flagged by moderation system';
  }

  async moderateBatch(texts: string[]): Promise<ModerationResult[]> {
    const results: ModerationResult[] = [];
    
    for (const text of texts) {
      const result = await this.moderate(text);
      results.push(result);
    }
    
    return results;
  }

  // Whitelist certain chess-related terms that might trigger false positives
  private isChessTerm(text: string): boolean {
    const chessTerms = [
      'mate', 'check', 'capture', 'attack', 'defense', 'opening',
      'endgame', 'tactics', 'strategy', 'position', 'move',
    ];
    
    return chessTerms.some(term => 
      text.toLowerCase().includes(term)
    );
  }
}

// Singleton instance
export const moderationService = new ModerationService(); 