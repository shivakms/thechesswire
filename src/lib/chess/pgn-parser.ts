/**
 * Centralized PGN Parser Library
 * 
 * This module provides a unified interface for PGN parsing across the entire platform.
 * It eliminates duplicate PGN parsing logic and provides consistent error handling.
 */

import { Chess } from 'chess.js';

export interface ParsedPGN {
  isValid: boolean;
  error?: string;
  metadata?: GameMetadata;
  moves?: ParsedMove[];
  game?: Chess;
  rawPgn?: string;
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
  opening?: string;
  termination?: string;
}

export interface ParsedMove {
  moveNumber: number;
  whiteMove?: Move;
  blackMove?: Move;
  fen: string;
  evaluation?: number;
  comment?: string;
  annotation?: string;
}

export interface Move {
  san: string;
  lan?: string;
  from: string;
  to: string;
  piece: string;
  capture?: boolean;
  check?: boolean;
  checkmate?: boolean;
  promotion?: string;
  castle?: 'O-O' | 'O-O-O';
  enPassant?: boolean;
}

export class PGNParser {
  private static instance: PGNParser;
  private chess: Chess;

  private constructor() {
    this.chess = new Chess();
  }

  public static getInstance(): PGNParser {
    if (!PGNParser.instance) {
      PGNParser.instance = new PGNParser();
    }
    return PGNParser.instance;
  }

