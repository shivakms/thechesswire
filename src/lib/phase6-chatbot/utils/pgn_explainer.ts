// Phase 6: PGN Explainer Utility for Bambai AI Assistant

import { VectorDocument } from '../types';
import logger from '@/lib/logger';

export interface PGNMove {
  moveNumber: number;
  whiteMove?: string;
  blackMove?: string;
  annotation?: string;
  comment?: string;
}

export interface PGNAnalysis {
  metadata: {
    event?: string;
    site?: string;
    date?: string;
    white?: string;
    black?: string;
    result?: string;
    whiteElo?: string;
    blackElo?: string;
    opening?: string;
    eco?: string;
  };
  moves: PGNMove[];
  analysis: {
    opening: string;
    middlegame: string;
    endgame: string;
    tactics: string[];
    mistakes: string[];
    highlights: string[];
  };
  summary: string;
}

export class PGNExplainer {
  private openingDatabase: Map<string, string> = new Map();
  private tacticalPatterns: Map<string, string> = new Map();

  constructor() {
    this.initializeOpeningDatabase();
    this.initializeTacticalPatterns();
  }

  private initializeOpeningDatabase(): void {
    // Common chess openings
    this.openingDatabase.set('1.e4 e5', 'Open Game');
    this.openingDatabase.set('1.e4 e5 2.Nf3', 'Open Game - King\'s Knight');
    this.openingDatabase.set('1.e4 e5 2.Nf3 Nc6', 'Open Game - Two Knights');
    this.openingDatabase.set('1.e4 e5 2.Nf3 Nc6 3.Bb5', 'Ruy Lopez');
    this.openingDatabase.set('1.e4 c5', 'Sicilian Defense');
    this.openingDatabase.set('1.e4 c5 2.Nf3', 'Sicilian Defense - Open');
    this.openingDatabase.set('1.e4 c5 2.Nf3 d6', 'Sicilian Defense - Najdorf');
    this.openingDatabase.set('1.e4 e6', 'French Defense');
    this.openingDatabase.set('1.e4 e6 2.d4', 'French Defense - Advance');
    this.openingDatabase.set('1.e4 c6', 'Caro-Kann Defense');
    this.openingDatabase.set('1.d4', 'Closed Game');
    this.openingDatabase.set('1.d4 Nf6', 'Indian Defense');
    this.openingDatabase.set('1.d4 Nf6 2.c4', 'Indian Defense - Queen\'s Indian');
    this.openingDatabase.set('1.d4 Nf6 2.c4 e6', 'Indian Defense - Nimzo-Indian');
    this.openingDatabase.set('1.d4 Nf6 2.c4 g6', 'Indian Defense - King\'s Indian');
    this.openingDatabase.set('1.d4 d5', 'Closed Game - Queen\'s Pawn');
    this.openingDatabase.set('1.d4 d5 2.c4', 'Queen\'s Gambit');
    this.openingDatabase.set('1.d4 d5 2.c4 e6', 'Queen\'s Gambit - Declined');
    this.openingDatabase.set('1.d4 d5 2.c4 dxc4', 'Queen\'s Gambit - Accepted');
  }

  private initializeTacticalPatterns(): void {
    this.tacticalPatterns.set('fork', 'A move that attacks two or more pieces simultaneously');
    this.tacticalPatterns.set('pin', 'A move that prevents a piece from moving because it would expose a more valuable piece');
    this.tacticalPatterns.set('skewer', 'A move that attacks two pieces in a line, forcing the first to move and allowing capture of the second');
    this.tacticalPatterns.set('discovered_attack', 'A move that reveals an attack from another piece');
    this.tacticalPatterns.set('double_check', 'A move that delivers check from two pieces simultaneously');
    this.tacticalPatterns.set('back_rank_mate', 'Checkmate delivered on the back rank, often with a rook or queen');
    this.tacticalPatterns.set('smothered_mate', 'Checkmate delivered by a knight when the king is surrounded by its own pieces');
  }

  async analyzePGN(pgnText: string): Promise<PGNAnalysis> {
    try {
      const metadata = this.extractMetadata(pgnText);
      const moves = this.parseMoves(pgnText);
      const analysis = await this.analyzeGame(moves);
      const summary = this.generateSummary(metadata, analysis);

      return {
        metadata,
        moves,
        analysis,
        summary,
      };
    } catch (error) {
      logger.error('❌ Error analyzing PGN', error);
      throw new Error('Failed to analyze PGN');
    }
  }

  private extractMetadata(pgnText: string): PGNAnalysis['metadata'] {
    const metadata: PGNAnalysis['metadata'] = {};
    
    const metadataRegex = /\[(\w+)\s+"([^"]*)"\]/g;
    let match;
    
    while ((match = metadataRegex.exec(pgnText)) !== null) {
      const [, key, value] = match;
      metadata[key as keyof PGNAnalysis['metadata']] = value;
    }

