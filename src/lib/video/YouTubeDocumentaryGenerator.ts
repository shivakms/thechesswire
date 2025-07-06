import { createHash } from 'crypto';
export interface EmotionalMove {
  move: string;
  moveNumber: number;
  emotions: {
    tension: number;
    hope: number;
    aggression: number;
    collapse: number;
  };
  intensity: 'low' | 'medium' | 'high' | 'critical';
  narrative: string;
}

export interface EmotionHeatmap {
  moves: EmotionalMove[];
  overallArc: string;
  peakMoments: number[];
  emotionalFlow: string;
}
import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';

export interface DocumentaryConfig {
  title?: string;
  description?: string;
  tags?: string[];
  thumbnail?: {
    template: 'dramatic' | 'tactical' | 'endgame' | 'opening';
    customText?: string;
  };
  narrationStyle: 'wiseMentor' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' | 'warmEncourager' | 'poeticStoryteller' | 'whisperMode' | 'dramaticNarrator';
  includeAnalysis: boolean;
  includeMoveAnnotations: boolean;
  maxDuration: number; // in seconds
}

export interface DocumentarySegment {
  type: 'intro' | 'opening' | 'middlegame' | 'endgame' | 'conclusion';
  startTime: number;
  duration: number;
  narrationText: string;
  audioUrl?: string;
  visualElements: {
    boardPosition?: string;
    highlightSquares?: string[];
    annotations?: string[];
    overlayText?: string;
  };
}

export interface YouTubeDocumentary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  segments: DocumentarySegment[];
  totalDuration: number;
  thumbnailUrl?: string;
  metadata: {
    pgn: string;
    emotionalProfile: EmotionHeatmap;
    gameInfo: {
      white?: string;
      black?: string;
      event?: string;
      date?: string;
      result?: string;
    };
  };
  status: 'generating' | 'ready' | 'uploaded' | 'failed';
  youtubeId?: string;
  createdAt: Date;
}

export class YouTubeDocumentaryGenerator {
  private voiceEngine: BambaiVoiceEngine;
  
  constructor() {
    this.voiceEngine = new BambaiVoiceEngine();
  }
  
