import { PGNAnalysis } from '../chess/PGNAnalyzer';
import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';

export interface StorytellingConfig {
  mode: 'dramatic' | 'analytical' | 'historical' | 'poetic' | 'humorous';
  includeAlternateEndings: boolean;
  historicalContext: boolean;
  emotionalIntensity: 'low' | 'medium' | 'high' | 'extreme';
  targetAudience: 'casual' | 'serious' | 'mixed';
  accessLevel: 'freemium' | 'premium';
}

export interface GeneratedArticle {
  title: string;
  content: string;
  summary: string;
  alternateEndings?: string[];
  historicalContext?: string;
  voiceNarrationUrl?: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    emotionalArc: string;
    keyMoments: string[];
    difficulty: string;
  };
  tags: string[];
}

export class AIJournalist {
  private voiceEngine: BambaiVoiceEngine;

  constructor() {
    this.voiceEngine = new BambaiVoiceEngine();
  }

  async generateArticle(
    analysis: PGNAnalysis,
    config: StorytellingConfig
  ): Promise<GeneratedArticle> {
    if (!analysis.isValid) {
      throw new Error('Invalid PGN analysis provided');
    }

    const title = this.generateTitle(analysis, config);
    const content = await this.generateContent(analysis, config);
    const summary = this.generateSummary(content);
    const alternateEndings = config.includeAlternateEndings ? 
      await this.generateAlternateEndings(analysis, config) : undefined;
    const historicalContext = config.historicalContext ? 
      this.generateHistoricalContext(analysis) : undefined;

    let voiceNarrationUrl: string | undefined;
    if (config.accessLevel === 'premium') {
      voiceNarrationUrl = await this.generateVoiceNarration(content, config);
    }

    const metadata = this.generateMetadata(content, analysis);
    const tags = this.generateTags(analysis, config);

    return {
      title,
      content,
      summary,
      alternateEndings,
      historicalContext,
      voiceNarrationUrl,
      metadata,
      tags
    };
  }