    return metadata;
  }

  private parseMoves(pgnText: string): PGNMove[] {
    const moves: PGNMove[] = [];
    
    // Remove metadata and comments
    const movesText = pgnText.replace(/\[.*?\]/g, '').replace(/\{.*?\}/g, '');
    
    // Match move patterns
    const moveRegex = /(\d+)\.\s*([^\s]+)(?:\s+([^\s]+))?/g;
    let match;
    
    while ((match = moveRegex.exec(movesText)) !== null) {
      const [, moveNumber, whiteMove, blackMove] = match;
      
      moves.push({
        moveNumber: parseInt(moveNumber),
        whiteMove: whiteMove || undefined,
        blackMove: blackMove || undefined,
      });
    }

    return moves;
  }

  private async analyzeGame(moves: PGNMove[]): Promise<PGNAnalysis['analysis']> {
    const opening = this.identifyOpening(moves);
    const middlegame = this.analyzeMiddlegame(moves);
    const endgame = this.analyzeEndgame(moves);
    const tactics = this.identifyTactics(moves);
    const mistakes = this.identifyMistakes(moves);
    const highlights = this.identifyHighlights(moves);

    return {
      opening,
      middlegame,
      endgame,
      tactics,
      mistakes,
      highlights,
    };
  }

  private identifyOpening(moves: PGNMove[]): string {
    if (moves.length === 0) return 'Unknown Opening';

    const firstMoves = moves.slice(0, 5);
    const moveSequence = firstMoves
      .map(move => `${move.whiteMove}${move.blackMove ? ' ' + move.blackMove : ''}`)
      .join(' ')
      .trim();

    // Try to match with opening database
    for (const [sequence, opening] of this.openingDatabase) {
      if (moveSequence.startsWith(sequence)) {
        return opening;
      }
    }

    return 'Unknown Opening';
  }

  private analyzeMiddlegame(moves: PGNMove[]): string {
    if (moves.length < 10) return 'Game ended before middlegame';

    const middlegameMoves = moves.slice(10, Math.min(30, moves.length));
    
    // Analyze middlegame characteristics
    const pawnMoves = middlegameMoves.filter(move => 
      (move.whiteMove?.includes('P') || move.whiteMove?.match(/[a-h][2-7]/)) ||
      (move.blackMove?.includes('P') || move.blackMove?.match(/[a-h][2-7]/))
    ).length;

    const pieceMoves = middlegameMoves.length - pawnMoves;
    
    if (pieceMoves > pawnMoves) {
      return 'Active piece play with tactical opportunities';
    } else {
      return 'Positional play with pawn structure focus';
    }
  }

  private analyzeEndgame(moves: PGNMove[]): string {
    if (moves.length < 30) return 'Game ended before endgame';

    const endgameMoves = moves.slice(30);
    const pieceCount = this.countPieces(endgameMoves);

    if (pieceCount <= 6) {
      return 'Simplified endgame with few pieces';
    } else if (pieceCount <= 12) {
      return 'Complex endgame with multiple pieces';
    } else {
      return 'Late middlegame transitioning to endgame';
    }
  }

  private countPieces(moves: PGNMove[]): number {
    // Simplified piece counting
    let pieceCount = 32; // Starting piece count
    
    for (const move of moves) {
      if (move.whiteMove?.includes('x') || move.blackMove?.includes('x')) {
        pieceCount -= 1; // Assume one capture per move
      }
    }

    return Math.max(pieceCount, 0);
  }

  private identifyTactics(moves: PGNMove[]): string[] {
    const tactics: string[] = [];
    
    for (const move of moves) {
      if (move.whiteMove?.includes('+')) {
        tactics.push(`Check delivered by White on move ${move.moveNumber}`);
      }
      if (move.blackMove?.includes('+')) {
        tactics.push(`Check delivered by Black on move ${move.moveNumber}`);
      }
      if (move.whiteMove?.includes('x') || move.blackMove?.includes('x')) {
        tactics.push(`Capture on move ${move.moveNumber}`);
      }
    }

    return tactics.slice(0, 5); // Limit to top 5 tactics
  }

  private identifyMistakes(moves: PGNMove[]): string[] {
    const mistakes: string[] = [];
    
    // This would typically involve engine analysis
    // For now, we'll identify obvious blunders
    for (const move of moves) {
      if (move.whiteMove?.includes('??') || move.blackMove?.includes('??')) {
        mistakes.push(`Blunder on move ${move.moveNumber}`);
      } else if (move.whiteMove?.includes('?') || move.blackMove?.includes('?')) {
        mistakes.push(`Mistake on move ${move.moveNumber}`);
      }
    }

    return mistakes;
  }

  private identifyHighlights(moves: PGNMove[]): string[] {
    const highlights: string[] = [];
    
    for (const move of moves) {
      if (move.whiteMove?.includes('!') || move.blackMove?.includes('!')) {
        highlights.push(`Excellent move on move ${move.moveNumber}`);
      }
      if (move.whiteMove?.includes('!!') || move.blackMove?.includes('!!')) {
        highlights.push(`Brilliant move on move ${move.moveNumber}`);
      }
    }

    return highlights.slice(0, 3); // Limit to top 3 highlights
  }

  private generateSummary(metadata: PGNAnalysis['metadata'], analysis: PGNAnalysis['analysis']): string {
    const players = `${metadata.white || 'White'} vs ${metadata.black || 'Black'}`;
    const result = metadata.result || 'Unknown result';
    const opening = analysis.opening;
    
    return `A ${opening} game between ${players} that ended in ${result}. The game featured ${analysis.tactics.length} tactical moments and ${analysis.highlights.length} notable moves.`;
  }

  async createVectorDocument(pgnText: string): Promise<VectorDocument> {
    const analysis = await this.analyzePGN(pgnText);
    
    return {
      id: `pgn-${Date.now()}`,
      content: `Chess game analysis: ${analysis.summary}. Opening: ${analysis.analysis.opening}. Tactics: ${analysis.analysis.tactics.join(', ')}.`,
      metadata: {
        source: 'pgn_analysis',
        type: 'pgn',
        title: `${analysis.metadata.white} vs ${analysis.metadata.black}`,
        author: 'Bambai AI',
        date: analysis.metadata.date || new Date().toISOString(),
        tags: ['chess', 'analysis', 'pgn'],
      },
    };
  }
}

// Singleton instance
export const pgnExplainer = new PGNExplainer(); 