  /**
   * Parse PGN string and return structured data
   */
  public parsePGN(pgnString: string): ParsedPGN {
    try {
      // Reset chess instance
      this.chess = new Chess();
      
      // Validate input
      if (!pgnString || typeof pgnString !== 'string') {
        return {
          isValid: false,
          error: 'Invalid PGN input: must be a non-empty string'
        };
      }

      const trimmedPgn = pgnString.trim();
      if (trimmedPgn.length === 0) {
        return {
          isValid: false,
          error: 'Empty PGN string'
        };
      }

      // Load PGN into chess instance
      try {
        this.chess.loadPgn(trimmedPgn);
      } catch (error) {
        return {
          isValid: false,
          error: `Invalid PGN format: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Extract metadata
      const metadata = this.extractMetadata();
      
      // Extract moves
      const moves = this.extractMoves();

      return {
        isValid: true,
        metadata,
        moves,
        game: this.chess,
        rawPgn: trimmedPgn
      };

    } catch (error) {
      return {
        isValid: false,
        error: `PGN parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract game metadata from PGN headers
   */
  private extractMetadata(): GameMetadata {
    const headers = this.chess.header();
    
    return {
      event: headers.Event || undefined,
      site: headers.Site || undefined,
      date: headers.Date || undefined,
      round: headers.Round || undefined,
      white: headers.White || undefined,
      black: headers.Black || undefined,
      result: headers.Result || undefined,
      whiteElo: headers.WhiteElo || undefined,
      blackElo: headers.BlackElo || undefined,
      timeControl: headers.TimeControl || undefined,
      eco: headers.ECO || undefined,
      opening: headers.Opening || undefined,
      termination: headers.Termination || undefined
    };
  }

  /**
   * Extract moves with detailed information
   */
  private extractMoves(): ParsedMove[] {
    const history = this.chess.history({ verbose: true });
    const moves: ParsedMove[] = [];
    
    // Create a temporary chess instance for position analysis
    const tempChess = new Chess();
    
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      tempChess.move(move);
      
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhiteMove = i % 2 === 0;
      
      const parsedMove: Move = {
        san: move.san,
        lan: move.lan,
        from: move.from,
        to: move.to,
        piece: move.piece,
        capture: move.captured !== undefined,
        check: move.san.includes('+'),
        checkmate: move.san.includes('#'),
        promotion: move.promotion,
        castle: move.san === 'O-O' ? 'O-O' : move.san === 'O-O-O' ? 'O-O-O' : undefined,
        enPassant: move.flags === 'e'
      };

      if (isWhiteMove) {
        // White move
        moves.push({
          moveNumber,
          whiteMove: parsedMove,
          fen: tempChess.fen(),
          evaluation: this.calculatePositionEvaluation(tempChess),
          comment: this.generateMoveComment(parsedMove, moveNumber),
          annotation: this.determineAnnotation(parsedMove)
        });
      } else {
        // Black move - update the last move entry
        const lastMove = moves[moves.length - 1];
        if (lastMove) {
          lastMove.blackMove = parsedMove;
          lastMove.fen = tempChess.fen();
          lastMove.evaluation = this.calculatePositionEvaluation(tempChess);
        }
      }
    }

    return moves;
  }

  /**
   * Calculate position evaluation (simplified - in production, use Stockfish)
   */
  private calculatePositionEvaluation(chess: Chess): number {
    // This is a simplified evaluation
    // In production, integrate with Stockfish or similar chess engine
    const material = this.calculateMaterialAdvantage(chess);
    const position = this.calculatePositionalAdvantage(chess);
    return (material + position) / 100; // Normalize to centipawns
  }

  /**
   * Calculate material advantage
   */
  private calculateMaterialAdvantage(chess: Chess): number {
    const fen = chess.fen();
    const pieces = fen.split(' ')[0];
    
    let whiteMaterial = 0;
    let blackMaterial = 0;
    
    const pieceValues: { [key: string]: number } = {
      'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000,
      'p': -100, 'n': -320, 'b': -330, 'r': -500, 'q': -900, 'k': -20000
    };
    
    for (const char of pieces) {
      if (char in pieceValues) {
        if (pieceValues[char] > 0) {
          whiteMaterial += pieceValues[char];
        } else {
          blackMaterial += Math.abs(pieceValues[char]);
        }
      }
    }
    
    return whiteMaterial - blackMaterial;
  }

  /**
   * Calculate positional advantage
   */
  private calculatePositionalAdvantage(chess: Chess): number {
    // Simplified positional evaluation
    // In production, use more sophisticated algorithms
    return 0;
  }

  /**
   * Generate move comment
   */
  private generateMoveComment(move: Move, moveNumber: number): string {
    const comments: string[] = [];
    
    if (move.checkmate) {
      comments.push('Checkmate!');
    } else if (move.check) {
      comments.push('Check');
    }
    
    if (move.capture) {
      comments.push('Capture');
    }
    
    if (move.castle) {
      comments.push('Castling');
    }
    
    if (move.promotion) {
      comments.push(`Promotion to ${move.promotion}`);
    }
    
    return comments.join(', ');
  }

  /**
   * Determine move annotation
   */
  private determineAnnotation(move: Move): string {
    // This is a simplified annotation system
    // In production, use chess engine analysis
    if (move.checkmate) return '!!';
    if (move.check) return '!';
    if (move.capture) return 'x';
    return '';
  }

  /**
   * Validate PGN format without parsing
   */
  public validatePGN(pgnString: string): { isValid: boolean; error?: string } {
    try {
      const tempChess = new Chess();
      tempChess.loadPgn(pgnString);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid PGN format'
      };
    }
  }

  /**
   * Extract basic move list from PGN
   */
  public extractMoveList(pgnString: string): string[] {
    const parsed = this.parsePGN(pgnString);
    if (!parsed.isValid || !parsed.moves) {
      return [];
    }
    
    const moves: string[] = [];
    parsed.moves.forEach(move => {
      if (move.whiteMove) {
        moves.push(move.whiteMove.san);
      }
      if (move.blackMove) {
        moves.push(move.blackMove.san);
      }
    });
    
    return moves;
  }

  /**
   * Get game result
   */
  public getGameResult(pgnString: string): string {
    const parsed = this.parsePGN(pgnString);
    if (!parsed.isValid || !parsed.game) {
      return '*';
    }
    
    if (parsed.game.isCheckmate()) {
      return parsed.game.turn() === 'w' ? '0-1' : '1-0';
    }
    
    if (parsed.game.isDraw()) {
      return '1/2-1/2';
    }
    
    if (parsed.game.isStalemate()) {
      return '1/2-1/2';
    }
    
    return parsed.metadata?.result || '*';
  }

  /**
   * Get game length in moves
   */
  public getGameLength(pgnString: string): number {
    const parsed = this.parsePGN(pgnString);
    if (!parsed.isValid || !parsed.moves) {
      return 0;
    }
    
    return parsed.moves.length;
  }
}

// Export singleton instance
export const pgnParser = PGNParser.getInstance();

// Export utility functions
export const parsePGN = (pgnString: string) => pgnParser.parsePGN(pgnString);
export const validatePGN = (pgnString: string) => pgnParser.validatePGN(pgnString);
export const extractMoveList = (pgnString: string) => pgnParser.extractMoveList(pgnString);
export const getGameResult = (pgnString: string) => pgnParser.getGameResult(pgnString);
export const getGameLength = (pgnString: string) => pgnParser.getGameLength(pgnString); 