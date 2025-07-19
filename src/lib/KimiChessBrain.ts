/**
 * KimiChessBrain.ts
 * PGN Parser and Chess Game Analyzer
 * 
 * This module:
 * - Parses PGN (Portable Game Notation) files
 * - Outputs JSON with title, summary, annotated move list
 * - Identifies opening and tactical highlights
 * - Used as foundation for replay logic and article generation
 */

export interface ChessGame {
  title: string;
  summary: string;
  metadata: GameMetadata;
  moves: AnnotatedMove[];
  opening: OpeningInfo;
  tacticalHighlights: TacticalHighlight[];
  evaluation: GameEvaluation;
  error?: boolean;
  errorReason?: string;
}

export interface GameMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: string;
  blackElo?: string;
  timeControl?: string;
  eco?: string;
}

export interface AnnotatedMove {
  moveNumber: number;
  whiteMove?: Move;
  blackMove?: Move;
  comments?: string[];
  evaluation?: number; // Centipawns
  clock?: string;
}

export interface Move {
  san: string; // Standard Algebraic Notation
  from: string;
  to: string;
  piece: string;
  capture?: boolean;
  check?: boolean;
  checkmate?: boolean;
  promotion?: string;
  castle?: 'O-O' | 'O-O-O';
  enPassant?: boolean;
  annotation?: string; // !, !!, ?, ??, etc.
  comment?: string;
}

export interface OpeningInfo {
  name: string;
  eco: string;
  variation?: string;
  moves: string[];
  description: string;
}

export interface TacticalHighlight {
  moveNumber: number;
  type: 'brilliant' | 'blunder' | 'tactical' | 'positional' | 'endgame';
  description: string;
  evaluation: number;
  position: string; // FEN
}

export interface GameEvaluation {
  finalResult: string;
  whiteAdvantage: number;
  criticalMoments: number[];
  gameQuality: 'excellent' | 'good' | 'average' | 'poor';
}

export class KimiChessBrain {
  private pgn: string = '';
  private gameData: ChessGame | null = null;

  /**
   * Parse PGN and generate comprehensive game analysis
   */
  async analyzeGame(pgn: string): Promise<ChessGame> {
    try {
      this.pgn = pgn.trim();
      
      // Validate PGN
      const validation = this.validatePGN();
      if (!validation.valid) {
        return {
          title: 'Invalid Game',
          summary: 'Unable to parse the provided PGN.',
          metadata: {},
          moves: [],
          opening: { name: '', eco: '', moves: [], description: '' },
          tacticalHighlights: [],
          evaluation: { finalResult: '', whiteAdvantage: 0, criticalMoments: [], gameQuality: 'poor' },
          error: true,
          errorReason: validation.reason
        };
      }

      // Parse metadata
      const metadata = this.parseMetadata();
      
      // Parse moves
      const moves = this.parseMoves();
      
      // Analyze opening
      const opening = this.analyzeOpening(moves);
      
      // Identify tactical highlights
      const tacticalHighlights = this.identifyTacticalHighlights(moves);
      
      // Generate evaluation
      const evaluation = this.evaluateGame(moves, tacticalHighlights);
      
      // Generate title and summary
      const title = this.generateTitle(metadata, opening, evaluation);
      const summary = this.generateSummary(metadata, opening, tacticalHighlights, evaluation);

      this.gameData = {
        title,
        summary,
        metadata,
        moves,
        opening,
        tacticalHighlights,
        evaluation
      };

      return this.gameData;

    } catch (error) {
      console.error('KimiChessBrain analysis failed:', error);
      return {
        title: 'Analysis Error',
        summary: 'An error occurred while analyzing the game.',
        metadata: {},
        moves: [],
        opening: { name: '', eco: '', moves: [], description: '' },
        tacticalHighlights: [],
        evaluation: { finalResult: '', whiteAdvantage: 0, criticalMoments: [], gameQuality: 'poor' },
        error: true,
        errorReason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate PGN format and content
   */
  private validatePGN(): { valid: boolean; reason?: string } {
    if (!this.pgn || this.pgn.trim().length === 0) {
      return { valid: false, reason: 'Empty PGN string' };
    }

    // Check for basic PGN structure
    const lines = this.pgn.split('\n');
    let hasMetadata = false;
    let hasMoves = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.includes('"')) {
        hasMetadata = true;
      }
      if (trimmed.match(/^\d+\./)) {
        hasMoves = true;
      }
    }

    if (!hasMoves) {
      return { valid: false, reason: 'No moves found in PGN' };
    }

    return { valid: true };
  }

  /**
   * Parse game metadata from PGN headers
   */
  private parseMetadata(): GameMetadata {
    const metadata: GameMetadata = {};
    const lines = this.pgn.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.includes('"')) {
        const match = trimmed.match(/\[(\w+)\s+"([^"]*)"\]/);
        if (match) {
          const [, key, value] = match;
          metadata[key as keyof GameMetadata] = value;
        }
      }
    }