  private generateTitle(analysis: PGNAnalysis, config: StorytellingConfig): string {
    const gameInfo = analysis.gameInfo;
    const tacticalThemes = analysis.analysis.tacticalThemes;
    const brilliancyScore = analysis.analysis.brilliancyScore;

    const titleTemplates = {
      dramatic: [
        `The ${tacticalThemes[0] || 'Epic'} That Changed Everything`,
        `When ${gameInfo.white || 'White'} Faced Destiny`,
        `A Game of ${tacticalThemes.length > 1 ? 'Tactics and Drama' : 'Pure Brilliance'}`,
        `The ${brilliancyScore > 50 ? 'Masterpiece' : 'Battle'} That Stunned the Chess World`
      ],
      analytical: [
        `Deep Analysis: ${gameInfo.white || 'White'} vs ${gameInfo.black || 'Black'}`,
        `Tactical Breakdown: ${tacticalThemes.join(' and ') || 'Strategic Masterclass'}`,
        `Position Study: ${analysis.analysis.difficultyLevel} Level Chess`,
        `Game Analysis: ${brilliancyScore} Brilliancy Points`
      ],
      historical: [
        `Chess History: The ${gameInfo.event || 'Game'} That Mattered`,
        `From the Archives: ${gameInfo.white || 'A Master'}'s Greatest Game`,
        `Historical Chess: When ${tacticalThemes[0] || 'Strategy'} Made History`,
        `Classic Game: ${gameInfo.date || 'Timeless'} Chess Brilliance`
      ],
      poetic: [
        `The Dance of ${tacticalThemes[0] || 'Pieces'} and Dreams`,
        `Where ${gameInfo.white || 'Light'} Meets ${gameInfo.black || 'Shadow'}`,
        `A Symphony in ${analysis.moves.length} Moves`,
        `The Poetry of ${tacticalThemes.join(' and ') || 'Chess'}`
      ],
      humorous: [
        `When ${gameInfo.white || 'White'} Forgot How to Chess`,
        `The ${tacticalThemes[0] || 'Blunder'} That Broke the Internet`,
        `How NOT to Play Chess: A ${analysis.analysis.blunderCount}-Blunder Guide`,
        `Chess Comedy: ${gameInfo.white || 'Player'} vs Logic`
      ]
    };

    const templates = titleTemplates[config.mode];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private async generateContent(analysis: PGNAnalysis, config: StorytellingConfig): Promise<string> {
    const opening = this.generateOpening(analysis, config);
    const gameNarrative = this.generateGameNarrative(analysis, config);
    const keyMoments = this.generateKeyMoments(analysis, config);
    const conclusion = this.generateConclusion(analysis, config);

    return `${opening}\n\n${gameNarrative}\n\n${keyMoments}\n\n${conclusion}`;
  }

  private generateOpening(analysis: PGNAnalysis, config: StorytellingConfig): string {
    const gameInfo = analysis.gameInfo;
    const brilliancyScore = analysis.analysis.brilliancyScore;
    const tacticalThemes = analysis.analysis.tacticalThemes;

    const openings = {
      dramatic: `In the hallowed halls of chess history, few games capture the imagination quite like this encounter between ${gameInfo.white || 'White'} and ${gameInfo.black || 'Black'}. What began as a seemingly ordinary game would soon transform into a ${brilliancyScore > 50 ? 'masterpiece of tactical brilliance' : 'fierce battle of wills'}.`,
      
      analytical: `This game presents a fascinating study in ${tacticalThemes.length > 0 ? tacticalThemes.join(', ') : 'strategic planning'} at the ${analysis.analysis.difficultyLevel} level. With a brilliancy score of ${brilliancyScore} and ${analysis.analysis.blunderCount} critical errors, it offers valuable insights into competitive chess.`,
      
      historical: `${gameInfo.date ? `On ${gameInfo.date}, ` : ''}${gameInfo.event ? `during the ${gameInfo.event}, ` : ''}chess witnessed a game that would ${brilliancyScore > 30 ? 'be remembered for its tactical brilliance' : 'serve as an important lesson in competitive play'}.`,
      
      poetic: `Like a carefully choreographed dance, this game unfolds with the grace of ${tacticalThemes[0] || 'strategic beauty'}. Each move tells a story, each position whispers secrets of the ancient game we call chess.`,
      
      humorous: `Buckle up, chess fans, because we're about to witness ${analysis.analysis.blunderCount > 3 ? 'a comedy of errors' : 'some questionable life choices'} disguised as a chess game. ${gameInfo.white || 'Our protagonist'} clearly woke up and chose chaos.`
    };

    return openings[config.mode];
  }

  private generateGameNarrative(analysis: PGNAnalysis, config: StorytellingConfig): string {
    const emotionTimeline = analysis.analysis.emotionTimeline;
    const moves = analysis.moves;
    
    let narrative = "## The Game Unfolds\n\n";
    
    const keyEmotionalMoments = emotionTimeline
      .filter(e => e.emotion !== 'neutral' && e.intensity > 0.7)
      .slice(0, 3);

    for (const moment of keyEmotionalMoments) {
      const move = moves[moment.moveNumber - 1];
      if (move) {
        narrative += `**Move ${moment.moveNumber}**: ${move.san} - ${this.getEmotionDescription(moment.emotion, config.mode)}\n\n`;
      }
    }

    return narrative;
  }

  private getEmotionDescription(emotion: string, mode: string): string {
    const descriptions = {
      dramatic: {
        tension: "The tension reaches a breaking point as both players navigate treacherous waters.",
        triumph: "A moment of pure brilliance illuminates the board!",
        tragedy: "Disaster strikes with devastating consequences.",
        mystery: "An enigmatic move that conceals deeper intentions."
      },
      analytical: {
        tension: "Critical position requiring precise calculation.",
        triumph: "Optimal play demonstrating superior understanding.",
        tragedy: "Tactical oversight leading to material loss.",
        mystery: "Complex position with multiple candidate moves."
      },
      poetic: {
        tension: "Like a tightrope walker above the abyss of defeat.",
        triumph: "The pieces dance in perfect harmony toward victory.",
        tragedy: "Dreams crumble like castles built on sand.",
        mystery: "Whispers of possibility echo across the board."
      }
    };

    return descriptions[mode as keyof typeof descriptions]?.[emotion as keyof typeof descriptions.dramatic] || 
           "An important moment in the game.";
  }

  private generateKeyMoments(analysis: PGNAnalysis, config: StorytellingConfig): string {
    let content = "## Key Moments\n\n";
    
    const brilliantMoves = analysis.moves.filter(m => m.isBrilliant);
    const blunders = analysis.moves.filter(m => m.isBlunder);
    const tacticalMoves = analysis.moves.filter(m => m.tacticalTheme);

    if (brilliantMoves.length > 0) {
      content += "### Brilliant Moves\n";
      brilliantMoves.slice(0, 2).forEach(move => {
        content += `- **${move.san}**: ${move.annotation}\n`;
      });
      content += "\n";
    }

    if (blunders.length > 0 && config.mode !== 'poetic') {
      content += "### Critical Errors\n";
      blunders.slice(0, 2).forEach(move => {
        content += `- **${move.san}**: ${move.annotation}\n`;
      });
      content += "\n";
    }

    if (tacticalMoves.length > 0) {
      content += "### Tactical Highlights\n";
      tacticalMoves.slice(0, 3).forEach(move => {
        content += `- **${move.tacticalTheme?.toUpperCase()}**: ${move.san} - ${move.annotation}\n`;
      });
    }

    return content;
  }

  private generateConclusion(analysis: PGNAnalysis, config: StorytellingConfig): string {
    const conclusions = {
      dramatic: `This game will be remembered as a testament to the power of chess to create moments of pure drama and excitement. With ${analysis.analysis.brilliancyScore} brilliancy points and ${analysis.analysis.tacticalThemes.length} tactical themes, it showcases the very best of competitive chess.`,
      
      analytical: `In conclusion, this game provides valuable insights into ${analysis.analysis.difficultyLevel}-level play, featuring ${analysis.analysis.tacticalThemes.join(', ')} and demonstrating key principles of chess strategy and tactics.`,
      
      historical: `This encounter takes its place among the memorable games of chess history, contributing to our understanding of the game's rich tactical and strategic heritage.`,
      
      poetic: `And so the pieces return to their silent rest, having told their story of conflict and beauty, leaving us with memories of a dance that will echo through time.`,
      
      humorous: `And that, dear readers, is how you turn a perfectly good chess game into a comedy of errors. Remember: when in doubt, don't blunder your queen!`
    };

    return conclusions[config.mode];
  }

  private generateSummary(content: string): string {
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ') + '.';
  }

  private async generateAlternateEndings(analysis: PGNAnalysis, config: StorytellingConfig): Promise<string[]> {
    const endings = [
      "What if the losing player had found the brilliant defensive resource?",
      "An alternate timeline where tactical precision changes everything.",
      "The path not taken: exploring the road to a different result."
    ];
    
    return endings.slice(0, config.emotionalIntensity === 'extreme' ? 3 : 2);
  }

  private generateHistoricalContext(analysis: PGNAnalysis): string {
    const gameInfo = analysis.gameInfo;
    
    if (gameInfo.event && gameInfo.date) {
      return `This game was played during ${gameInfo.event} in ${gameInfo.date}, a period that saw significant developments in chess theory and practice.`;
    }
    
    return "This game represents the ongoing evolution of chess understanding and the eternal struggle between mind and mind across the 64 squares.";
  }

  private async generateVoiceNarration(content: string, config: StorytellingConfig): Promise<string> {
    try {
      const voiceMode = this.selectVoiceModeForConfig(config);
      await this.voiceEngine.generateVoice(
        content.substring(0, 500),
        voiceMode,
        config.mode === 'dramatic' ? 'dramatic' : 'neutral'
      );
      
      return `/api/voice/journalism-${Date.now()}.mp3`;
    } catch (error) {
      console.error('Voice narration generation failed:', error);
      return '';
    }
  }

  private selectVoiceModeForConfig(config: StorytellingConfig): keyof typeof this.voiceEngine['voiceProfiles'] {
    const modeMap = {
      dramatic: 'dramaticNarrator' as const,
      analytical: 'wiseMentor' as const,
      historical: 'thoughtfulPhilosopher' as const,
      poetic: 'poeticStoryteller' as const,
      humorous: 'enthusiasticCommentator' as const
    };
    
    return modeMap[config.mode] || 'wiseMentor';
  }

  private generateMetadata(content: string, analysis: PGNAnalysis): {
    wordCount: number;
    readingTime: number;
    emotionalArc: string;
    keyMoments: string[];
    difficulty: string;
  } {
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const emotionalArc = analysis.analysis.emotionTimeline
      .map(e => e.emotion)
      .filter((e, i, arr) => arr.indexOf(e) === i)
      .join(' → ');

    const keyMoments = analysis.moves
      .filter(m => m.isBrilliant || m.isBlunder || m.tacticalTheme)
      .map(m => `${m.san} (${m.tacticalTheme || (m.isBrilliant ? 'brilliant' : 'blunder')})`)
      .slice(0, 5);

    return {
      wordCount,
      readingTime,
      emotionalArc,
      keyMoments,
      difficulty: analysis.analysis.difficultyLevel
    };
  }

  private generateTags(analysis: PGNAnalysis, config: StorytellingConfig): string[] {
    const tags = [
      config.mode,
      analysis.analysis.difficultyLevel,
      ...analysis.analysis.tacticalThemes,
      `${analysis.analysis.brilliancyScore}-brilliancy`,
      config.accessLevel
    ];

    if (analysis.gameInfo.white) tags.push(analysis.gameInfo.white);
    if (analysis.gameInfo.black) tags.push(analysis.gameInfo.black);
    if (analysis.gameInfo.event) tags.push(analysis.gameInfo.event);

    return [...new Set(tags)].slice(0, 10);
  }
}
