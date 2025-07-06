import { BambaiVoiceEngine } from '@/lib/voice/BambaiVoiceEngine';
import { PGNEmotionClassifier, PGNEmotionAnalysis } from '@/lib/analysis/PGNEmotionClassifier';

export interface DocumentarySegment {
  id: string;
  title: string;
  content: string;
  voiceScript: string;
  duration: number;
  emotionalTone: string;
  visualCues: string[];
  transitionType: 'fade' | 'cut' | 'dissolve' | 'dramatic';
}

export interface DocumentaryStructure {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  segments: DocumentarySegment[];
  metadata: {
    gameInfo: string;
    players: string;
    event: string;
    emotionalArc: string;
    keyMoments: number[];
  };
  thumbnailData: {
    title: string;
    subtitle: string;
    visualStyle: 'dramatic' | 'elegant' | 'modern' | 'classic';
  };
}

export interface DocumentaryConfig {
  targetDuration?: number;
  voiceMode?: 'dramatic' | 'documentary' | 'educational' | 'storytelling';
  includeAnalysis?: boolean;
  includeHistory?: boolean;
  emotionalIntensity?: 'low' | 'medium' | 'high';
  narrativeStyle?: 'chronological' | 'thematic' | 'dramatic-arc';
}

export class YouTubeDocumentaryGenerator {
  private bambaiEngine: BambaiVoiceEngine;
  private emotionClassifier: PGNEmotionClassifier;
  private outputDir: string;

  constructor() {
    this.bambaiEngine = new BambaiVoiceEngine();
    this.emotionClassifier = new PGNEmotionClassifier();
    this.outputDir = '/tmp/documentaries';
    void this.initializeOutputDirectory();
  }

  private async initializeOutputDirectory(): Promise<void> {
    try {
      const fs = await import('fs');
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to initialize output directory:', error);
    }
  }

  async generateDocumentary(
    pgn: string, 
    gameInfo: { players?: string; event?: string; date?: string } = {},
    config: DocumentaryConfig = {}
  ): Promise<DocumentaryStructure> {
    if (!pgn || typeof pgn !== 'string' || pgn.length > 100000) {
      throw new Error('Invalid PGN input - must be string under 100KB');
    }

    if (pgn.trim().length === 0) {
      throw new Error('PGN cannot be empty');
    }

    const sanitizedPgn = this.sanitizePGN(pgn);
    
    const emotionAnalysis = await this.emotionClassifier.classifyPGN(sanitizedPgn);
    
    const documentaryId = this.generateDocumentaryId();
    const segments = await this.createDocumentarySegments(sanitizedPgn, emotionAnalysis, config);
    const metadata = this.generateMetadata(gameInfo, emotionAnalysis);
    const thumbnailData = this.generateThumbnailData(emotionAnalysis, gameInfo);

    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);

