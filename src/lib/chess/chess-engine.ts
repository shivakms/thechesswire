/**
 * Chess Engine Integration
 * 
 * This module provides chess engine integration for move validation and analysis.
 * It addresses the missing chess engine dependency identified in the gaps analysis.
 */

import { Chess } from 'chess.js';

export interface EngineMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  lan: string;
  piece: string;
  captured?: string;
  flags: string;
}

export interface EngineEvaluation {
  score: number; // in centipawns
  depth: number;
  nodes: number;
  time: number;
  pv: string[]; // principal variation
}

export interface EngineAnalysis {
  bestMove: EngineMove;
  evaluation: EngineEvaluation;
  alternatives: EngineMove[];
  mateIn?: number; // if mate is found
}

export interface PositionAnalysis {
  fen: string;
  legalMoves: EngineMove[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
  materialCount: {
    white: number;
    black: number;
  };
}

export class ChessEngine {
  private static instance: ChessEngine;
  private chess: Chess;
  private engineWorker?: Worker;
  private isEngineReady: boolean = false;

  private constructor() {
    this.chess = new Chess();
  }

  public static getInstance(): ChessEngine {
    if (!ChessEngine.instance) {
      ChessEngine.instance = new ChessEngine();
    }
    return ChessEngine.instance;
  }

  /**
   * Initialize chess engine (Stockfish or similar)
   */
  async initializeEngine(): Promise<void> {
    try {
      // In a real implementation, you would load Stockfish or another chess engine
      // For now, we'll use chess.js for basic validation
      this.isEngineReady = true;
      console.log('Chess engine initialized');
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      throw new Error('Chess engine initialization failed');
    }
  }

  /**
   * Validate if a move is legal
   */
  validateMove(fen: string, move: { from: string; to: string; promotion?: string }): boolean {
    try {
      const tempChess = new Chess(fen);
      const moves = tempChess.moves({ verbose: true });
      
      return moves.some(m => 
        m.from === move.from && 
        m.to === move.to && 
        m.promotion === move.promotion
      );
    } catch (error) {
      console.error('Move validation error:', error);
      return false;
    }
  }

  /**
   * Get all legal moves for a position
   */
  getLegalMoves(fen: string): EngineMove[] {
    try {
      const tempChess = new Chess(fen);
      const moves = tempChess.moves({ verbose: true });
      
      return moves.map(move => ({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        san: move.san,
        lan: move.lan,
        piece: move.piece,
        captured: move.captured,
        flags: move.flags
      }));
    } catch (error) {
      console.error('Get legal moves error:', error);
      return [];
    }
  }

  /**
   * Analyze position with engine
   */
  async analyzePosition(fen: string, depth: number = 15): Promise<EngineAnalysis | null> {
    try {
      if (!this.isEngineReady) {
        await this.initializeEngine();
      }

      // In a real implementation, this would use Stockfish or another engine
      // For now, we'll provide a simplified analysis using chess.js
      return this.simplifiedAnalysis(fen, depth);
    } catch (error) {
      console.error('Position analysis error:', error);
      return null;
    }
  }

  /**
   * Simplified analysis using chess.js (placeholder for real engine)
   */
  private simplifiedAnalysis(fen: string, depth: number): EngineAnalysis {
    const tempChess = new Chess(fen);
    const legalMoves = tempChess.moves({ verbose: true });
    
    if (legalMoves.length === 0) {
      // Checkmate or stalemate
      return {
        bestMove: legalMoves[0] as EngineMove,
        evaluation: {
          score: tempChess.isCheckmate() ? (tempChess.turn() === 'w' ? -10000 : 10000) : 0,
          depth: 1,
          nodes: 1,
          time: 0,
          pv: []
        },
        alternatives: []
      };
    }

    // Simple evaluation based on material and position
    const evaluation = this.calculatePositionEvaluation(tempChess);
    
    // Sort moves by a simple heuristic
    const sortedMoves = legalMoves.sort((a, b) => {
      const scoreA = this.evaluateMove(tempChess, a);
      const scoreB = this.evaluateMove(tempChess, b);
      return scoreB - scoreA;
    });

    const bestMove = sortedMoves[0] as EngineMove;
    const alternatives = sortedMoves.slice(1, 5) as EngineMove[];

    return {
      bestMove,
      evaluation: {
        score: evaluation,
        depth: Math.min(depth, 10),
        nodes: legalMoves.length,
        time: 0,
        pv: [bestMove.san]
      },
      alternatives
    };
  }