  async generateDocumentary(
    pgn: string, 
    config: DocumentaryConfig
  ): Promise<YouTubeDocumentary> {
    try {
      const documentaryId = this.generateDocumentaryId(pgn);
      const emotionalProfile = await this.classifyPGN(pgn);
      const gameInfo = this.extractGameInfo(pgn);
      
      const title = config.title || this.generateEmotionBasedTitle(emotionalProfile, gameInfo);
      const description = config.description || this.generateDescription(emotionalProfile, gameInfo);
      const tags = config.tags || this.generateTags(emotionalProfile, gameInfo);
      
      const segments = await this.createDocumentarySegments(
        pgn, 
        emotionalProfile, 
        config
      );
      
      const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
      
      if (totalDuration > config.maxDuration) {
        throw new Error(`Documentary duration (${totalDuration}s) exceeds maximum (${config.maxDuration}s)`);
      }
      
      const documentary: YouTubeDocumentary = {
        id: documentaryId,
        title,
        description,
        tags,
        segments,
        totalDuration,
        metadata: {
          pgn,
          emotionalProfile,
          gameInfo
        },
        status: 'generating',
        createdAt: new Date()
      };
      
      await this.generateNarrationAudio(documentary, config);
      
      documentary.status = 'ready';
      return documentary;
      
    } catch (error) {
      console.error('Documentary generation failed:', error);
      throw new Error(`Failed to generate documentary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private generateDocumentaryId(pgn: string): string {
    const hash = createHash('sha256').update(pgn.trim()).digest('hex');
    return `doc_${hash.substring(0, 12)}_${Date.now()}`;
  }
  
  private extractGameInfo(pgn: string): YouTubeDocumentary['metadata']['gameInfo'] {
    const info: YouTubeDocumentary['metadata']['gameInfo'] = {};
    
    const whiteMatch = pgn.match(/\[White\s+"([^"]+)"\]/);
    if (whiteMatch) info.white = whiteMatch[1];
    
    const blackMatch = pgn.match(/\[Black\s+"([^"]+)"\]/);
    if (blackMatch) info.black = blackMatch[1];
    
    const eventMatch = pgn.match(/\[Event\s+"([^"]+)"\]/);
    if (eventMatch) info.event = eventMatch[1];
    
    const dateMatch = pgn.match(/\[Date\s+"([^"]+)"\]/);
    if (dateMatch) info.date = dateMatch[1];
    
    const resultMatch = pgn.match(/\[Result\s+"([^"]+)"\]/);
    if (resultMatch) info.result = resultMatch[1];
    
    return info;
  }
  
  private generateEmotionBasedTitle(
    emotionalProfile: EmotionHeatmap, 
    gameInfo: YouTubeDocumentary['metadata']['gameInfo']
  ): string {
    const templates = {
      high_tension: [
        "Epic Chess Battle: {white} vs {black}",
        "Thrilling Tactical Warfare: {event}",
        "Heart-Stopping Chess Drama"
      ],
      high_aggression: [
        "Aggressive Chess Masterpiece: {white} vs {black}",
        "Brutal Chess Attack: {event}",
        "Ruthless Chess Tactics Unleashed"
      ],
      high_hope: [
        "Inspiring Chess Comeback: {white} vs {black}",
        "Against All Odds: {event}",
        "Chess Miracle: The Impossible Victory"
      ],
      balanced: [
        "Strategic Chess Masterclass: {white} vs {black}",
        "Beautiful Chess Game: {event}",
        "Chess Artistry at Its Finest"
      ]
    };
    
    const avgTension = emotionalProfile.moves.reduce((sum: number, m: any) => sum + m.emotions.tension, 0) / emotionalProfile.moves.length;
    const avgAggression = emotionalProfile.moves.reduce((sum: number, m: any) => sum + m.emotions.aggression, 0) / emotionalProfile.moves.length;
    const avgHope = emotionalProfile.moves.reduce((sum: number, m: any) => sum + m.emotions.hope, 0) / emotionalProfile.moves.length;
    
    let category: keyof typeof templates = 'balanced';
    if (avgTension > 60) category = 'high_tension';
    else if (avgAggression > 60) category = 'high_aggression';
    else if (avgHope > 60) category = 'high_hope';
    
    const templateList = templates[category];
    const template = templateList[Math.floor(Math.random() * templateList.length)];
    
    return template
      .replace('{white}', gameInfo.white || 'Player 1')
      .replace('{black}', gameInfo.black || 'Player 2')
      .replace('{event}', gameInfo.event || 'Chess Game');
  }
  
  private generateDescription(
    emotionalProfile: EmotionHeatmap, 
    gameInfo: YouTubeDocumentary['metadata']['gameInfo']
  ): string {
    const players = gameInfo.white && gameInfo.black 
      ? `${gameInfo.white} vs ${gameInfo.black}` 
      : 'An exciting chess game';
    
    const event = gameInfo.event ? ` from ${gameInfo.event}` : '';
    const date = gameInfo.date ? ` (${gameInfo.date})` : '';
    
    return `🎬 Experience this ${emotionalProfile.overallArc.toLowerCase()}${event}${date} through the eyes of Bambai AI!

${players} delivers ${emotionalProfile.emotionalFlow.toLowerCase()}

🔥 Peak Moments: ${emotionalProfile.peakMoments.length} critical turning points
🎯 Emotional Journey: ${emotionalProfile.overallArc}

Narrated with passion and insight by Bambai AI - the voice that brings chess to life.

#Chess #ChessGame #BambaiAI #TheChessWire #ChessDocumentary`;
  }
  
  private generateTags(
    emotionalProfile: EmotionHeatmap, 
    gameInfo: YouTubeDocumentary['metadata']['gameInfo']
  ): string[] {
    const baseTags = ['chess', 'chess game', 'bambai ai', 'thechesswire', 'chess documentary'];
    
    const emotionTags: string[] = [];
    const avgEmotions = emotionalProfile.moves.reduce(
      (acc: any, move: any) => {
        acc.tension += move.emotions.tension;
        acc.aggression += move.emotions.aggression;
        acc.hope += move.emotions.hope;
        acc.collapse += move.emotions.collapse;
        return acc;
      },
      { tension: 0, aggression: 0, hope: 0, collapse: 0 }
    );
    
    const moveCount = emotionalProfile.moves.length;
    if (moveCount > 0) {
      if (avgEmotions.tension / moveCount > 50) emotionTags.push('tactical chess', 'chess tactics');
      if (avgEmotions.aggression / moveCount > 50) emotionTags.push('aggressive chess', 'chess attack');
      if (avgEmotions.hope / moveCount > 50) emotionTags.push('chess comeback', 'inspiring chess');
      if (avgEmotions.collapse / moveCount > 30) emotionTags.push('chess blunder', 'chess drama');
    }
    
    const contextTags: string[] = [];
    if (gameInfo.event) {
      contextTags.push(gameInfo.event.toLowerCase());
    }
    if (gameInfo.white || gameInfo.black) {
      contextTags.push('master chess', 'professional chess');
    }
    
    return [...baseTags, ...emotionTags, ...contextTags].slice(0, 15);
  }
  
  private async createDocumentarySegments(
    pgn: string, 
    emotionalProfile: EmotionHeatmap, 
    config: DocumentaryConfig
  ): Promise<DocumentarySegment[]> {
    const segments: DocumentarySegment[] = [];
    let currentTime = 0;
    
    const introDuration = 8;
    const introSegment: DocumentarySegment = {
      type: 'intro',
      startTime: currentTime,
      duration: introDuration,
      narrationText: this.generateIntroNarration(emotionalProfile),
      visualElements: {
        overlayText: 'TheChessWire.news presents...',
        annotations: ['Bambai AI Documentary']
      }
    };
    segments.push(introSegment);
    currentTime += introDuration;
    
    const gameSegments = this.createGameSegments(emotionalProfile, config, currentTime);
    segments.push(...gameSegments);
    currentTime += gameSegments.reduce((sum, seg) => sum + seg.duration, 0);
    
    const conclusionDuration = 6;
    const conclusionSegment: DocumentarySegment = {
      type: 'conclusion',
      startTime: currentTime,
      duration: conclusionDuration,
      narrationText: this.generateConclusionNarration(emotionalProfile),
      visualElements: {
        overlayText: 'Thank you for watching',
        annotations: ['Subscribe for more chess stories']
      }
    };
    segments.push(conclusionSegment);
    
    return segments;
  }
  
  private createGameSegments(
    emotionalProfile: EmotionHeatmap, 
    config: DocumentaryConfig, 
    startTime: number
  ): DocumentarySegment[] {
    const segments: DocumentarySegment[] = [];
    let currentTime = startTime;
    
    const moveCount = emotionalProfile.moves.length;
    const segmentDuration = Math.min(15, Math.max(5, (config.maxDuration - 20) / Math.max(1, moveCount)));
    
    for (let i = 0; i < Math.min(moveCount, 10); i++) {
      const move = emotionalProfile.moves[i];
      const segmentType = this.determineSegmentType(i, moveCount);
      
      const segment: DocumentarySegment = {
        type: segmentType,
        startTime: currentTime,
        duration: segmentDuration,
        narrationText: move.narrative,
        visualElements: {
          boardPosition: `move_${i + 1}`,
          highlightSquares: [move.move],
          annotations: [`Move ${move.moveNumber}: ${move.move}`, `Intensity: ${move.intensity}`]
        }
      };
      
      segments.push(segment);
      currentTime += segmentDuration;
    }
    
    return segments;
  }
  
  private determineSegmentType(moveIndex: number, totalMoves: number): DocumentarySegment['type'] {
    const ratio = moveIndex / Math.max(1, totalMoves - 1);
    if (ratio < 0.3) return 'opening';
    if (ratio < 0.7) return 'middlegame';
    return 'endgame';
  }
  
  private generateIntroNarration(emotionalProfile: EmotionHeatmap): string {
    const templates = [
      `Welcome to a chess story that will captivate your soul. ${emotionalProfile.overallArc}`,
      `Prepare yourself for a journey through the mind of chess masters. ${emotionalProfile.emotionalFlow}`,
      `This is more than a game - this is a battle of wills, a dance of strategy. ${emotionalProfile.overallArc}`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private generateConclusionNarration(emotionalProfile: EmotionHeatmap): string {
    const templates = [
      `And so concludes this magnificent chess tale. The board may be silent, but the echoes of brilliance remain.`,
      `Every move told a story, every decision shaped destiny. This is the beauty of chess.`,
      `From opening to endgame, we witnessed the poetry of strategic thought. Until next time, keep the passion alive.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private async generateNarrationAudio(
    documentary: YouTubeDocumentary, 
    config: DocumentaryConfig
  ): Promise<void> {
    try {
      for (const segment of documentary.segments) {
        if (segment.narrationText) {
          const audioBuffer = await this.voiceEngine.generateVoice(
            segment.narrationText,
            config.narrationStyle
          );
          
          if (audioBuffer && audioBuffer.length > 0) {
            segment.audioUrl = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate narration audio:', error);
      throw new Error('Audio generation failed');
    }
  }
  
  private mapSegmentToEmotion(segmentType: DocumentarySegment['type']): string {
    const emotionMap = {
      intro: 'anticipation',
      opening: 'curiosity',
      middlegame: 'tension',
      endgame: 'intensity',
      conclusion: 'satisfaction'
    };
    
    return emotionMap[segmentType] || 'neutral';
  }
  
  async generateThumbnail(
    documentary: YouTubeDocumentary, 
    template: DocumentaryConfig['thumbnail']
  ): Promise<string> {
    const thumbnailId = `thumb_${documentary.id}_${Date.now()}`;
    
    const thumbnailData = {
      template: template?.template || 'dramatic',
      title: documentary.title,
      customText: template?.customText,
      gameInfo: documentary.metadata.gameInfo,
      emotionalProfile: documentary.metadata.emotionalProfile
    };
    
    console.log('Generating thumbnail with data:', thumbnailData);
    
    return `https://thumbnails.thechesswire.news/${thumbnailId}.jpg`;
  }
  
  static async listDocumentaries(
    userId?: string, 
    status?: YouTubeDocumentary['status']
  ): Promise<YouTubeDocumentary[]> {
    console.log('Listing documentaries for user:', userId, 'with status:', status);
    return [];
  }
  
  static async getDocumentary(documentaryId: string): Promise<YouTubeDocumentary | null> {
    console.log('Fetching documentary:', documentaryId);
    return null;
  }
  
  static async deleteDocumentary(documentaryId: string): Promise<boolean> {
    console.log('Deleting documentary:', documentaryId);
    return true;
  }
  
  private async classifyPGN(pgn: string): Promise<EmotionHeatmap> {
    const moves = this.parsePGNMoves(pgn);
    const emotionalMoves: EmotionalMove[] = [];
    
    for (let i = 0; i < Math.min(moves.length, 10); i++) {
      const move = moves[i];
      const emotions = this.analyzeMove(move, i, moves);
      const intensity = this.calculateIntensity(emotions);
      const narrative = this.generateMoveNarrative(move, emotions, intensity);
      
      emotionalMoves.push({
        move,
        moveNumber: Math.floor(i / 2) + 1,
        emotions,
        intensity,
        narrative
      });
    }
    
    const overallArc = this.generateOverallArc(emotionalMoves);
    const peakMoments = this.identifyPeakMoments(emotionalMoves);
    const emotionalFlow = this.generateEmotionalFlow(emotionalMoves);
    
    return {
      moves: emotionalMoves,
      overallArc,
      peakMoments,
      emotionalFlow
    };
  }
  
  private parsePGNMoves(pgn: string): string[] {
    const moves: string[] = [];
    const limitedPgn = pgn.substring(0, 200);
    const cleanPgn = limitedPgn.replace(/\{[^}]*\}/g, '').replace(/\([^)]*\)/g, '');
    
    const movePattern = /\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)\b/g;
    let match;
    let iterations = 0;
    const maxIterations = 20;
    
    while ((match = movePattern.exec(cleanPgn)) !== null && iterations < maxIterations) {
      moves.push(match[1]);
      iterations++;
      
      if (movePattern.lastIndex === match.index) {
        movePattern.lastIndex++;
      }
    }
    
    return moves;
  }
  
  private analyzeMove(move: string, index: number, allMoves: string[]): EmotionalMove['emotions'] {
    const emotions = {
      tension: 30,
      hope: 40,
      aggression: 20,
      collapse: 10
    };
    
    if (move.includes('x')) emotions.aggression += 25;
    if (move.includes('+')) emotions.tension += 20;
    if (move.includes('#')) {
      emotions.hope += 40;
      emotions.tension += 30;
    }
    if (move.includes('O-O')) emotions.tension -= 10;
    if (move.includes('=')) emotions.hope += 30;
    
    const gamePhase = index < 20 ? 'opening' : index < 60 ? 'middlegame' : 'endgame';
    if (gamePhase === 'middlegame') {
      emotions.tension += 15;
      emotions.aggression += 10;
    }
    
    Object.keys(emotions).forEach(key => {
      emotions[key as keyof typeof emotions] = Math.max(0, Math.min(100, emotions[key as keyof typeof emotions]));
    });
    
    return emotions;
  }
  
  private calculateIntensity(emotions: EmotionalMove['emotions']): EmotionalMove['intensity'] {
    const maxEmotion = Math.max(...Object.values(emotions));
    
    if (maxEmotion >= 80) return 'critical';
    if (maxEmotion >= 60) return 'high';
    if (maxEmotion >= 40) return 'medium';
    return 'low';
  }
  
  private generateMoveNarrative(move: string, emotions: EmotionalMove['emotions'], intensity: EmotionalMove['intensity']): string {
    const templates = {
      critical: [
        `${move} - A moment that will define the entire game!`,
        `The decisive ${move} changes everything on the board.`
      ],
      high: [
        `${move} creates significant tension in the position.`,
        `An important ${move} that shifts the balance.`
      ],
      medium: [
        `${move} develops the position thoughtfully.`,
        `A solid ${move} that maintains the initiative.`
      ],
      low: [
        `${move} follows natural development principles.`,
        `A quiet ${move} that prepares future plans.`
      ]
    };
    
    const narratives = templates[intensity];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  private generateOverallArc(moves: EmotionalMove[]): string {
    if (moves.length === 0) return 'A quiet game with minimal emotional fluctuation.';
    
    const avgTension = moves.reduce((sum: number, m: any) => sum + m.emotions.tension, 0) / moves.length;
    const avgAggression = moves.reduce((sum: number, m: any) => sum + m.emotions.aggression, 0) / moves.length;
    
    if (avgTension > 60 && avgAggression > 50) {
      return 'A thrilling tactical battle with constant tension and aggressive play.';
    } else if (avgTension > 50) {
      return 'A tense strategic struggle with critical moments throughout.';
    } else {
      return 'A positional game with gradual maneuvering and strategic depth.';
    }
  }
  
  private identifyPeakMoments(moves: EmotionalMove[]): number[] {
    return moves
      .map((move, index) => ({ index, intensity: Math.max(...Object.values(move.emotions)) }))
      .filter(item => item.intensity >= 70)
      .map(item => item.index)
      .slice(0, 5);
  }
  
  private generateEmotionalFlow(moves: EmotionalMove[]): string {
    if (moves.length < 3) return 'Brief encounter with limited emotional development.';
    
    const early = moves.slice(0, Math.floor(moves.length / 3));
    const middle = moves.slice(Math.floor(moves.length / 3), Math.floor(2 * moves.length / 3));
    const late = moves.slice(Math.floor(2 * moves.length / 3));
    
    const earlyTension = early.reduce((sum: number, m: any) => sum + m.emotions.tension, 0) / early.length;
    const middleTension = middle.reduce((sum: number, m: any) => sum + m.emotions.tension, 0) / middle.length;
    const lateTension = late.reduce((sum: number, m: any) => sum + m.emotions.tension, 0) / late.length;
    
    if (middleTension > earlyTension && middleTension > lateTension) {
      return 'The game builds to a dramatic climax in the middlegame before resolving.';
    } else if (lateTension > earlyTension && lateTension > middleTension) {
      return 'Tension escalates throughout the game, reaching its peak in the endgame.';
    } else {
      return 'The emotional intensity remains relatively consistent throughout the game.';
    }
  }
}