    return metadata;
  }

  /**
   * Parse moves from PGN
   */
  private parseMoves(): AnnotatedMove[] {
    const moves: AnnotatedMove[] = [];
    const moveText = this.extractMoveText();
    const moveTokens = this.tokenizeMoves(moveText);

    let currentMove: AnnotatedMove | null = null;
    let moveNumber = 1;

    for (const token of moveTokens) {
      if (token.match(/^\d+\./)) {
        // New move number
        if (currentMove) {
          moves.push(currentMove);
        }
        moveNumber = parseInt(token.replace('.', ''));
        currentMove = {
          moveNumber,
          comments: []
        };
      } else if (token.match(/^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?$/)) {
        // White move
        if (currentMove) {
          currentMove.whiteMove = this.parseMove(token);
        }
      } else if (token.match(/^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?$/)) {
        // Black move
        if (currentMove) {
          currentMove.blackMove = this.parseMove(token);
        }
      } else if (token.startsWith('{') && token.endsWith('}')) {
        // Comment
        if (currentMove) {
          currentMove.comments = currentMove.comments || [];
          currentMove.comments.push(token.slice(1, -1));
        }
      } else if (token.match(/^[!?]+$/)) {
        // Annotation
        if (currentMove?.whiteMove) {
          currentMove.whiteMove.annotation = token;
        } else if (currentMove?.blackMove) {
          currentMove.blackMove.annotation = token;
        }
      }
    }

    if (currentMove) {
      moves.push(currentMove);
    }

    return moves;
  }

  /**
   * Extract move text from PGN
   */
  private extractMoveText(): string {
    const lines = this.pgn.split('\n');
    let moveText = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('[') && trimmed.length > 0) {
        moveText += trimmed + ' ';
      }
    }

    return moveText;
  }

  /**
   * Tokenize move text into individual tokens
   */
  private tokenizeMoves(moveText: string): string[] {
    // Remove result and extra whitespace
    const cleanText = moveText.replace(/\s*\d+-\d+|\s*1\/2-1\/2|\s*\*\s*$/, '');
    
    // Split on spaces and filter empty tokens
    return cleanText.split(/\s+/).filter(token => token.length > 0);
  }

  /**
   * Parse individual move
   */
  private parseMove(san: string): Move {
    const move: Move = {
      san,
      from: '',
      to: '',
      piece: 'P',
      capture: false,
      check: false,
      checkmate: false
    };

    // Handle castling
    if (san === 'O-O' || san === 'O-O-O') {
      move.castle = san;
      move.piece = 'K';
      return move;
    }

    // Handle piece moves
    if (san.match(/^[KQRBN]/)) {
      move.piece = san[0];
      san = san.slice(1);
    }

    // Handle captures
    if (san.includes('x')) {
      move.capture = true;
      san = san.replace('x', '');
    }

    // Handle promotion
    const promotionMatch = san.match(/=([QRBN])/);
    if (promotionMatch) {
      move.promotion = promotionMatch[1];
      san = san.replace(/=[QRBN]/, '');
    }

    // Handle check/checkmate
    if (san.endsWith('#')) {
      move.checkmate = true;
      san = san.slice(0, -1);
    } else if (san.endsWith('+')) {
      move.check = true;
      san = san.slice(0, -1);
    }

    // Extract destination square
    const destMatch = san.match(/[a-h][1-8]$/);
    if (destMatch) {
      move.to = destMatch[0];
    }

    return move;
  }

  /**
   * Analyze opening from moves
   */
  private analyzeOpening(moves: AnnotatedMove[]): OpeningInfo {
    const openingMoves: string[] = [];
    
    // Collect first 10 moves for opening analysis
    for (const move of moves.slice(0, 10)) {
      if (move.whiteMove) {
        openingMoves.push(move.whiteMove.san);
      }
      if (move.blackMove) {
        openingMoves.push(move.blackMove.san);
      }
    }

    // Simple opening detection (enhanced in future versions)
    const opening = this.detectOpening(openingMoves);

    return {
      name: opening.name,
      eco: opening.eco,
      variation: opening.variation,
      moves: openingMoves,
      description: opening.description
    };
  }

  /**
   * Detect opening from move sequence
   */
  private detectOpening(moves: string[]): { name: string; eco: string; variation?: string; description: string } {
    const moveString = moves.join(' ').toLowerCase();

    // Basic opening detection (enhanced in future versions)
    if (moveString.includes('e4 e5')) {
      return {
        name: 'Open Game',
        eco: 'C20',
        description: 'A classic opening starting with 1.e4 e5, leading to open positions with tactical opportunities.'
      };
    } else if (moveString.includes('e4 c5')) {
      return {
        name: 'Sicilian Defense',
        eco: 'B20',
        description: 'A sharp and complex defense that leads to dynamic positions with chances for both sides.'
      };
    } else if (moveString.includes('d4 d5')) {
      return {
        name: 'Closed Game',
        eco: 'D00',
        description: 'A solid opening starting with 1.d4 d5, often leading to closed positions with strategic play.'
      };
    } else if (moveString.includes('d4 nf6')) {
      return {
        name: 'Indian Defense',
        eco: 'A40',
        description: 'A flexible defense that allows Black to develop pieces quickly and control the center.'
      };
    }

    return {
      name: 'Irregular Opening',
      eco: 'A00',
      description: 'An unconventional opening that doesn\'t follow standard opening principles.'
    };
  }

  /**
   * Identify tactical highlights in the game
   */
  private identifyTacticalHighlights(moves: AnnotatedMove[]): TacticalHighlight[] {
    const highlights: TacticalHighlight[] = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      
      // Check for annotations
      if (move.whiteMove?.annotation || move.blackMove?.annotation) {
        const annotation = move.whiteMove?.annotation || move.blackMove?.annotation;
        const type = this.classifyAnnotation(annotation || '');
        
        highlights.push({
          moveNumber: move.moveNumber,
          type,
          description: this.generateTacticalDescription(move, type),
          evaluation: this.estimateEvaluation(move),
          position: this.generateFEN(moves, i) // Simplified FEN generation
        });
      }

      // Check for captures (potential tactics)
      if (move.whiteMove?.capture || move.blackMove?.capture) {
        highlights.push({
          moveNumber: move.moveNumber,
          type: 'tactical',
          description: 'Tactical capture that changes the position',
          evaluation: this.estimateEvaluation(move),
          position: this.generateFEN(moves, i)
        });
      }
    }

    return highlights;
  }

  /**
   * Classify move annotation
   */
  private classifyAnnotation(annotation: string): TacticalHighlight['type'] {
    if (annotation.includes('!!')) return 'brilliant';
    if (annotation.includes('??')) return 'blunder';
    if (annotation.includes('!')) return 'tactical';
    if (annotation.includes('?')) return 'blunder';
    return 'tactical';
  }

  /**
   * Generate tactical description
   */
  private generateTacticalDescription(move: AnnotatedMove, type: TacticalHighlight['type']): string {
    const moveText = move.whiteMove?.san || move.blackMove?.san || '';
    
    switch (type) {
      case 'brilliant':
        return `Brilliant move ${moveText}! A deep tactical combination that creates winning chances.`;
      case 'blunder':
        return `Blunder ${moveText}. This move gives away the advantage and should be avoided.`;
      case 'tactical':
        return `Tactical move ${moveText}. A sharp continuation that requires accurate calculation.`;
      default:
        return `Interesting move ${moveText} that changes the character of the position.`;
    }
  }

  /**
   * Estimate move evaluation (simplified)
   */
  private estimateEvaluation(move: AnnotatedMove): number {
    // Simplified evaluation based on annotations
    const annotation = move.whiteMove?.annotation || move.blackMove?.annotation || '';
    
    if (annotation.includes('!!')) return 200;
    if (annotation.includes('!')) return 100;
    if (annotation.includes('??')) return -200;
    if (annotation.includes('?')) return -100;
    
    return 0;
  }

  /**
   * Generate FEN position (simplified)
   */
  private generateFEN(moves: AnnotatedMove[], moveIndex: number): string {
    // Simplified FEN generation - in practice, this would use a chess engine
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  /**
   * Evaluate overall game quality
   */
  private evaluateGame(moves: AnnotatedMove[], highlights: TacticalHighlight[]): GameEvaluation {
    const finalResult = this.determineResult(moves);
    const whiteAdvantage = this.calculateAdvantage(highlights);
    const criticalMoments = highlights.map(h => h.moveNumber);
    const gameQuality = this.assessGameQuality(moves, highlights);

    return {
      finalResult,
      whiteAdvantage,
      criticalMoments,
      gameQuality
    };
  }

  /**
   * Determine game result
   */
  private determineResult(moves: AnnotatedMove[]): string {
    const lastMove = moves[moves.length - 1];
    
    if (lastMove?.whiteMove?.checkmate || lastMove?.blackMove?.checkmate) {
      return lastMove.whiteMove?.checkmate ? '1-0' : '0-1';
    }
    
    // Check for draw conditions (simplified)
    return '1/2-1/2';
  }

  /**
   * Calculate white advantage
   */
  private calculateAdvantage(highlights: TacticalHighlight[]): number {
    return highlights.reduce((sum, h) => sum + h.evaluation, 0);
  }

  /**
   * Assess game quality
   */
  private assessGameQuality(moves: AnnotatedMove[], highlights: TacticalHighlight[]): GameEvaluation['gameQuality'] {
    const brilliantMoves = highlights.filter(h => h.type === 'brilliant').length;
    const blunders = highlights.filter(h => h.type === 'blunder').length;
    const moveCount = moves.length;

    if (brilliantMoves > 2 && blunders === 0) return 'excellent';
    if (brilliantMoves > 0 && blunders <= 1) return 'good';
    if (blunders <= 2) return 'average';
    return 'poor';
  }

  /**
   * Generate game title
   */
  private generateTitle(metadata: GameMetadata, opening: OpeningInfo, evaluation: GameEvaluation): string {
    const white = metadata.white || 'White';
    const black = metadata.black || 'Black';
    const event = metadata.event || 'Game';
    
    if (evaluation.finalResult === '1-0') {
      return `${white} vs ${black}: A Masterful Victory in ${opening.name}`;
    } else if (evaluation.finalResult === '0-1') {
      return `${black} vs ${white}: Tactical Brilliance in ${opening.name}`;
    } else {
      return `${white} vs ${black}: A Hard-Fought Draw in ${opening.name}`;
    }
  }

  /**
   * Generate game summary
   */
  private generateSummary(
    metadata: GameMetadata,
    opening: OpeningInfo,
    highlights: TacticalHighlight[],
    evaluation: GameEvaluation
  ): string {
    const white = metadata.white || 'White';
    const black = metadata.black || 'Black';
    const event = metadata.event || 'this game';
    
    const brilliantCount = highlights.filter(h => h.type === 'brilliant').length;
    const tacticalCount = highlights.filter(h => h.type === 'tactical').length;
    
    let summary = `${white} and ${black} contested ${event} using the ${opening.name}. `;
    
    if (brilliantCount > 0) {
      summary += `The game featured ${brilliantCount} brilliant moves and ${tacticalCount} tactical moments. `;
    }
    
    if (evaluation.gameQuality === 'excellent') {
      summary += `This was an excellent game with high-quality play from both sides.`;
    } else if (evaluation.gameQuality === 'good') {
      summary += `Both players showed good understanding of the position.`;
    } else {
      summary += `The game had its ups and downs with some interesting moments.`;
    }
    
    return summary;
  }

  /**
   * Get current game data
   */
  getGameData(): ChessGame | null {
    return this.gameData;
  }

  /**
   * Export game as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.gameData, null, 2);
  }
}

// Export singleton instance
export const kimiChessBrain = new KimiChessBrain();

/*
 * FEEDBACK FOR KIMI 2:
 * 
 * 1. BRILLIANT/BLUNDER DETECTION:
 *    - Integrate Stockfish engine for accurate move evaluation
 *    - Add depth analysis to detect deep tactical combinations
 *    - Consider position complexity and calculation difficulty
 *    - Implement machine learning for pattern recognition
 * 
 * 2. STOCKFISH INTEGRATION:
 *    - Add Stockfish.js for client-side analysis
 *    - Implement multi-variation analysis
 *    - Add engine evaluation at each move
 *    - Consider cloud-based Stockfish for deeper analysis
 * 
 * 3. LANGUAGE TONE IMPROVEMENTS:
 *    - Make summaries more engaging and story-like
 *    - Add emotional context to tactical descriptions
 *    - Vary language based on game quality and player strength
 *    - Include historical context for famous openings
 * 
 * 4. ADDITIONAL ENHANCEMENTS:
 *    - Add opening tree visualization
 *    - Implement endgame tablebase integration
 *    - Add player style analysis
 *    - Include game statistics and metrics
 *    - Add comparison with similar games in database
 */ 