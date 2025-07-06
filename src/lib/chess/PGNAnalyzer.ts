import { Chess } from 'chess.js';

export interface PGNAnalysis {
  isValid: boolean;
  moves: Array<{
    san: string;
    fen: string;
    moveNumber: number;
    annotation?: string;
    evaluation?: number;
    isBlunder?: boolean;
    isBrilliant?: boolean;
    tacticalTheme?: string;
  }>;
  gameInfo: {
    white?: string;
    black?: string;
    result?: string;
    date?: string;
    event?: string;
    site?: string;
  };
  analysis: {
    brilliancyScore: number;
    blunderCount: number;
    tacticalThemes: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    emotionTimeline: Array<{
      moveNumber: number;
      emotion: 'tension' | 'triumph' | 'tragedy' | 'mystery' | 'neutral';
      intensity: number;
    }>;
  };
}

export class PGNAnalyzer {
  private emotionPatterns = {
    tension: /check|attack|pressure|critical|decisive/i,
    triumph: /brilliant|excellent|best|winning|advantage/i,
    tragedy: /blunder|mistake|loses|bad|poor/i,
    mystery: /interesting|unusual|surprising|unexpected/i
  };

  private tacticalPatterns = {
    fork: /fork|double.attack/i,
    pin: /pin|pinned/i,
    skewer: /skewer/i,
    discovery: /discover|x.ray/i,
    sacrifice: /sacrifice|sac/i,
    mate: /mate|checkmate|#/i,
    promotion: /promote|=Q|=R|=B|=N/i
  };

  async analyzePGN(pgnString: string): Promise<PGNAnalysis> {
    const chess = new Chess();
    
    try {
      chess.loadPgn(pgnString);
    } catch {
      return {
        isValid: false,
        moves: [],
        gameInfo: {},
        analysis: {
          brilliancyScore: 0,
          blunderCount: 0,
          tacticalThemes: [],
          difficultyLevel: 'beginner',
          emotionTimeline: []
        }
      };
    }

    const history = chess.history({ verbose: true });
    const moves = [];
    const emotionTimeline = [];
    let brilliancyScore = 0;
    let blunderCount = 0;
    const tacticalThemes = new Set<string>();

    chess.reset();

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      chess.move(move);
      
      const annotation = this.generateMoveAnnotation(move, chess);
      const evaluation = this.evaluatePosition(chess);
      const isBlunder = this.isBlunder(move, evaluation);
      const isBrilliant = this.isBrilliant(move, evaluation);
      const tacticalTheme = this.detectTacticalTheme(move, annotation);

      if (isBlunder) blunderCount++;
      if (isBrilliant) brilliancyScore += 10;
      if (tacticalTheme) tacticalThemes.add(tacticalTheme);

      const emotion = this.detectMoveEmotion(annotation);
      const intensity = this.calculateEmotionIntensity(move, evaluation);

      moves.push({
        san: move.san,
        fen: chess.fen(),
        moveNumber: Math.ceil((i + 1) / 2),
        annotation,
        evaluation,
        isBlunder,
        isBrilliant,
        tacticalTheme
      });

      emotionTimeline.push({
        moveNumber: Math.ceil((i + 1) / 2),
        emotion,
        intensity
      });
    }

    const gameInfo = this.extractGameInfo(pgnString);
    const difficultyLevel = this.calculateDifficultyLevel(brilliancyScore, blunderCount, tacticalThemes.size);