    return {
      id: documentaryId,
      title: this.generateDocumentaryTitle(gameInfo, emotionAnalysis),
      description: this.generateDocumentaryDescription(gameInfo, emotionAnalysis),
      totalDuration,
      segments,
      metadata,
      thumbnailData
    };
  }

  private sanitizePGN(pgn: string): string {
    return pgn
      .slice(0, 50000)
      .replace(/[<>\"'&]/g, '')
      .replace(/\{[^}]{0,500}\}/g, '')
      .replace(/\([^)]{0,500}\)/g, '')
      .trim();
  }

  private async createDocumentarySegments(
    pgn: string, 
    analysis: PGNEmotionAnalysis, 
    config: DocumentaryConfig
  ): Promise<DocumentarySegment[]> {
    const segments: DocumentarySegment[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    config.targetDuration || 300; // 5 minutes default
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    config.voiceMode || 'documentary';

    const introSegment = await this.createIntroSegment(analysis);
    segments.push(introSegment);

    for (const keyMoment of analysis.keyMoments.slice(0, 3)) {
      const momentSegment = await this.createMomentSegment(keyMoment, analysis);
      segments.push(momentSegment);
    }

    const climaxSegment = await this.createClimaxSegment(analysis);
    segments.push(climaxSegment);

    const conclusionSegment = await this.createConclusionSegment(analysis);
    segments.push(conclusionSegment);

    return segments;
  }

  private async createIntroSegment(analysis: PGNEmotionAnalysis): Promise<DocumentarySegment> {
    const script = this.generateIntroScript(analysis);
    
    return {
      id: `intro-${Date.now()}`,
      title: 'Opening',
      content: 'Game introduction and setup',
      voiceScript: script,
      duration: 45,
      emotionalTone: 'anticipation',
      visualCues: ['board-setup', 'player-portraits', 'venue-shots'],
      transitionType: 'fade'
    };
  }

  private async createMomentSegment(
    moment: { moveNumber: number; emotion: string; intensity: number; position: string }, 
    analysis: PGNEmotionAnalysis
  ): Promise<DocumentarySegment> {
    const script = this.generateMomentScript(moment, analysis);
    
    return {
      id: `moment-${moment.moveNumber}-${Date.now()}`,
      title: `Critical Move ${moment.moveNumber}`,
      content: `Analysis of move ${moment.moveNumber}`,
      voiceScript: script,
      duration: 60,
      emotionalTone: moment.emotion,
      visualCues: ['board-position', 'move-highlight', 'evaluation-graph'],
      transitionType: moment.intensity > 0.7 ? 'dramatic' : 'dissolve'
    };
  }

  private async createClimaxSegment(analysis: PGNEmotionAnalysis): Promise<DocumentarySegment> {
    const script = this.generateClimaxScript(analysis);
    
    return {
      id: `climax-${Date.now()}`,
      title: 'The Decisive Moment',
      content: 'Game-changing sequence',
      voiceScript: script,
      duration: 90,
      emotionalTone: analysis.dominantEmotion,
      visualCues: ['dramatic-zoom', 'piece-movement', 'tension-music'],
      transitionType: 'dramatic'
    };
  }

  private async createConclusionSegment(analysis: PGNEmotionAnalysis): Promise<DocumentarySegment> {
    const script = this.generateConclusionScript(analysis);
    
    return {
      id: `conclusion-${Date.now()}`,
      title: 'Resolution',
      content: 'Game conclusion and reflection',
      voiceScript: script,
      duration: 45,
      emotionalTone: 'reflective',
      visualCues: ['final-position', 'handshake', 'credits'],
      transitionType: 'fade'
    };
  }

  private generateIntroScript(analysis: PGNEmotionAnalysis): string {
    const templates = [
      `In the world of chess, some games transcend mere competition. Today, we witness a ${analysis.gamePhase} battle that showcases the very essence of strategic warfare.`,
      `What you're about to see is more than just a chess game. It's a story of ${analysis.dominantEmotion}, where every move carries the weight of destiny.`,
      `Chess masters often speak of games that define careers. This is one such encounter, where ${analysis.dominantEmotion} meets pure calculation.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateMomentScript(moment: { moveNumber: number; emotion: string; position: string }, analysis: PGNEmotionAnalysis): string {
    return `Move ${moment.moveNumber} - ${moment.position}. Here we see ${moment.emotion} at its peak. The evaluation shifts dramatically as the position transforms before our eyes. This is chess at its most ${analysis.dominantEmotion}.`;
  }

  private generateClimaxScript(analysis: PGNEmotionAnalysis): string {
    return `And here it is - the moment that defines the entire game. With ${analysis.dominantEmotion} reaching its crescendo, we witness why chess is called the royal game. Every piece, every square, every second matters.`;
  }

  private generateConclusionScript(analysis: PGNEmotionAnalysis): string {
    return `As the dust settles on this remarkable encounter, we're reminded why chess continues to captivate minds across centuries. The ${analysis.dominantEmotion} we witnessed today will be remembered long after the pieces are put away.`;
  }

  private generateDocumentaryTitle(gameInfo: { players?: string; event?: string; date?: string }, analysis: PGNEmotionAnalysis): string {
    const players = gameInfo.players || 'Masters';
    const emotion = analysis.dominantEmotion;
    
    const titleTemplates = [
      `${players}: A Tale of ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`,
      `The ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Game: ${players}`,
      `Chess Masterpiece: When ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Meets Strategy`
    ];
    
    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  }

  private generateDocumentaryDescription(gameInfo: { players?: string; event?: string; date?: string }, analysis: PGNEmotionAnalysis): string {
    return `Experience chess like never before in this cinematic documentary. Witness ${analysis.dominantEmotion} unfold across ${analysis.emotionalTimeline.length} moves of pure strategic brilliance. From ${analysis.gamePhase} to endgame, every moment is crafted to showcase the artistry of chess.

🎬 Features:
• AI-powered emotional analysis
• Dramatic voice narration
• Professional cinematography
• Expert commentary

#Chess #Documentary #Strategy #${analysis.dominantEmotion.charAt(0).toUpperCase() + analysis.dominantEmotion.slice(1)}`;
  }

  private generateMetadata(gameInfo: { players?: string; event?: string; date?: string }, analysis: PGNEmotionAnalysis) {
    return {
      gameInfo: `${gameInfo.event || 'Chess Game'} - ${gameInfo.date || 'Date Unknown'}`,
      players: gameInfo.players || 'Unknown Players',
      event: gameInfo.event || 'Chess Match',
      emotionalArc: analysis.dominantEmotion,
      keyMoments: analysis.keyMoments.map(m => m.moveNumber)
    };
  }

  private generateThumbnailData(analysis: PGNEmotionAnalysis, gameInfo: { players?: string; event?: string; date?: string }) {
    const styles = ['dramatic', 'elegant', 'modern', 'classic'] as const;
    
    return {
      title: gameInfo.players || 'Chess Masters',
      subtitle: `${analysis.dominantEmotion.toUpperCase()} GAME`,
      visualStyle: styles[Math.floor(Math.random() * styles.length)]
    };
  }

  private generateDocumentaryId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async renderDocumentary(documentary: DocumentaryStructure): Promise<string> {
    const outputPath = `${this.outputDir}/${documentary.id}.mp4`;
    
    console.log(`Rendering documentary: ${documentary.title}`);
    console.log(`Total duration: ${documentary.totalDuration} seconds`);
    console.log(`Segments: ${documentary.segments.length}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputPath;
  }

  async generateBatchDocumentaries(
    pgnList: string[], 
    gameInfoList: Array<{ players?: string; event?: string; date?: string }> = [], 
    config: DocumentaryConfig = {}
  ): Promise<DocumentaryStructure[]> {
    if (!Array.isArray(pgnList) || pgnList.length === 0 || pgnList.length > 5) {
      throw new Error('PGN list must contain 1-5 games');
    }

    const documentaries: DocumentaryStructure[] = [];
    
    for (let i = 0; i < pgnList.length; i++) {
      try {
        const pgn = pgnList[i];
        const gameInfo = gameInfoList[i] || {};
        
        if (!pgn || typeof pgn !== 'string' || pgn.length > 100000) {
          console.error(`Skipping invalid PGN at index ${i}`);
          continue;
        }
        
        const documentary = await this.generateDocumentary(pgn, gameInfo, config);
        documentaries.push(documentary);
      } catch (error) {
        console.error(`Error generating documentary ${i}:`, error);
      }
    }
    
    return documentaries;
  }

  generateUploadMetadata(documentary: DocumentaryStructure) {
    return {
      title: documentary.title,
      description: documentary.description,
      tags: [
        'chess',
        'documentary',
        'strategy',
        'analysis',
        documentary.metadata.emotionalArc,
        'AI-generated',
        'chess-masterpiece'
      ],
      category: 'Education',
      privacy: 'public',
      thumbnail: documentary.thumbnailData
    };
  }
}