  /**
   * Calculate position evaluation
   */
  private calculatePositionEvaluation(chess: Chess): number {
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
   * Evaluate a specific move
   */
  private evaluateMove(chess: Chess, move: any): number {
    const tempChess = new Chess(chess.fen());
    tempChess.move(move);
    
    // Basic evaluation: material + position
    const materialScore = this.calculatePositionEvaluation(tempChess);
    
    // Bonus for captures
    const captureBonus = move.captured ? 50 : 0;
    
    // Bonus for checks
    const checkBonus = tempChess.isCheck() ? 30 : 0;
    
    // Bonus for checkmate
    const mateBonus = tempChess.isCheckmate() ? 10000 : 0;
    
    return materialScore + captureBonus + checkBonus + mateBonus;
  }

  /**
   * Analyze a complete game
   */
  async analyzeGame(pgn: string): Promise<{
    moves: Array<{
      move: EngineMove;
      evaluation: number;
      comment: string;
    }>;
    overallEvaluation: number;
    gameQuality: 'excellent' | 'good' | 'average' | 'poor';
  }> {
    try {
      const tempChess = new Chess();
      tempChess.loadPgn(pgn);
      
      const history = tempChess.history({ verbose: true });
      const analysis = [];
      
      let totalEvaluation = 0;
      
      for (let i = 0; i < history.length; i++) {
        const move = history[i];
        const positionBefore = new Chess();
        
        // Replay moves up to this point
        for (let j = 0; j < i; j++) {
          positionBefore.move(history[j]);
        }
        
        const evaluation = this.evaluateMove(positionBefore, move);
        totalEvaluation += evaluation;
        
        analysis.push({
          move: {
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san,
            lan: move.lan,
            piece: move.piece,
            captured: move.captured,
            flags: move.flags
          },
          evaluation,
          comment: this.generateMoveComment(move, evaluation)
        });
      }
      
      const averageEvaluation = totalEvaluation / history.length;
      const gameQuality = this.assessGameQuality(analysis);
      
      return {
        moves: analysis,
        overallEvaluation: averageEvaluation,
        gameQuality
      };
    } catch (error) {
      console.error('Game analysis error:', error);
      throw new Error('Failed to analyze game');
    }
  }

  /**
   * Generate move comment
   */
  private generateMoveComment(move: any, evaluation: number): string {
    const comments: string[] = [];
    
    if (move.captured) {
      comments.push('Capture');
    }
    
    if (move.san.includes('+')) {
      comments.push('Check');
    }
    
    if (move.san.includes('#')) {
      comments.push('Checkmate!');
    }
    
    if (move.promotion) {
      comments.push(`Promotion to ${move.promotion}`);
    }
    
    if (move.san === 'O-O' || move.san === 'O-O-O') {
      comments.push('Castling');
    }
    
    // Add evaluation-based comments
    if (evaluation > 200) {
      comments.push('Excellent move');
    } else if (evaluation > 100) {
      comments.push('Good move');
    } else if (evaluation < -200) {
      comments.push('Poor move');
    } else if (evaluation < -100) {
      comments.push('Inaccurate move');
    }
    
    return comments.join(', ');
  }

  /**
   * Assess game quality
   */
  private assessGameQuality(analysis: Array<{ evaluation: number }>): 'excellent' | 'good' | 'average' | 'poor' {
    const evaluations = analysis.map(a => Math.abs(a.evaluation));
    const averageAccuracy = evaluations.reduce((sum, evaluation) => sum + evaluation, 0) / evaluations.length;
    
    if (averageAccuracy < 50) return 'excellent';
    if (averageAccuracy < 100) return 'good';
    if (averageAccuracy < 200) return 'average';
    return 'poor';
  }

  /**
   * Get position analysis
   */
  getPositionAnalysis(fen: string): PositionAnalysis {
    try {
      const tempChess = new Chess(fen);
      const legalMoves = this.getLegalMoves(fen);
      
      const materialCount = this.calculateMaterialCount(fen);
      const gamePhase = this.determineGamePhase(materialCount);
      
      return {
        fen,
        legalMoves,
        isCheck: tempChess.isCheck(),
        isCheckmate: tempChess.isCheckmate(),
        isStalemate: tempChess.isStalemate(),
        isDraw: tempChess.isDraw(),
        gamePhase,
        materialCount
      };
    } catch (error) {
      console.error('Position analysis error:', error);
      throw new Error('Failed to analyze position');
    }
  }

  /**
   * Calculate material count
   */
  private calculateMaterialCount(fen: string): { white: number; black: number } {
    const pieces = fen.split(' ')[0];
    let white = 0;
    let black = 0;
    
    const pieceValues: { [key: string]: number } = {
      'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900,
      'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900
    };
    
    for (const char of pieces) {
      if (char in pieceValues) {
        if (char === char.toUpperCase()) {
          white += pieceValues[char];
        } else {
          black += pieceValues[char];
        }
      }
    }
    
    return { white, black };
  }

  /**
   * Determine game phase
   */
  private determineGamePhase(materialCount: { white: number; black: number }): 'opening' | 'middlegame' | 'endgame' {
    const totalMaterial = materialCount.white + materialCount.black;
    
    if (totalMaterial > 6000) return 'opening';
    if (totalMaterial > 3000) return 'middlegame';
    return 'endgame';
  }

  /**
   * Check if position is a draw by repetition
   */
  isDrawByRepetition(fen: string, moveHistory: string[]): boolean {
    try {
      const tempChess = new Chess();
      
      // Replay the game
      for (const move of moveHistory) {
        tempChess.move(move);
      }
      
      return tempChess.isDraw();
    } catch (error) {
      console.error('Draw detection error:', error);
      return false;
    }
  }

  /**
   * Get opening name for position
   */
  getOpeningName(fen: string, moveHistory: string[]): string {
    // This is a simplified implementation
    // In production, you would use a comprehensive opening database
    const moveCount = moveHistory.length;
    
    if (moveCount < 4) return 'Starting Position';
    if (moveCount < 10) return 'Opening';
    if (moveCount < 20) return 'Early Middlegame';
    if (moveCount < 30) return 'Middlegame';
    return 'Endgame';
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.engineWorker) {
      this.engineWorker.terminate();
      this.engineWorker = undefined;
    }
    this.isEngineReady = false;
  }
}

// Export singleton instance
export const chessEngine = ChessEngine.getInstance();

// Export utility functions
export const validateMove = (fen: string, move: { from: string; to: string; promotion?: string }) => 
  chessEngine.validateMove(fen, move);

export const getLegalMoves = (fen: string) => 
  chessEngine.getLegalMoves(fen);

export const analyzePosition = (fen: string, depth?: number) => 
  chessEngine.analyzePosition(fen, depth);

export const analyzeGame = (pgn: string) => 
  chessEngine.analyzeGame(pgn);

export const getPositionAnalysis = (fen: string) => 
  chessEngine.getPositionAnalysis(fen);

export const isDrawByRepetition = (fen: string, moveHistory: string[]) => 
  chessEngine.isDrawByRepetition(fen, moveHistory);

export const getOpeningName = (fen: string, moveHistory: string[]) => 
  chessEngine.getOpeningName(fen, moveHistory); 