    return {
      isValid: true,
      moves,
      gameInfo,
      analysis: {
        brilliancyScore,
        blunderCount,
        tacticalThemes: Array.from(tacticalThemes),
        difficultyLevel,
        emotionTimeline
      }
    };
  }

  private generateMoveAnnotation(move: { san: string; captured?: string; promotion?: string; flags: string }, chess: Chess): string {
    const annotations = [];

    if (chess.inCheck()) {
      annotations.push("Gives check");
    }

    if (chess.isCheckmate()) {
      return "Checkmate! Game over.";
    }

    if (chess.isStalemate()) {
      return "Stalemate - the game is drawn.";
    }

    if (move.captured) {
      annotations.push(`Captures the ${move.captured}`);
    }

    if (move.promotion) {
      annotations.push(`Promotes to ${move.promotion}`);
    }

    if (move.flags.includes('c')) {
      annotations.push("Castles");
    }

    if (move.flags.includes('e')) {
      annotations.push("En passant capture");
    }

    return annotations.length > 0 ? annotations.join('. ') + '.' : 'Develops the position.';
  }

  private evaluatePosition(chess: Chess): number {
    let evaluation = 0;
    
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const board = chess.board();
    
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type as keyof typeof pieceValues];
          evaluation += square.color === 'w' ? value : -value;
        }
      }
    }

    if (chess.inCheck()) {
      evaluation += chess.turn() === 'w' ? -0.5 : 0.5;
    }

    const mobility = chess.moves().length;
    evaluation += chess.turn() === 'w' ? mobility * 0.1 : -mobility * 0.1;

    return Math.round(evaluation * 100) / 100;
  }

  private isBlunder(move: { captured?: string }, evaluation: number): boolean {
    return Math.abs(evaluation) > 3 && move.captured === undefined;
  }

  private isBrilliant(move: { captured?: string }, evaluation: number): boolean {
    return evaluation > 2 || (!!move.captured && evaluation > 0);
  }

  private detectTacticalTheme(move: { san: string }, annotation: string): string | undefined {
    for (const [theme, pattern] of Object.entries(this.tacticalPatterns)) {
      if (pattern.test(annotation) || pattern.test(move.san)) {
        return theme;
      }
    }
    return undefined;
  }

  private detectMoveEmotion(annotation: string): 'tension' | 'triumph' | 'tragedy' | 'mystery' | 'neutral' {
    for (const [emotion, pattern] of Object.entries(this.emotionPatterns)) {
      if (pattern.test(annotation)) {
        return emotion as 'tension' | 'triumph' | 'tragedy' | 'mystery';
      }
    }
    return 'neutral';
  }

  private calculateEmotionIntensity(move: { captured?: string; promotion?: string; flags: string }, evaluation: number): number {
    let intensity = 0.5;
    
    if (Math.abs(evaluation) > 2) intensity += 0.3;
    if (move.captured) intensity += 0.2;
    if (move.promotion) intensity += 0.3;
    if (move.flags.includes('c')) intensity += 0.1;
    
    return Math.min(intensity, 1.0);
  }

  private extractGameInfo(pgnString: string): Record<string, string> {
    const info: Record<string, string> = {};
    const lines = pgnString.split('\n');
    
    for (const line of lines) {
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        const [, key, value] = match;
        info[key.toLowerCase()] = value;
      }
    }
    
    return info;
  }

  private calculateDifficultyLevel(brilliancyScore: number, blunderCount: number, tacticalCount: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const complexity = brilliancyScore + tacticalCount * 5 - blunderCount * 2;
    
    if (complexity < 10) return 'beginner';
    if (complexity < 25) return 'intermediate';
    if (complexity < 50) return 'advanced';
    return 'expert';
  }

  async enhanceContentWithAI(content: string, analysis: PGNAnalysis): Promise<string> {
    const emotionalContext = analysis.analysis.emotionTimeline
      .filter(e => e.emotion !== 'neutral')
      .map(e => `Move ${e.moveNumber}: ${e.emotion} (intensity: ${e.intensity})`)
      .join('\n');

    const tacticalContext = analysis.analysis.tacticalThemes.length > 0
      ? `Key tactical themes: ${analysis.analysis.tacticalThemes.join(', ')}`
      : 'Positional play dominates this game.';

    const enhancedContent = `${content}

## Game Analysis
${tacticalContext}

Brilliancy Score: ${analysis.analysis.brilliancyScore}/100
Difficulty Level: ${analysis.analysis.difficultyLevel}

## Emotional Journey
${emotionalContext}

This game showcases ${analysis.analysis.difficultyLevel}-level chess with ${analysis.analysis.tacticalThemes.length} distinct tactical themes.`;

    return enhancedContent;
  }
}
